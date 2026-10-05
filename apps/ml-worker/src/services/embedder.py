import httpx
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from config import settings
from messaging.consumer import NonRetryableError

MISTRAL_EMBED_URL = "https://api.mistral.ai/v1/embeddings"
MAX_INPUT_CHARS = 24000  # mistral-embed caps at ~8k tokens; stay safely under

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=30)
    return _client


async def close_embedder() -> None:
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
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def _call(text: str) -> list[float]:
    resp = await _get_client().post(
        MISTRAL_EMBED_URL,
        headers={"Authorization": f"Bearer {settings.MISTRAL_API_KEY.get_secret_value()}"},
        json={"model": settings.MISTRAL_EMBED_MODEL, "input": [text]},
    )
    resp.raise_for_status()
    return resp.json()["data"][0]["embedding"]


async def embed_text(text: str) -> list[float]:
    text = text.strip()
    if not text:
        raise NonRetryableError("nothing to embed (empty text)")

    try:
        embedding = await _call(text[:MAX_INPUT_CHARS])
    except httpx.HTTPStatusError as err:
        if not _is_retryable(err):
            raise NonRetryableError(
                f"mistral embeddings {err.response.status_code}: {err.response.text[:200]}"
            ) from err
        raise

    if len(embedding) != settings.EMBED_DIMENSIONS:
        raise NonRetryableError(
            f"embedding has {len(embedding)} dims, expected {settings.EMBED_DIMENSIONS}"
        )
    return embedding