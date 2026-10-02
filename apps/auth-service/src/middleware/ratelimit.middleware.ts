import type { Request, Response, NextFunction } from "express";
import { rateLimit, keys } from "@repo/redis";

interface RateLimiterOptions {
  name: string;
  limit: number;
  windowSeconds: number;
}

export const rateLimiter =
  ({ name, limit, windowSeconds }: RateLimiterOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.ip ?? "unknown";
    const result = await rateLimit(keys.rateLimit(name, id), limit, windowSeconds);

    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(result.remaining));

    if (!result.allowed) {
      res.setHeader("Retry-After", String(result.retryAfterSeconds));
      res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
      return;
    }

    next();
  };