import { z } from "zod";
import { id } from "./common";

export const ConnectInstagramApiRequestSchema = z.object({
  igUserId: z.string().min(1),
  username: z.string().min(1),
});

export const InstagramAccountParamsSchema = z.object({
  accountId: id,
});

export type ConnectInstagramApi = z.infer<typeof ConnectInstagramApiRequestSchema>;
export type InstagramAccountParams = z.infer<typeof InstagramAccountParamsSchema>;