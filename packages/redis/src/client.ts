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
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!client) {
        client = createClient({
          url,
          disableOfflineQueue: true,
          socket: {
            connectTimeout: 2000,
            reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
          },
        });
        client.on("error", (err) => console.error("[redis] error:", err.message));
      }

      if (!client.isOpen) {
        await Promise.race([
          client.connect(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("connect timeout")), 2000);
          }),
        ]);
      }

      return client.isReady ? client : null;
    } catch (err) {
      console.error("[redis] connect failed:", (err as Error).message);
      return null;
    } finally {
      if (timer) clearTimeout(timer);
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
  if (!client) return;
  try {
    await client.quit();
  } catch {
    client.destroy();
  }
  client = null;
}