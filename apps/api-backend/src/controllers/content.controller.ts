import type { Request, Response } from "express";
import { prisma } from "@repo/db-prisma";

const STATUSES = ["pending", "processing", "ready", "failed"] as const;
type Status = (typeof STATUSES)[number];

const listSelect = {
  id: true,
  type: true,
  mediaType: true,
  ingestSource: true,
  sourceUrl: true,
  creatorUsername: true,
  caption: true,
  tags: true,
  hashtags: true,
  thumbnailUrl: true,
  status: true,
  createdAt: true,
} as const;

const detailSelect = {
  ...listSelect,
  transcript: true,
  ocrText: true,
  visionCaption: true,
  duplicateOfId: true,
  updatedAt: true,
} as const;

export const listContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", code: "NO_USER" });
    }

    const status = req.query.status as string | undefined;
    if (status && !STATUSES.includes(status as Status)) {
      return res
        .status(400)
        .json({ message: "Invalid status", code: "BAD_STATUS" });
    }

    const rawLimit = Number(req.query.limit);
    const limit = Number.isInteger(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 50)
      : 20;
    const cursor = req.query.cursor as string | undefined;

    const rows = await prisma.content.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status: status as Status } : {}),
      },
      select: listSelect,
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
    console.error("[content] listContent failed", err);
    return res
      .status(500)
      .json({ message: "Internal server error", code: "INTERNAL" });
  }
};

export const getContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", code: "NO_USER" });
    }

    const content = await prisma.content.findFirst({
      where: { id: String(req.params.id), userId, deletedAt: null },
      select: detailSelect,
    });
    if (!content) {
      return res.status(404).json({ message: "Not found", code: "NOT_FOUND" });
    }

    return res.status(200).json(content);
  } catch (err) {
    console.error("[content] getContent failed", err);
    return res
      .status(500)
      .json({ message: "Internal server error", code: "INTERNAL" });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", code: "NO_USER" });
    }

    const result = await prisma.content.updateMany({
      where: { id: String(req.params.id), userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) {
      return res.status(404).json({ message: "Not found", code: "NOT_FOUND" });
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error("[content] deleteContent failed", err);
    return res
      .status(500)
      .json({ message: "Internal server error", code: "INTERNAL" });
  }
};