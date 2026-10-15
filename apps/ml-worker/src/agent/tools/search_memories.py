from typing import Any

from agent.context import ToolContext
from services import memory

LIMIT = 5

SPEC: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "search_memories",
        "description": (
            "Look up what is already known about THIS user: their preferences, interests, "
            "habits and past events. Use it when the answer should be personalised or the "
            "user refers to something about themselves ('my usual', 'like last time'). "
            "Optionally narrow by type: semantic (stable facts and preferences), episodic "
            "(specific past events), procedural (how the user wants things done). Leave "
            "type empty to search all three. Do not use it to find saved reels or posts, "
            "and do not use it for general knowledge questions."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "What to look up, in plain words, e.g. 'food preferences'.",
                },
                "type": {
                    "type": "string",
                    "enum": list(memory.MEMORY_TYPES),
                    "description": "Optional. Only search this type of memory.",
                },
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

    memory_type = args.get("type")
    if memory_type not in memory.MEMORY_TYPES:
        memory_type = None

    rows = await memory.search(ctx.user_id, query, memory_type=memory_type, limit=LIMIT)

    memories = [
        {"memory": r["memory"], "type": r["type"], "saved_at": r["created_at"]}
        for r in rows
    ]
    if not memories:
        return {"memories": [], "note": "Nothing relevant is known about the user for this."}
    return {"memories": memories}