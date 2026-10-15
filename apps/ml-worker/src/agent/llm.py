import asyncio
import json
import time
from typing import Any

from openai import AsyncOpenAI

from config import settings

MISTRAL_BASE_URL = "https://api.mistral.ai/v1"
MISTRAL_MIN_GAP_S = 1.2  # free tier is ~1 request/second; set to 0 on a paid plan

_client: AsyncOpenAI | None = None
_gate = asyncio.Lock()
_last_call = 0.0


def _is_openai() -> bool:
    return settings.LLM_PROVIDER.lower() == "openai"


def chat_model() -> str:
    if settings.CHAT_MODEL:
        return settings.CHAT_MODEL
    return "gpt-4.1-mini" if _is_openai() else "mistral-small-latest"


def token_kwargs(n: int) -> dict[str, int]:
    # Mistral expects max_tokens; OpenAI expects max_completion_tokens
    return {"max_completion_tokens": n} if _is_openai() else {"max_tokens": n}


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if _is_openai():
            key, base_url = settings.OPENAI_API_KEY.get_secret_value(), None
        else:
            key, base_url = settings.MISTRAL_API_KEY.get_secret_value(), MISTRAL_BASE_URL
        if not key:
            raise RuntimeError(f"API key for LLM_PROVIDER={settings.LLM_PROVIDER} is empty")
        _client = AsyncOpenAI(api_key=key, base_url=base_url, timeout=20.0, max_retries=5)
    return _client


async def close_llm() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None


async def chat_create(**kwargs: Any) -> Any:
    """Every chat call goes through here so Mistral calls are spaced out."""
    global _last_call
    if not _is_openai():
        async with _gate:
            wait = MISTRAL_MIN_GAP_S - (time.monotonic() - _last_call)
            if wait > 0:
                await asyncio.sleep(wait)
            _last_call = time.monotonic()
    return await get_client().chat.completions.create(**kwargs)


async def json_complete(system: str, user: str, max_tokens: int = 600) -> dict[str, Any]:
    """Small helper for the rewrite / grader calls. Always returns a dict."""
    resp = await chat_create(
        model=chat_model(),
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        **token_kwargs(max_tokens),
    )
    try:
        data = json.loads(resp.choices[0].message.content or "{}")
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}