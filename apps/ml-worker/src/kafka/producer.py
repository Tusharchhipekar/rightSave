import json
from datetime import datetime, timezone
from typing import Any

from aiokafka import AIOKafkaProducer

from config import settings
from messaging.client import connection_kwargs

_producer: AIOKafkaProducer | None = None


async def _get_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        p = AIOKafkaProducer(
            **connection_kwargs(),
            acks="all",
            enable_idempotence=True,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8"),
        )
        await p.start()
        _producer = p
    return _producer


async def publish(topic: str, key: str, payload: dict[str, Any]) -> None:
    p = await _get_producer()
    await p.send_and_wait(topic, value=payload, key=key)


async def stop_producer() -> None:
    global _producer
    if _producer is not None:
        await _producer.stop()
        _producer = None


# --- content-processed events (shape must match ContentProcessedSchema in packages/kafka) ---


async def publish_processing(content_id: str, user_id: str) -> None:
    await publish(
        settings.TOPIC_PROCESSED,
        content_id,
        {"contentId": content_id, "userId": user_id, "status": "processing"},
    )


async def publish_ready(
    content_id: str,
    user_id: str,
    *,
    embedding: list[float],
    media_type: str | None = None,
    creator_username: str | None = None,
    caption: str | None = None,
    hashtags: list[str] | None = None,
    thumbnail_url: str | None = None,
    transcript: str | None = None,
    ocr_text: str | None = None,
    vision_caption: str | None = None,
    tags: list[str] | None = None,
) -> None:
    if len(embedding) != settings.EMBED_DIMENSIONS:
        raise ValueError(
            f"embedding has {len(embedding)} dims, expected {settings.EMBED_DIMENSIONS}"
        )
    await publish(
        settings.TOPIC_PROCESSED,
        content_id,
        {
            "contentId": content_id,
            "userId": user_id,
            "status": "ready",
            "mediaType": media_type,
            "creatorUsername": creator_username,
            "caption": caption,
            "hashtags": hashtags or [],
            "thumbnailUrl": thumbnail_url,
            "transcript": transcript,
            "ocrText": ocr_text,
            "visionCaption": vision_caption,
            "tags": tags or [],
            "embedding": embedding,
        },
    )


async def publish_failed(
    content_id: str, user_id: str, *, error: str, retryable: bool
) -> None:
    await publish(
        settings.TOPIC_PROCESSED,
        content_id,
        {
            "contentId": content_id,
            "userId": user_id,
            "status": "failed",
            "error": error[:1000],
            "retryable": retryable,
        },
    )


async def publish_dlq(topic: str, key: str | None, raw: str, error: str) -> None:
    """Same shape as DlqPayload in packages/kafka."""
    await publish(
        f"{topic}.dlq",
        key or "unknown",
        {
            "originalTopic": topic,
            "raw": raw,
            "error": error[:1000],
            "failedAt": datetime.now(timezone.utc).isoformat(),
        },
    )