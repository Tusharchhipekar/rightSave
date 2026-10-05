import { z } from "zod";
import { common } from "@repo/types";

export const ContentIngestSchema = z.object({
  contentId: z.string(),
  userId: z.string(),
  sourceUrl: z.string().url(),
  type: common.contentType,
  receivedAt: z.string().datetime(),
});
export type ContentIngestPayload = z.infer<typeof ContentIngestSchema>;

const base = { contentId: z.string(), userId: z.string() };

export const ContentProcessedSchema = z.discriminatedUnion("status", [
  z.object({
    ...base,
    status: z.literal("processing"),
  }),
  z.object({
    ...base,
    status: z.literal("ready"),
    mediaType: common.mediaType.nullable(),
    creatorUsername: z.string().nullable(),
    caption: z.string().nullable(),
    hashtags: z.array(z.string()),
    thumbnailUrl: z.string().url().nullable(),
    transcript: z.string().nullable(),
    ocrText: z.string().nullable(),
    visionCaption: z.string().nullable(),
    tags: z.array(z.string()),
    embedding: z.array(z.number()).length(1024),
  }),
  z.object({
    ...base,
    status: z.literal("failed"),
    error: z.string(),
    retryable: z.boolean(),
  }),
]);
export type ContentProcessedPayload = z.infer<typeof ContentProcessedSchema>;