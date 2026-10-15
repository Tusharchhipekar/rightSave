import { z } from "zod";

export const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
  contentId: z.string().uuid().optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatSourceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("saved"), contentId: z.string() }),
  z.object({
    type: z.literal("web"),
    url: z.string().url(),
    title: z.string().optional(),
  }),
]);
export type ChatSource = z.infer<typeof chatSourceSchema>;

export const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>;

export const mlChatRequestSchema = z.object({
  userId: z.string(),
  message: z.string(),
  history: z.array(chatHistoryItemSchema).max(10),
  contentId: z.string().optional(),
});
export type MlChatRequest = z.infer<typeof mlChatRequestSchema>;

export const mlChatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(chatSourceSchema),
  toolsUsed: z.array(z.string()),
});
export type MlChatResponse = z.infer<typeof mlChatResponseSchema>;

export const chatResponseSchema = mlChatResponseSchema.extend({
  conversationId: z.string().uuid(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;