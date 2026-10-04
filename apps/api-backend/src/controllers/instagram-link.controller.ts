import crypto from "crypto";
import type { Request, Response } from "express";
import { getRedis, keys, ttl, rateLimit } from "@repo/redis";
import { prisma } from "@repo/db-prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateCode = (): string => {
    const bytes = crypto.randomBytes(6);
    let out = "";
    for (const b of bytes) out += ALPHABET.charAt(b % ALPHABET.length);
    return `RS-${out}`;
  };

export const createLinkCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", code: "NO_USER" });
    }

    const rl = await rateLimit(keys.rateLimit("ig-link-code", userId), 5, 10 * 60);
       res.setHeader("X-RateLimit-Limit", "5");
       res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
     if (!rl.allowed) {
        res.setHeader("Retry-After", String(rl.retryAfterSeconds));
          return res
          .status(429)
            .json({ message: "Too many requests. Please try again later.", code: "RATE_LIMITED" });
    }

    const redis = await getRedis();
    if (!redis) {
      return res
        .status(503)
        .json({ message: "Service unavailable", code: "REDIS_DOWN" });
    }

    for (let i = 0; i < 5; i++) {
      const code = generateCode();
      const ok = await redis.set(keys.igLinkCode(code), userId, {
        NX: true,
        EX: ttl.igLinkCode,
      });
      if (ok === "OK") {
        return res
          .status(201)
          .json({ code, expiresInSeconds: ttl.igLinkCode });
      }
    }

    return res
      .status(500)
      .json({ message: "Could not generate code", code: "CODE_GEN_FAILED" });
  } catch (err) {
    console.error("[ig-link] createLinkCode failed", err);
    return res
      .status(500)
      .json({ message: "Internal server error", code: "INTERNAL" });
  }
};


export const getLinkStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", code: "NO_USER" });
    }
 
    const account = await prisma.instagramAccount.findFirst({
      where: { userId },
      select: { igUserId: true, username: true, connectedAt: true },
    });
 
    return res.status(200).json({
      linked: !!account,
      username: account?.username ?? null,
      connectedAt: account?.connectedAt ?? null,
    });
  } catch (err) {
    console.error("[ig-link] getLinkStatus failed", err);
    return res
      .status(500)
      .json({ message: "Internal server error", code: "INTERNAL" });
  }
};