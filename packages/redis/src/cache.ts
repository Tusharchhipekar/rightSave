import { getRedis } from "./client";

const withJitter = (seconds: number): number =>
  Math.round(seconds * (1 + Math.random() * 0.1));

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = await getRedis();
    if (!r) return null;
    const raw = await r.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.error("[redis] cacheGet failed:", (err as Error).message);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const r = await getRedis();
    if (!r) return;
    await r.set(key, JSON.stringify(value), { EX: withJitter(ttlSeconds) });
  } catch (err) {
    console.error("[redis] cacheSet failed:", (err as Error).message);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const r = await getRedis();
    if (!r) return;
    await r.del(key);
  } catch (err) {
    console.error("[redis] cacheDel failed:", (err as Error).message);
  }
}

export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  if (fresh !== null && fresh !== undefined) await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

/** Returns true if the key was newly set (first time seen). Fails open: returns true on Redis error. */
export async function setNX(key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const r = await getRedis();
    if (!r) return true;
    const res = await r.set(key, "1", { NX: true, EX: ttlSeconds });
    return res === "OK";
  } catch (err) {
    console.error("[redis] setNX failed:", (err as Error).message);
    return true;
  }
}