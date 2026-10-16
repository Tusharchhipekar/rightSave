import asyncio
import os
import subprocess
import sys
import uuid
from pathlib import Path

import httpx
import redis.asyncio as redis

WORKER_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = Path(__file__).resolve().parents[4]
WAIT_FOR_MEM0_S = int(os.environ.get("WAIT_FOR_MEM0_S", "25"))


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    path = WORKER_DIR / ".env"
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    env.update(os.environ)
    return env


ENV = load_env()
SECRET = ENV.get("INTERNAL_SECRET", "")
REDIS_URL = ENV.get("REDIS_URL", "redis://localhost:6379")
BASE_URL = ENV.get("ML_WORKER_URL", f"http://localhost:{ENV.get('PORT', '8000')}")
COMPOSE_FILE = ENV.get("COMPOSE_FILE")  # optional path to the compose file

passed = 0
failed = 0


def check(name: str, ok: bool, extra: str = "") -> None:
    global passed, failed
    if ok:
        passed += 1
        print(f"PASS  {name}")
    else:
        failed += 1
        print(f"FAIL  {name} {extra}")


def compose(*args: str) -> None:
    cmd = ["docker", "compose"]
    if COMPOSE_FILE:
        cmd += ["-f", COMPOSE_FILE]
    subprocess.run([*cmd, *args], cwd=REPO_ROOT, check=True, capture_output=True)


def new_redis() -> redis.Redis:
    return redis.from_url(REDIS_URL, decode_responses=True)


async def chat(client: httpx.AsyncClient, user_id: str, message: str) -> httpx.Response:
    return await client.post(
        f"{BASE_URL}/chat",
        headers={"x-internal-secret": SECRET},
        json={"userId": user_id, "message": message, "history": []},
    )


async def main() -> int:
    user_id = f"test-{uuid.uuid4().hex[:12]}"
    key = f"mem:{user_id}"
    r = new_redis()
    print(f"user: {user_id}\n")

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            print("1. first chat (no memories yet)")
            check("key absent before", await r.exists(key) == 0)
            res = await chat(client, user_id, "I'm vegetarian and I live in Pune.")
            check("200", res.status_code == 200, res.text)
            check("empty result not cached", await r.exists(key) == 0)

            print(f"\n   waiting {WAIT_FOR_MEM0_S}s for mem0 to extract...")
            await asyncio.sleep(WAIT_FOR_MEM0_S)

            print("\n2. second chat fills the cache")
            res = await chat(client, user_id, "What should I eat tonight?")
            check("200", res.status_code == 200, res.text)
            print(f"   answer: {res.json().get('answer', '')[:200]}")
            check("key exists", await r.exists(key) == 1)
            ttl_a = await r.ttl(key)
            check("ttl set", ttl_a > 0, f"ttl={ttl_a}")
            cached = (await r.get(key) or "").lower()
            check("cache has the semantic facts", "vegetarian" in cached or "pune" in cached, cached)

            print("\n3. third chat is served from cache")
            await asyncio.sleep(3)
            res = await chat(client, user_id, "Suggest a quick dinner.")
            check("200", res.status_code == 200, res.text)
            ttl_b = await r.ttl(key)
            check("ttl not reset (cache hit)", 0 < ttl_b < ttl_a, f"{ttl_a} -> {ttl_b}")

            print("\n4. redis down -> chat still works")
            await r.aclose()
            compose("stop", "redis")
            try:
                res = await chat(client, user_id, "Any dessert idea?")
                check("200 with redis down", res.status_code == 200, res.text)
            finally:
                compose("start", "redis")
                await asyncio.sleep(3)
            r = new_redis()  # old connection died with the container

            print("\n5. forget me clears the cache")
            # the key may have expired or been lost with the restart; refill it
            await r.set(key, '["test"]', ex=600)
            res = await client.delete(
                f"{BASE_URL}/memories/{user_id}", headers={"x-internal-secret": SECRET}
            )
            check("delete 200", res.status_code == 200, res.text)
            check("key gone", await r.exists(key) == 0)
        finally:
            try:
                await r.delete(key)
                await r.aclose()
            except Exception:
                pass

    print(f"\n{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))