import html as htmllib
import re

import httpx
import structlog

from config import settings

log = structlog.get_logger()

OEMBED_URL = "https://graph.facebook.com/v21.0/instagram_oembed"
HASHTAG_RE = re.compile(r"#(\w+)", re.UNICODE)
CAPTION_RE = re.compile(r"<p[^>]*>\s*<a[^>]*>(.*?)</a>", re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")


def _caption_from_html(embed_html: str | None) -> str | None:
    if not embed_html:
        return None
    m = CAPTION_RE.search(embed_html)
    if not m:
        return None
    text = htmllib.unescape(TAG_RE.sub("", m.group(1))).strip()
    return text or None


async def fetch_oembed(url: str) -> dict:
    """
    Best-effort metadata. Never fails the job: if there's no token or the call
    errors, return {} and let the rest of the pipeline continue.
    """
    token = settings.META_OEMBED_TOKEN
    if token is None or not token.get_secret_value().strip():
        return {}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                OEMBED_URL,
                params={
                    "url": url,
                    "access_token": token.get_secret_value(),
                    "omitscript": "true",
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as err:
        log.warning(
            "oembed.failed",
            status=err.response.status_code,
            body=err.response.text[:300],
        )
        return {}
    except (httpx.HTTPError, ValueError) as err:
        log.warning("oembed.failed", error=type(err).__name__)
        return {}

    caption = data.get("title") or _caption_from_html(data.get("html"))
    return {
        "creator_username": data.get("author_name"),
        "caption": caption,
        "hashtags": sorted({t.lower() for t in HASHTAG_RE.findall(caption or "")}),
        "thumbnail_url": data.get("thumbnail_url"),
    }