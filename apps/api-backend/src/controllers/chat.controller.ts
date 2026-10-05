import type { Request, Response } from "express";
import { conversation } from "@repo/types";
import { ChatError, handleChat } from "../services/chat";
import { UpstreamError } from "../services/mistral";

const fail = (res: Response, status: number, message: string, code: string) =>
  res.status(status).json({ message, code });

export const chat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const parsed = conversation.ChatApiRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return fail(res, 400, "Invalid request body", "BAD_REQUEST");
    }

    const result = await handleChat(userId, parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof ChatError) {
      return fail(res, err.status, err.message, err.code);
    }
    if (err instanceof UpstreamError) {
      console.error("[chat] upstream failed", err.message);
      return fail(res, 502, "AI service unavailable", "UPSTREAM");
    }
    if (err instanceof Error && ["TimeoutError", "AbortError"].includes(err.name)) {
      console.error("[chat] upstream timeout", err.message);
      return fail(res, 504, "AI service timed out", "UPSTREAM_TIMEOUT");
    }
    console.error("[chat] failed", err);
    return fail(res, 500, "Internal server error", "INTERNAL");
  }
};