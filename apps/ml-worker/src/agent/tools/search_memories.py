from typing import Any

from agent.context import ToolContext
from db.queries import search_memories
from services.embedder import embed_text

LIMIT = 5
MIN_SIMILARITY = 0.3  

SPEC: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "search_memories",
        "description": (
            "Look up what is already known about THIS user: their preferences, interests, "
            "habits and past events. Use it when the answer should be personalised or the "
            "user refers to something about themselves ('my usual', 'like last time'). "
            "Do not use it to find saved reels or posts, and do not use it for general "
            "knowledge questions."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "What to look up, in plain words, e.g. 'food preferences'.",
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

    embedding = await embed_text(query)
    rows = await search_memories(ctx.user_id, embedding, limit=LIMIT)

    memories = [
        {
            "memory": r["content"],
            "similarity": round(float(r["similarity"]), 3),
            "saved_at": r["created_at"],
        }
        for r in rows
        if float(r["similarity"]) >= MIN_SIMILARITY
    ]

    if not memories:
        return {"memories": [], "note": "Nothing relevant is known about the user for this."}
    return {"memories": memories}