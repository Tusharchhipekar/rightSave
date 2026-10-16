"""Hosted mem0 wrapper: long-term memory per user, in three types.

semantic   - stable facts and preferences about the user
episodic   - specific events and experiences
procedural - how the user wants things done

search() and add() fail soft: a mem0 outage, timeout or missing key must never
break chat. delete_all() reports failure instead, so "forget me" never lies.
"""

import asyncio
from typing import Any

import structlog
from mem0 import AsyncMemoryClient

from config import settings
from services.memory_cache import get_user_memories, invalidate

log = structlog.get_logger()

SEARCH_TIMEOUT_S = 5.0
ADD_TIMEOUT_S = 20.0
DELETE_TIMEOUT_S = 20.0
TYPE_FILTER_OVERFETCH = 4

MEMORY_TYPES = ("semantic", "episodic", "procedural")
CACHED_TYPES = ("semantic",)  

CATEGORIES: list[dict[str, str]] = [
    {
        "semantic": (
            "Stable facts and preferences about the user that stay true over time: "
            "who they are, what they like, what they know. Not tied to one date. "
            "Examples: "
            "1) 'Follows a vegetarian diet'. "
            "2) 'Works as a backend developer'. "
            "3) 'Lives in Pune'. "
            "4) 'Is learning Rust'. "
            "5) 'Dislikes spicy food'. "
            "6) 'Speaks Hindi and English'."
        )
    },
    {
        "episodic": (
            "Specific events and experiences with a time or occasion attached: "
            "what the user did, asked about, planned, saved or watched. "
            "Examples: "
            "1) 'Visited Goa in September 2026'. "
            "2) 'Saved five gym reels this week'. "
            "3) 'Asked about Rust error handling yesterday'. "
            "4) 'Booked a trip to Jaipur for November'. "
            "5) 'Started a new job last month'. "
            "6) 'Watched a sourdough baking reel on Sunday'."
        )
    },
    {
        "procedural": (
            "How the user wants things done: answer style, format, tone, length, "
            "language and recurring rules or workflows for the assistant to follow. "
            "Examples: "
            "1) 'Always answer in bullet points'. "
            "2) 'Keep replies under five lines'. "
            "3) 'Reply in Hinglish'. "
            "4) 'Show code before the explanation'. "
            "5) 'End every answer with one next step'. "
            "6) 'Use a table when comparing options'."
        )
    },
]

_client: AsyncMemoryClient | None = None


def enabled() -> bool:
    return bool(settings.MEM0_API_KEY.get_secret_value().strip())


def _get_client() -> AsyncMemoryClient:
    global _client
    if _client is None:
        _client = AsyncMemoryClient(api_key=settings.MEM0_API_KEY.get_secret_value())
    return _client


def _memory_type(row: dict[str, Any]) -> str | None:
    return next((c for c in (row.get("categories") or []) if c in MEMORY_TYPES), None)


async def search(
    user_id: str,
    query: str,
    memory_type: str | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Top-k memories for this user relevant to `query`.

    memory_type=None searches all three types; otherwise one of MEMORY_TYPES.
    Returns [] on any failure.
    """
    query = (query or "").strip()
    if not enabled() or not query:
        return []
    if memory_type is not None and memory_type not in MEMORY_TYPES:
        log.warning("memory.unknown_type", memory_type=memory_type)
        memory_type = None

    top_k = limit * TYPE_FILTER_OVERFETCH if memory_type else limit

    try:
        res = await asyncio.wait_for(
            _get_client().search(query, filters={"user_id": user_id}, top_k=top_k),
            timeout=SEARCH_TIMEOUT_S,
        )
    except Exception as err:
        log.warning("memory.search_failed", error=str(err))
        return []

    rows = [
        {
            "id": r.get("id"),
            "memory": r["memory"],
            "type": _memory_type(r),
            "score": r.get("score"),
            "created_at": r.get("created_at"),
        }
        for r in (res or {}).get("results", [])
        if r.get("memory")
    ]
    if memory_type:
        rows = [r for r in rows if r["type"] == memory_type]
    return rows[:limit]


async def _load_profile(user_id: str) -> list[str]:
    """All cached-type memories for this user, newest first. Raises on failure."""
    if not enabled():
        return []
    res = await asyncio.wait_for(
        _get_client().get_all(filters={"user_id": user_id}, page_size=100),
        timeout=SEARCH_TIMEOUT_S,
    )
    rows = [
        r
        for r in (res or {}).get("results", [])
        if r.get("memory") and _memory_type(r) in CACHED_TYPES
    ]
    rows.sort(key=lambda r: r.get("updated_at") or r.get("created_at") or "", reverse=True)
    return [r["memory"] for r in rows]


async def profile_memories(user_id: str) -> list[str]:
    """Semantic memories for a chat's system prompt, served from Redis. Never raises."""
    return await get_user_memories(user_id, _load_profile)


async def add(
    user_id: str,
    user_message: str,
    assistant_message: str | None = None, 
) -> None:
    """Let mem0 extract durable memories from the user's message. Never raises.

    Only the user's words are sent. The assistant's answer can contain reel
    transcripts or web text, which mem0 would store as "facts" about the user.
    The Redis profile cache is not cleared here: it expires on its TTL, so new
    memories reach new chats within that window.
    """
    if not enabled() or not user_message.strip():
        return
    try:
        await asyncio.wait_for(
            _get_client().add(
                [{"role": "user", "content": user_message}],
                user_id=user_id,
                custom_categories=CATEGORIES,
            ),
            timeout=ADD_TIMEOUT_S,
        )
    except Exception as err:
        log.warning("memory.add_failed", error=str(err))


async def delete_all(user_id: str) -> bool:
    """Delete every memory mem0 holds for this user. True on success, False on failure."""
    if not enabled():
        return False
    try:
        await asyncio.wait_for(
            _get_client().delete_all(user_id=user_id),
            timeout=DELETE_TIMEOUT_S,
        )
        await invalidate(user_id)
        return True
    except Exception as err:
        log.warning("memory.delete_all_failed", error=str(err))
        return False