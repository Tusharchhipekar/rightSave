import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from db.pool import close_pool, init_pool
from db.queries import get_content, search_content
from services.embedder import close_embedder, embed_text

USER_ID = "38e60c3d-eca9-4d16-9437-a64a4a8bae0b"
CONTENT_ID = "39523afe-ee86-4f5e-8136-6bb37b960e46"


async def main() -> None:
    await init_pool()
    emb = await embed_text("pasta recipe")

    rows = await search_content(USER_ID, emb, limit=3)
    print("search_content:", [(r["id"][:8], round(float(r["similarity"]), 3)) for r in rows])

    row = await get_content(USER_ID, CONTENT_ID)
    print("get_content:", bool(row), (row or {}).get("creator"))

    other = await get_content("not-the-owner", CONTENT_ID)
    print("get_content wrong user (expect None):", other)

    await close_pool()
    await close_embedder()


asyncio.run(main())