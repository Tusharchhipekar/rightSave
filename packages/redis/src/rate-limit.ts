import { getRedis } from "./client";

const SCRIPT = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
return { c, ttl }
`;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const r = await getRedis();
    if (!r) throw new Error("redis unavailable");

    const [count, ttl] = (await r.eval(SCRIPT, {
      keys: [key],
      arguments: [String(windowSeconds)],
    })) as [number, number];

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (err) {
    console.warn("[redis] rateLimit failing open:", (err as Error).message);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}