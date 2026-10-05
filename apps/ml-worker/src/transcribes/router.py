import structlog

from config import settings
from transcribes.audio import extract_audio
from transcribes.sarvam import sarvam_translate
from transcribes.whisper import whisper_transcribe

log = structlog.get_logger()


async def transcribe(video: bytes) -> str:
    wav = await extract_audio(video)
    if not wav:
        return ""

    first = await whisper_transcribe(wav, english_only=True)
    if first.is_english:
        log.info("transcribe.whisper_en", chars=len(first.text))
        return first.text

    log.info("transcribe.non_english", lang=first.language, prob=round(first.probability, 2))

    if settings.SARVAM_API_KEY.get_secret_value().strip():
        return await sarvam_translate(wav)

    log.warning("transcribe.sarvam_key_missing_using_whisper_translate")
    fallback = await whisper_transcribe(wav, task="translate")
    return fallback.text