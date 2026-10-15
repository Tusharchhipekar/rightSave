"""Reader-friendly summary of a saved reel/post, stored as markdown in Content.summary.

Format: "What it's about" line, plain-language bullets covering every point,
a numbered "Steps" list when the reel teaches something, and a numbered
"Recommended" list only when the creator explicitly recommends things.

A failure here must never fail ingestion: summarize() returns None on any error
and the caller simply saves the content without a summary.
"""

import os

import httpx
import structlog

from config import settings

log = structlog.get_logger()

SYSTEM_PROMPT = """You summarize a saved Instagram reel so the user can recall it in seconds.

Input: caption, transcript, any on-screen text. The transcript is machine-translated and may garble names and terms. If a name is unclear, leave it out.

Output exactly this markdown, in English:

**What it's about:** 1-2 sentences on what the creator is explaining or talking about.

- one bullet for every distinct point the creator makes, each starting with "- "

**Steps:**
1. each instruction, in the order given
2. ...

**Recommended:**
1. every item the creator recommends, in the order given (name + a few words on why)
2. ...

Bullet rules:
- Write for a reader who knows nothing about the topic: everyday words, short sentences, one idea per bullet, under 15 words.
- If the creator uses jargon, explain it in a few simple words instead of repeating it.
- Cover all the points in the reel. There is no fixed number of bullets: a short reel gets few, a long one gets as many as it needs. Only merge points that repeat each other.
- Main point first, then the key details, examples and numbers.
- Plain bullets only: no bold labels, headings or emoji inside them.

Other rules:
- Use only what the input says. Never add outside facts.
- Never invent or guess a name. If a name is spelled out letter by letter or unclear, describe it instead (e.g. "the creator's app").
- Be careful about who does what: don't say the creator does something that the app or a tool does.
- Include the "Steps:" section only if the reel teaches how to do something (a recipe, tutorial, workout, setup, how-to). List every step in order, one action per step, keeping ingredients, amounts, times and settings exactly as stated. Don't repeat the steps in the bullets, and never fill in details the creator didn't give. Otherwise leave the section out completely.
- Include the "Recommended:" section only if the creator explicitly recommends books, podcasts, tools, apps or similar. List all of them. Otherwise leave the section out completely.
- If the caption is generic, rely on the transcript.
- If there is almost no content, give the "What it's about" line and 1-2 bullets.
- Output the markdown only, with no intro or closing text."""

# provider -> (chat completions url, api key setting name, fallback model)
_PROVIDERS = {
    "mistral": (
        "https://api.mistral.ai/v1/chat/completions",
        "MISTRAL_API_KEY",
        "ministral-8b-latest",
    ),
    "openai": (
        "https://api.openai.com/v1/chat/completions",
        "OPENAI_API_KEY",
        "gpt-4o-mini",
    ),
}

MAX_INPUT_CHARS = 24_000
TIMEOUT_S = 30.0


def _cfg(name: str) -> str | None:
    """Read from settings (loaded from .env) first, then the process environment."""
    value = getattr(settings, name, None)
    if hasattr(value, "get_secret_value"):  # pydantic SecretStr
        value = value.get_secret_value()
    return value or os.getenv(name) or None


def _build_input(
    caption: str | None,
    transcript: str | None,
    ocr_text: str | None,
    vision_caption: str | None,
) -> str:
    parts = [
        ("Caption", caption),
        ("Transcript", transcript),
        ("On-screen text", ocr_text),
        ("Image description", vision_caption),
    ]
    text = "\n\n".join(f"{label}:\n{value.strip()}" for label, value in parts if value and value.strip())
    return text[:MAX_INPUT_CHARS]


async def summarize(
    *,
    caption: str | None = None,
    transcript: str | None = None,
    ocr_text: str | None = None,
    vision_caption: str | None = None,
) -> str | None:
    content = _build_input(caption, transcript, ocr_text, vision_caption)
    if not content:
        return None

    provider = _cfg("LLM_PROVIDER") or "mistral"
    if provider not in _PROVIDERS:
        log.warning("summarizer.unknown_provider", provider=provider)
        return None
    url, key_name, fallback_model = _PROVIDERS[provider]
    api_key = _cfg(key_name)
    if not api_key:
        log.warning("summarizer.no_api_key", key=key_name)
        return None
    model = _cfg("SUMMARY_MODEL") or _cfg("CHAT_MODEL") or fallback_model

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            res = await client.post(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "temperature": 0.2,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": content},
                    ],
                },
            )
            res.raise_for_status()
            out = res.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        log.exception("summarizer.failed")
        return None

    return out or None