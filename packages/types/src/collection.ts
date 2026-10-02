import { z } from "zod";
import { id } from "./common";

export const CreateCollectionApiRequestSchema = z.object({
  name: z.string().min(1).max(100),
});

export const RenameCollectionApiRequestSchema = CreateCollectionApiRequestSchema;

export const CollectionParamsSchema = z.object({
  collectionId: id,
});

export const AddToCollectionApiRequestSchema = z.object({
  contentIds: z.array(id).min(1).max(100),
});

export const CollectionContentParamsSchema = z.object({
  collectionId: id,
  contentId: id,
});

export type CreateCollectionApi = z.infer<typeof CreateCollectionApiRequestSchema>;
export type RenameCollectionApi = z.infer<typeof RenameCollectionApiRequestSchema>;
export type CollectionParams = z.infer<typeof CollectionParamsSchema>;
export type AddToCollectionApi = z.infer<typeof AddToCollectionApiRequestSchema>;
export type CollectionContentParams = z.infer<typeof CollectionContentParamsSchema>;