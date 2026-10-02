import { createHash } from "node:crypto";

export const hash = (input: string): string =>
  createHash("sha256").update(input).digest("hex").slice(0, 32);

export const keys = {
  igSender: (igUserId: string) => `ig:sender:${igUserId}`,
  tavily: (query: string) => `tavily:${hash(query.trim().toLowerCase())}`,
  oembed: (platform: string, url: string) => `oembed:${platform}:${hash(url)}`,
  rateLimit: (route: string, id: string) => `rl:${route}:${id}`,
  webhook: (platform: string, externalId: string) => `wh:${platform}:${externalId}`,
};

export const ttl = {
  igSender: 60 * 60,
  tavily: 3 * 60 * 60,
  oembed: 24 * 60 * 60,
  webhook: 48 * 60 * 60,
};