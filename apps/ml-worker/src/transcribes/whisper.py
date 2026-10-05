import asyncio
import io
import wave
from dataclasses import dataclass
from functools import lru_cache

import numpy as np
import structlog
from faster_whisper import WhisperModel

from config import settings

log = structlog.get_logger()


@dataclass
class WhisperResult:
    text: str
    language: str
    probability: float
    is_english: bool


@lru_cache
def _model() -> WhisperModel:
    log.info("whisper.loading", model=settings.WHISPER_MODEL)
    return WhisperModel(
        settings.WHISPER_MODEL,
        device="cpu",
        compute_type=settings.WHISPER_COMPUTE_TYPE,
    )


def _to_array(wav: bytes) -> np.ndarray:
    """16 kHz mono 16-bit WAV bytes -> float32 samples in [-1, 1]."""
    with wave.open(io.BytesIO(wav), "rb") as w:
        frames = w.readframes(w.getnframes())
    return np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0


def _run(wav: bytes, task: str, english_only: bool) -> WhisperResult:
    segments, info = _model().transcribe(
        _to_array(wav),
        task=task,
        beam_size=1,
        vad_filter=True,
    )
    is_english = (
        info.language == "en" and info.language_probability >= settings.WHISPER_ENGLISH_MIN_PROB
    )
    # segments decode lazily: skip the work when the router will send it to Sarvam
    if english_only and not is_english:
        return WhisperResult("", info.language, info.language_probability, False)

    text = " ".join(s.text.strip() for s in segments).strip()
    return WhisperResult(text, info.language, info.language_probability, is_english)


async def whisper_transcribe(
    wav: bytes, *, task: str = "transcribe", english_only: bool = False
) -> WhisperResult:
    return await asyncio.to_thread(_run, wav, task, english_only)