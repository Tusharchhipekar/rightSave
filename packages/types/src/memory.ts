import { z } from "zod";
import { id } from "./common";

export const CreateUserMemoryApiRequestSchema = z.object({
  content: z.string().min(1).max(500),
});

export const UpdateUserMemoryApiRequestSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  isActive: z.boolean().optional(),
});

export const UserMemoryParamsSchema = z.object({
  memoryId: id,
});

export type CreateUserMemoryApi = z.infer<typeof CreateUserMemoryApiRequestSchema>;
export type UpdateUserMemoryApi = z.infer<typeof UpdateUserMemoryApiRequestSchema>;
export type UserMemoryParams = z.infer<typeof UserMemoryParamsSchema>;