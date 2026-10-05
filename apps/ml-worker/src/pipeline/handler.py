from datetime import datetime, timezone

import structlog
from pydantic import ValidationError

from config import settings
from messaging.consumer import NonRetryableError
from messaging.producer import publish_failed, publish_processing, publish_ready
from schemas.schemas import ContentIngest
from services.downloader import download_video
from services.embedder import embed_text
from services.oembed import fetch_oembed
from transcribes.router import transcribe

log = structlog.get_logger()

SUPPORTED_TYPES = {"reel"}  # post / screenshot / tweet / notion_page come later


async def handle_ingest(payload: dict) -> None:
    try:
        job = ContentIngest.model_validate(payload)
    except ValidationError as err:
        raise NonRetryableError(f"invalid ingest payload: {err}") from err

    cid, uid = job.contentId, job.userId
    bound = log.bind(content_id=cid, user_id=uid, type=job.type)

    if job.type not in SUPPORTED_TYPES:
        await publish_failed(cid, uid, error=f"unsupported type: {job.type}", retryable=False)
        raise NonRetryableError(f"unsupported type: {job.type}")

    age = (datetime.now(timezone.utc) - job.receivedAt).total_seconds()
    if age > settings.MAX_JOB_AGE_SECONDS:
        # CDN link is likely expired; the API-side sweeper can re-queue it
        await publish_failed(cid, uid, error=f"job too old ({int(age)}s)", retryable=True)
        bound.warning("pipeline.skipped_stale", age_s=int(age))
        return

    await publish_processing(cid, uid)
    bound.info("pipeline.started")

    source_url = str(job.sourceUrl)

    meta = await fetch_oembed(source_url)  # caption, creator, hashtags, thumbnail
    video = await download_video(source_url)  # bytes, in memory only
    transcript = await transcribe(video)
    del video  # never keep media bytes

    embed_input = " ".join(
        part
        for part in (
            meta.get("caption"),
            " ".join(meta.get("hashtags", [])),
            transcript,
        )
        if part
    )
    embedding = await embed_text(embed_input)

    await publish_ready(
        cid,
        uid,
        embedding=embedding,
        media_type="video",
        creator_username=meta.get("creator_username"),
        caption=meta.get("caption"),
        hashtags=meta.get("hashtags", []),
        thumbnail_url=meta.get("thumbnail_url"),
        transcript=transcript,
    )
    bound.info("pipeline.ready")