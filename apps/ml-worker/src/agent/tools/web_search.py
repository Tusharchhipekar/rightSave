from typing import Any

import httpx
import structlog
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from agent.context import ToolContext
from config import settings

log = structlog.get_logger()

TAVILY_URL = "https://api.tavily.com/search"
MAX_RESULTS = 5
MAX_SNIPPET_CHARS = 500

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=15)
    return _client


async def close_web_search() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def _is_retryable(err: BaseException) -> bool:
    if isinstance(err, httpx.HTTPStatusError):
        return err.response.status_code == 429 or err.response.status_code >= 500
    return isinstance(err, (httpx.TimeoutException, httpx.TransportError))


@retry(
    retry=retry_if_exception(_is_retryable),
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    reraise=True,
)
async def _call(query: str) -> dict[str, Any]:
    resp = await _get_client().post(
        TAVILY_URL,
        headers={"Authorization": f"Bearer {settings.TAVILY_API_KEY.get_secret_value()}"},
        json={
            "query": query,
            "search_depth": "basic",
            "max_results": MAX_RESULTS,
            "include_answer": False,
        },
    )
    resp.raise_for_status()
    return resp.json()


SPEC: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "web_search",
        "description": (
            "Search the web for recent or outside information that is NOT in the user's "
            "saved library, for example opening hours, prices, news, or facts about a "
            "place, product or person mentioned in a saved reel. Search saved content "
            "first and only use this if that is not enough. Write a short, specific "
            "query. You can use this at most 2 times per message."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "A short, specific web search query.",
                }
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
}


async def run(ctx: ToolContext, args: dict[str, Any]) -> dict[str, Any]:
    query = (args.get("query") or "").strip()
    if not query:
        return {"error": "query is required."}

    if not settings.TAVILY_API_KEY.get_secret_value():
        return {"error": "Web search is not configured. Answer from saved content only."}

    try:
        data = await _call(query)
    except Exception as err:  
        log.warning("web_search.failed", error=str(err))
        return {"error": "Web search failed. Answer without it and say so."}

    results = [
        {
            "title": r.get("title"),
            "url": r.get("url"),
            "snippet": (r.get("content") or "")[:MAX_SNIPPET_CHARS],
        }
        for r in data.get("results", [])[:MAX_RESULTS]
    ]
    if not results:
        return {"results": [], "note": "No web results found."}
    return {"results": results}