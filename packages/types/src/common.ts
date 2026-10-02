import { z } from "zod";

export const int = z.number().int();
export const id = z.uuid();

export const authProvider = z.enum(["credentials", "google", "notion"]);
export const contentType = z.enum([
  "reel",
  "post",
  "screenshot",
  "tweet",
  "notion_page",
]);
export const mediaType = z.enum(["image", "video", "carousel"]);
export const ingestSource = z.enum([
  "instagram_dm",
  "share_target",
  "manual_upload",
  "notion",
  "extension",
]);
export const messageRole = z.enum(["user", "assistant", "system"]);
export const memorySource = z.enum(["inferred", "explicit"]);

export const pagination = {
  cursor: id.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export type AuthProvider = z.infer<typeof authProvider>;
export type ContentType = z.infer<typeof contentType>;
export type MediaType = z.infer<typeof mediaType>;
export type IngestSource = z.infer<typeof ingestSource>;
export type MessageRole = z.infer<typeof messageRole>;
export type MemorySource = z.infer<typeof memorySource>;