import io
import wave

import httpx
import structlog
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from config import settings
from messaging.consumer import NonRetryableError

log = structlog.get_logger()


def _chunks(wav: bytes) -> list[bytes]:
    out: list[bytes] = []
    with wave.open(io.BytesIO(wav), "rb") as w:
        params = w.getparams()
        per_chunk = w.getframerate() * settings.SARVAM_CHUNK_SECONDS
        while True:
            frames = w.readframes(per_chunk)
            if not frames:
                break
            buf = io.BytesIO()
            with wave.open(buf, "wb") as o:
                o.setnchannels(params.nchannels)
                o.setsampwidth(params.sampwidth)
                o.setframerate(params.framerate)
                o.writeframes(frames)
            out.append(buf.getvalue())
    return out


def _retryable(err: BaseException) -> bool:
    if isinstance(err, httpx.HTTPStatusError):
        return err.response.status_code == 429 or err.response.status_code >= 500
    return isinstance(err, (httpx.TimeoutException, httpx.TransportError))


@retry(
    retry=retry_if_exception(_retryable),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def _call(client: httpx.AsyncClient, chunk: bytes) -> str:
    resp = await client.post(
        settings.SARVAM_STT_URL,
        headers={"api-subscription-key": settings.SARVAM_API_KEY.get_secret_value()},
        files={"file": ("chunk.wav", chunk, "audio/wav")},
        data={"model": settings.SARVAM_STT_MODEL, "mode": settings.SARVAM_STT_MODE},
    )
    resp.raise_for_status()
    return (resp.json().get("transcript") or "").strip()


async def sarvam_translate(wav: bytes) -> str:
    parts: list[str] = []
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            for chunk in _chunks(wav):
                text = await _call(client, chunk)
                if text:
                    parts.append(text)
    except httpx.HTTPStatusError as err:
        if not _retryable(err):
            raise NonRetryableError(
                f"sarvam {err.response.status_code}: {err.response.text[:200]}"
            ) from err
        raise
    log.info("sarvam.done", chunks=len(parts))
    return " ".join(parts)