import type { Request, Response } from "express";
import { prisma } from "@repo/db-prisma";

const fail = (res: Response, status: number, message: string, code: string) =>
  res.status(status).json({ message, code });

export const listMemories = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const rawLimit = Number(req.query.limit);
    const limit = Number.isInteger(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 100)
      : 50;
    const cursor = req.query.cursor as string | undefined;

    const rows = await prisma.userMemory.findMany({
      where: { userId, isActive: true },
      select: { id: true, content: true, source: true, createdAt: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    return res.status(200).json({
      items,
      nextCursor: hasMore && last ? last.id : null,
    });
  } catch (err) {
    console.error("[memory] list failed", err);
    return fail(res, 500, "Internal server error", "INTERNAL");
  }
};

// Hard delete: a memory the user removes is gone, not just hidden.
export const deleteMemory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const result = await prisma.userMemory.deleteMany({
      where: { id: String(req.params.id), userId },
    });
    if (result.count === 0) return fail(res, 404, "Not found", "NOT_FOUND");

    return res.sendStatus(204);
  } catch (err) {
    console.error("[memory] delete failed", err);
    return fail(res, 500, "Internal server error", "INTERNAL");
  }
};