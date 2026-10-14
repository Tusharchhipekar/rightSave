import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from db.pool import close_pool, init_pool
from db.queries import get_content, search_content, search_memories
from services.embedder import close_embedder, embed_text

USER_ID = "PUT_A_REAL_USER_ID"
CONTENT_ID = "PUT_A_REAL_CONTENT_ID"


async def main() -> None:
    await init_pool()
    emb = await embed_text("pasta recipe")

    rows = await search_content(USER_ID, emb, limit=3)
    print("search_content:", [(r["id"][:8], round(float(r["similarity"]), 3)) for r in rows])

    row = await get_content(USER_ID, CONTENT_ID)
    print("get_content:", bool(row), (row or {}).get("creator"))

    other = await get_content("not-the-owner", CONTENT_ID)
    print("get_content wrong user (expect None):", other)

    mems = await search_memories(USER_ID, emb, limit=3)
    print("search_memories:", len(mems))

    await close_pool()
    await close_embedder()


asyncio.run(main())