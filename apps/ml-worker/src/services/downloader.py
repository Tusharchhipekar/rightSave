import asyncio
import re
from dataclasses import dataclass

import httpx
import structlog
import yt_dlp

from config import settings
from messaging.consumer import NonRetryableError

log = structlog.get_logger()

HASHTAG_RE = re.compile(r"#(\w+)", re.UNICODE)
PERMANENT_MARKERS = ("private", "login required", "not available", "unavailable", "removed")


@dataclass
class Downloaded:
    video: bytes
    meta: dict


def _extract(url: str) -> dict:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "format": "best[ext=mp4]/best",
        "socket_timeout": settings.DOWNLOAD_TIMEOUT_SECONDS,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=False)


def _media_url(info: dict) -> tuple[str, dict]:
    if info.get("url"):
        return info["url"], info.get("http_headers") or {}
    for f in info.get("requested_formats") or []:
        if f.get("url") and f.get("vcodec") not in (None, "none"):
            return f["url"], f.get("http_headers") or info.get("http_headers") or {}
    raise NonRetryableError("no downloadable media url")


async def download_video(url: str) -> Downloaded:
    try:
        info = await asyncio.to_thread(_extract, url)
    except yt_dlp.utils.DownloadError as err:
        msg = str(err).lower()
        if any(m in msg for m in PERMANENT_MARKERS):
            raise NonRetryableError(f"unavailable: {str(err)[:200]}") from err
        raise

    duration = info.get("duration")
    if duration and duration > settings.MAX_AUDIO_SECONDS:
        raise NonRetryableError(f"video too long ({int(duration)}s)")

    media_url, headers = _media_url(info)
    chunks: list[bytes] = []
    size = 0
    timeout = httpx.Timeout(settings.DOWNLOAD_TIMEOUT_SECONDS)

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        async with client.stream("GET", media_url, headers=headers) as resp:
            resp.raise_for_status()
            declared = int(resp.headers.get("content-length") or 0)
            if declared > settings.MAX_VIDEO_BYTES:
                raise NonRetryableError(f"video too large ({declared} bytes)")
            async for chunk in resp.aiter_bytes(64 * 1024):
                size += len(chunk)
                if size > settings.MAX_VIDEO_BYTES:
                    raise NonRetryableError("video exceeds MAX_VIDEO_BYTES")
                chunks.append(chunk)

    caption = (info.get("description") or info.get("title") or "").strip() or None
    meta = {
        "creator_username": info.get("uploader") or info.get("channel") or info.get("uploader_id"),
        "caption": caption,
        "hashtags": sorted({t.lower() for t in HASHTAG_RE.findall(caption or "")}),
        "thumbnail_url": info.get("thumbnail"),
    }
    log.info("download.done", bytes=size)
    return Downloaded(video=b"".join(chunks), meta=meta)