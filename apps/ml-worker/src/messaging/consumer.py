import asyncio
import json
from collections.abc import Awaitable, Callable
from typing import Any

import structlog
from aiokafka import AIOKafkaConsumer

from config import settings
from messaging.client import connection_kwargs
from messaging.producer import publish_dlq

log = structlog.get_logger()

Handler = Callable[[dict[str, Any]], Awaitable[None]]
DeadLetterHook = Callable[[dict[str, Any] | None, Exception], Awaitable[None]]


class NonRetryableError(Exception):
    """Raise from a handler to skip retries and go straight to the DLQ."""


async def run_consumer(
    topic: str,
    handler: Handler,
    stop: asyncio.Event,
    group_id: str | None = None,
    on_dead_letter: DeadLetterHook | None = None,
) -> None:
    """
    Consume `topic` until `stop` is set. One message at a time, offset committed
    only after the message is handled or dead-lettered, so a crash re-delivers it
    (handlers must be idempotent).
    """
    consumer = AIOKafkaConsumer(
        topic,
        **connection_kwargs(),
        group_id=group_id or settings.KAFKA_GROUP_ID,
        enable_auto_commit=False,
        auto_offset_reset="latest",
        max_poll_records=1,
        max_poll_interval_ms=15 * 60 * 1000,  # downloads + transcription can be slow
    )
    await consumer.start()
    log.info("consumer.started", topic=topic)

    try:
        while not stop.is_set():
            batch = await consumer.getmany(timeout_ms=1000, max_records=1)
            for messages in batch.values():
                for msg in messages:
                    await _process(topic, handler, msg, on_dead_letter)
                    await consumer.commit()
    finally:
        await consumer.stop()
        log.info("consumer.stopped", topic=topic)


async def _process(
    topic: str,
    handler: Handler,
    msg: Any,
    on_dead_letter: DeadLetterHook | None,
) -> None:
    key = msg.key.decode("utf-8") if msg.key else None
    raw = msg.value.decode("utf-8") if msg.value else ""

    last_error: Exception | None = None
    for attempt in range(1, settings.MAX_ATTEMPTS + 1):
        try:
            payload = json.loads(raw)
            await handler(payload)
            return
        except NonRetryableError as err:
            last_error = err
            break
        except json.JSONDecodeError as err:
            last_error = err
            break  # malformed JSON never gets better
        except Exception as err:  # noqa: BLE001
            last_error = err
            log.warning("consumer.attempt_failed", key=key, attempt=attempt, error=str(err))
            if attempt < settings.MAX_ATTEMPTS:
                await asyncio.sleep(settings.RETRY_BACKOFF_BASE_S * 2 ** (attempt - 1))

    log.error("consumer.dead_letter", key=key, error=str(last_error))
    await publish_dlq(topic, key, raw, str(last_error))

    if on_dead_letter is not None and last_error is not None:
        try:
            parsed = json.loads(raw)
            payload_dict = parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            payload_dict = None
        try:
            await on_dead_letter(payload_dict, last_error)
        except Exception as err:  # noqa: BLE001
            log.error("consumer.dead_letter_hook_failed", key=key, error=str(err))