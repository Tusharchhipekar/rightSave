import type { Request, Response } from "express";
import {
  CONTENT_TYPES,
  searchAll,
  type ContentTypeName,
} from "../services/search";

const fail = (res: Response, status: number, message: string, code: string) =>
  res.status(status).json({ message, code });

export const search = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 2 || q.length > 200) {
      return fail(res, 400, "q must be 2-200 characters", "BAD_REQUEST");
    }

    let type: ContentTypeName | null = null;
    if (req.query.type !== undefined) {
      const t = String(req.query.type);
      if (!(CONTENT_TYPES as readonly string[]).includes(t)) {
        return fail(
          res,
          400,
          `type must be one of: ${CONTENT_TYPES.join(", ")}`,
          "BAD_REQUEST",
        );
      }
      type = t as ContentTypeName;
    }

    const rawLimit = Number.parseInt(String(req.query.limit ?? "20"), 10);
    const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 50);

    const result = await searchAll(userId, { q, type, limit });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[search] failed", err);
    return fail(res, 500, "Internal server error", "INTERNAL");
  }
};