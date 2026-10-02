import { z } from "zod";

export const UpdateUserApiRequestSchema = z.object({
  username: z.string().min(1).optional(),
  fullName: z.string().min(1).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UpdateUserApi = z.infer<typeof UpdateUserApiRequestSchema>;