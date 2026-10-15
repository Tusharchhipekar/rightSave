import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agent.context import ToolContext
from agent.llm import close_llm
from agent.runner import run_agent
from agent.tools.web_search import close_web_search
from db.pool import close_pool, init_pool
from services.embedder import close_embedder

USER_ID = "38e60c3d-eca9-4d16-9437-a64a4a8bae0b"
CONTENT_ID = "39523afe-ee86-4f5e-8136-6bb37b960e46"

CASES = [
    ("library search", ToolContext(user_id=USER_ID), "what reels have I saved?"),
    ("open reel", ToolContext(user_id=USER_ID, content_id=CONTENT_ID), "what is this reel about?"),
    ("web needed", ToolContext(user_id=USER_ID), "what is the weather in Bhilai today?"),
    ("no match", ToolContext(user_id=USER_ID), "find my reel about quantum knitting"),
]


async def main() -> None:
    await init_pool()
    for label, ctx, msg in CASES:
        res = await run_agent(ctx, msg, history=[])
        print(f"\n=== {label}: {msg}")
        print("answer :", res.answer)
        print("tools  :", res.tools_used, "| steps:", res.steps, "| limit_hit:", res.limit_hit)
        print("sources:", json.dumps(res.sources, ensure_ascii=False, default=str))

    await close_llm()
    await close_web_search()
    await close_embedder()
    await close_pool()


asyncio.run(main())
