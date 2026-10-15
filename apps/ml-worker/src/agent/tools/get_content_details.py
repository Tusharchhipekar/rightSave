from typing import Any

from agent.context import ToolContext
from db.queries import get_content

MAX_TRANSCRIPT_CHARS = 12_000

SPEC: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "get_content_details",
        "description": (
            "Get the full details of ONE saved item: full transcript, caption, creator, "
            "hashtags and link. Use it after search_saved_content when the snippet is not "
            "enough to answer, or when the user asks something specific about one saved "
            "reel or post. If the user is chatting about one specific reel, you can omit "
            "content_id."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "content_id": {
                    "type": "string",
                    "description": "The id of the saved item, taken from search_saved_content results.",
                }
            },
            "required": [],
            "additionalProperties": False,
        },
    },
}


async def run(ctx: ToolContext, args: dict[str, Any]) -> dict[str, Any]:
    content_id = (args.get("content_id") or ctx.content_id or "").strip()
    if not content_id:
        return {"error": "No content_id given. Search saved content first to find one."}

    row = await get_content(ctx.user_id, content_id)
    if row is None:
        return {"error": "Saved item not found."}

    transcript = row.get("transcript") or ""
    truncated = len(transcript) > MAX_TRANSCRIPT_CHARS
    if truncated:
        transcript = transcript[:MAX_TRANSCRIPT_CHARS]

    return {
        "id": row["id"],
        "type": row["type"],
        "creator": row["creator"],
        "caption": row["caption"],
        "transcript": transcript,
        "transcript_truncated": truncated,
        "ocr_text": row["ocr_text"],
        "vision_caption": row["vision_caption"],
        "hashtags": row["hashtags"],
        "tags": row["tags"],
        "source_url": row["source_url"],
        "created_at": row["created_at"],
    }