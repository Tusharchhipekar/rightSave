import asyncio
import os
import tempfile

import structlog

from config import settings

log = structlog.get_logger()


async def extract_audio(video: bytes) -> bytes:
    """MP4 bytes -> 16 kHz mono WAV bytes (capped at MAX_AUDIO_SECONDS). b"" if no audio track."""
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.mp4")
        dst = os.path.join(tmp, "out.wav")
        with open(src, "wb") as f:
            f.write(video)

        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-v", "error", "-y",
            "-i", src,
            "-vn", "-ac", "1", "-ar", "16000",
            "-t", str(settings.MAX_AUDIO_SECONDS),
            dst,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.PIPE,
        )
        _, err = await proc.communicate()
        msg = err.decode("utf-8", "ignore")

        if proc.returncode != 0:
            if "does not contain any stream" in msg or "Output file is empty" in msg:
                log.info("audio.no_track")
                return b""
            raise RuntimeError(f"ffmpeg failed: {msg[:300]}")

        with open(dst, "rb") as f:
            return f.read()