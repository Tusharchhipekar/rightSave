import json
import logging
from typing import Awaitable, Callable

import redis.asyncio as redis

from config import settings

log = logging.getLogger(__name__)

TTL_SECONDS = 600
MAX_MEMORIES = 30

_redis = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=2,
    socket_timeout=2,
    health_check_interval=30,
)


def _key(user_id: str) -> str:
    return f"mem:{user_id}"


async def get_cached(user_id: str) -> list[str] | None:
    try:
        raw = await _redis.get(_key(user_id))
        return json.loads(raw) if raw else None
    except Exception as e:
        log.warning("memory cache read failed: %s", e)
        return None


async def set_cached(user_id: str, memories: list[str]) -> None:
    try:
        await _redis.set(_key(user_id), json.dumps(memories), ex=TTL_SECONDS)
    except Exception as e:
        log.warning("memory cache write failed: %s", e)


async def invalidate(user_id: str) -> None:
    try:
        await _redis.delete(_key(user_id))
    except Exception as e:
        log.warning("memory cache invalidate failed: %s", e)


async def get_user_memories(
    user_id: str,
    loader: Callable[[str], Awaitable[list[str]]],
) -> list[str]:
    cached = await get_cached(user_id)
    if cached is not None:
        return cached
    try:
        memories = (await loader(user_id))[:MAX_MEMORIES]
    except Exception as e:
        log.warning("mem0 load failed: %s", e)
        return []
    if memories: 
        await set_cached(user_id, memories)
    return memories


async def close_memory_cache() -> None:
    try:
        await _redis.aclose()
    except Exception as e:
        log.warning("memory cache close failed: %s", e)