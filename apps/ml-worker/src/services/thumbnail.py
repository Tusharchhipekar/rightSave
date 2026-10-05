import httpx
import structlog

from config import settings

log = structlog.get_logger()

UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload"
MAX_THUMB_BYTES = 5 * 1024 * 1024


async def store_thumbnail(content_id: str, source_url: str | None) -> str | None:
    """
    Copy the (expiring) IG thumbnail to ImageKit and return the permanent URL.
    Best-effort: returns None on any failure so the job still completes.
    """
    if not source_url:
        return None

    key = settings.IMAGEKIT_PRIVATE_KEY.get_secret_value().strip()
    if not key:
        log.warning("thumbnail.skipped", reason="IMAGEKIT_PRIVATE_KEY not set")
        return None

    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            src = await client.get(source_url)
            src.raise_for_status()
            content_type = src.headers.get("content-type", "image/jpeg").split(";")[0]
            if not content_type.startswith("image/"):
                log.warning("thumbnail.not_image", content_type=content_type)
                return None
            if len(src.content) > MAX_THUMB_BYTES:
                log.warning("thumbnail.too_large", bytes=len(src.content))
                return None

            ext = "png" if content_type == "image/png" else "jpg"
            resp = await client.post(
                UPLOAD_URL,
                auth=(key, ""),
                files={"file": (f"{content_id}.{ext}", src.content, content_type)},
                data={
                    "fileName": f"{content_id}.{ext}",
                    "folder": "/thumbs",
                    "useUniqueFileName": "false",
                    "overwriteFile": "true",
                },
            )
            resp.raise_for_status()
            url = resp.json().get("url")
            log.info("thumbnail.stored", content_id=content_id)
            return url
    except httpx.HTTPStatusError as err:
        log.warning(
            "thumbnail.failed",
            status=err.response.status_code,
            body=err.response.text[:200],
        )
    except (httpx.HTTPError, ValueError) as err:
        log.warning("thumbnail.failed", error=type(err).__name__)
    return None