import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services import memory  # noqa: E402

USER = "smoke-test-user"


async def main() -> None:
    print("mem0 enabled:", memory.enabled())
    if not memory.enabled():
        print("MEM0_API_KEY is blank in .env")
        return

    await memory.add(
        USER,
        "I'm vegetarian, I visited Goa last month, and please keep answers short.",
        "Got it. Short answers, vegetarian-friendly picks.",
    )
    print("add sent, waiting for mem0 to process...")

    for attempt in range(6):
        await asyncio.sleep(5)
        rows = await memory.search(USER, "what do I eat, where did I travel, how should you answer")
        print(f"attempt {attempt}: {len(rows)} memories")
        if rows:
            for r in rows:
                print(f"  [{r['type']}] {r['memory']}")
            print("search by type (procedural):", await memory.search(USER, "answer style", memory_type="procedural"))
            return
    print("no memories came back; check the mem0 dashboard and the logs above")


asyncio.run(main())