import type { Request, Response } from "express";
import { prisma } from "@repo/db-prisma";
import { chatRequestSchema, type ChatResponse } from "@repo/types";
import { callMlChat } from "../services/ml-chat-client";

const HISTORY_LIMIT = 10;

export async function chat(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }
    const { conversationId, message, contentId } = parsed.data;

    if (contentId) {
      const content = await prisma.content.findFirst({
        where: { id: contentId, userId, deletedAt: null },
        select: { id: true },
      });
      if (!content) return res.status(404).json({ error: "Content not found" });
    }

    let convId = conversationId;
    if (convId) {
      const conv = await prisma.conversation.findFirst({
        where: { id: convId, userId },
        select: { id: true },
      });
      if (!conv) return res.status(404).json({ error: "Conversation not found" });
    }

    let history: { role: "user" | "assistant"; content: string }[] = [];
    if (convId) {
      const rows = await prisma.message.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: "desc" },
        take: HISTORY_LIMIT,
        select: { role: true, content: true },
      });
      history = rows.reverse().map((m) => ({
        role: String(m.role).toLowerCase() as "user" | "assistant",
        content: m.content,
      }));
    }

    let ml;
    try {
      ml = await callMlChat({ userId, message, history, contentId });
    } catch (err) {
      console.error("chat: ml-worker call failed", err);
      return res.status(502).json({ error: "Chat service unavailable, please retry" });
    }

    if (!convId) {
      const created = await prisma.conversation.create({
        data: { userId, title: message.slice(0, 60) },
        select: { id: true },
      });
      convId = created.id;
    }

    const now = Date.now();
    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: convId,
          role: "user",
          content: message,
          createdAt: new Date(now),
        },
      }),
      prisma.message.create({
        data: {
          conversationId: convId,
          role: "assistant",
          content: ml.answer,
          sources: ml.sources,
          toolsUsed: ml.toolsUsed,
          createdAt: new Date(now + 1),
        },
      }),
      prisma.conversation.update({
        where: { id: convId },
        data: {
          lastMessageText: ml.answer.slice(0, 200),
          lastMessageAt: new Date(now + 1),
        },
      }),
    ]);

    const body: ChatResponse = {
      conversationId: convId,
      answer: ml.answer,
      sources: ml.sources,
      toolsUsed: ml.toolsUsed,
    };
    return res.status(200).json(body);
  } catch (err) {
    console.error("chat: unexpected error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}