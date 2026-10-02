import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;
let connecting: Promise<RedisClient | null> | null = null;

export async function getRedis(): Promise<RedisClient | null> {
  if (client?.isReady) return client;
  if (connecting) return connecting;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[redis] REDIS_URL not set, running without Redis");
    return null;
  }

  connecting = (async () => {
    try {
      client ??= createClient({
        url,
        socket: {
          connectTimeout: 2000,
          reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
        },
      });
      client.on("error", (err) => console.error("[redis] error:", err.message));
      if (!client.isOpen) await client.connect();
      return client;
    } catch (err) {
      console.error("[redis] connect failed:", (err as Error).message);
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

export async function redisPing(): Promise<boolean> {
  try {
    const r = await getRedis();
    if (!r) return false;
    return (await r.ping()) === "PONG";
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) await client.quit();
  client = null;
}