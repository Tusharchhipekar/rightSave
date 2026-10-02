import { z } from "zod";
import { id, pagination, contentType, mediaType, ingestSource } from "./common";

export const CreateContentApiRequestSchema = z.object({
  type: contentType,
  ingestSource: ingestSource.extract(["share_target", "extension", "notion"]),
  sourceUrl: z.string().url(),
  mediaType: mediaType.optional(),
  caption: z.string().optional(),
  collectionId: id.optional(),
});

export const UpdateContentApiRequestSchema = z.object({
  tags: z.array(z.string().min(1)).max(50),
});

export const ContentParamsSchema = z.object({
  contentId: id,
});

export const ListContentApiSchema = z.object({
  type: contentType.optional(),
  ingestSource: ingestSource.optional(),
  collectionId: id.optional(),
  tag: z.string().min(1).optional(),
  ...pagination,
});

export const SearchContentApiSchema = z.object({
  q: z.string().min(1).max(500),
  type: contentType.optional(),
  collectionId: id.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateContentApi = z.infer<typeof CreateContentApiRequestSchema>;
export type UpdateContentApi = z.infer<typeof UpdateContentApiRequestSchema>;
export type ContentParams = z.infer<typeof ContentParamsSchema>;
export type ListContentApi = z.infer<typeof ListContentApiSchema>;
export type SearchContentApi = z.infer<typeof SearchContentApiSchema>;