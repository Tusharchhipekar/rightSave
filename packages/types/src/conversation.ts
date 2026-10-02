import { z } from "zod";
import { id, pagination } from "./common";

export const CreateConversationApiRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const ConversationParamsSchema = z.object({
  conversationId: id,
});

export const SendMessageApiRequestSchema = z.object({
  content: z.string().min(1).max(8000),
});

export const ListConversationsApiSchema = z.object({
  ...pagination,
});

export const ListMessagesApiSchema = z.object({
  ...pagination,
});

export type CreateConversationApi = z.infer<typeof CreateConversationApiRequestSchema>;
export type ConversationParams = z.infer<typeof ConversationParamsSchema>;
export type SendMessageApi = z.infer<typeof SendMessageApiRequestSchema>;
export type ListConversationsApi = z.infer<typeof ListConversationsApiSchema>;
export type ListMessagesApi = z.infer<typeof ListMessagesApiSchema>;