import type { Request, Response } from "express";
import { prisma } from "@repo/db-prisma";

const fail = (res: Response, status: number, message: string, code: string) =>
  res.status(status).json({ message, code });

const internal = (res: Response, tag: string, err: unknown) => {
  console.error(`[collections] ${tag} failed`, err);
  return fail(res, 500, "Internal server error", "INTERNAL");
};

const parseName = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const name = v.trim();
  return name.length >= 1 && name.length <= 60 ? name : null;
};

const ownsCollection = async (userId: string, id: string) =>
  !!(await prisma.collection.findFirst({
    where: { id, userId },
    select: { id: true },
  }));

export const listCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const items = await prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { contents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      items: items.map(({ _count, ...c }) => ({
        ...c,
        contentCount: _count.contents,
      })),
    });
  } catch (err) {
    return internal(res, "list", err);
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const name = parseName(req.body?.name);
    if (!name) return fail(res, 400, "Name must be 1-60 characters", "BAD_NAME");

    const collection = await prisma.collection.create({
      data: { userId, name },
      select: { id: true, name: true, createdAt: true },
    });
    return res.status(201).json(collection);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return fail(res, 409, "Collection already exists", "NAME_TAKEN");
    }
    return internal(res, "create", err);
  }
};

export const renameCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const name = parseName(req.body?.name);
    if (!name) return fail(res, 400, "Name must be 1-60 characters", "BAD_NAME");

    const result = await prisma.collection.updateMany({
      where: { id: String(req.params.id), userId },
      data: { name },
    });
    if (result.count === 0) return fail(res, 404, "Not found", "NOT_FOUND");

    return res.status(200).json({ id: String(req.params.id), name });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return fail(res, 409, "Collection already exists", "NAME_TAKEN");
    }
    return internal(res, "rename", err);
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    // Content is kept; only the collection and its links are removed (cascade).
    const result = await prisma.collection.deleteMany({
      where: { id: String(req.params.id), userId },
    });
    if (result.count === 0) return fail(res, 404, "Not found", "NOT_FOUND");

    return res.sendStatus(204);
  } catch (err) {
    return internal(res, "delete", err);
  }
};

export const listCollectionContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const collectionId = String(req.params.id);
    if (!(await ownsCollection(userId, collectionId))) {
      return fail(res, 404, "Not found", "NOT_FOUND");
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
        collections: { some: { collectionId } },
      },
      select: {
        id: true,
        type: true,
        mediaType: true,
        sourceUrl: true,
        creatorUsername: true,
        caption: true,
        tags: true,
        thumbnailUrl: true,
        status: true,
        createdAt: true,
      },
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
    return internal(res, "listContent", err);
  }
};

export const addContentToCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const collectionId = String(req.params.id);
    const contentId = req.body?.contentId;
    if (typeof contentId !== "string" || !contentId) {
      return fail(res, 400, "contentId is required", "BAD_CONTENT_ID");
    }

    const [collection, content] = await Promise.all([
      ownsCollection(userId, collectionId),
      prisma.content.findFirst({
        where: { id: contentId, userId, deletedAt: null },
        select: { id: true },
      }),
    ]);
    if (!collection || !content) {
      return fail(res, 404, "Not found", "NOT_FOUND");
    }

    await prisma.contentCollection.upsert({
      where: { contentId_collectionId: { contentId, collectionId } },
      update: {},
      create: { contentId, collectionId },
    });

    return res.sendStatus(204);
  } catch (err) {
    return internal(res, "addContent", err);
  }
};

export const removeContentFromCollection = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized", "NO_USER");

    const collectionId = String(req.params.id);
    if (!(await ownsCollection(userId, collectionId))) {
      return fail(res, 404, "Not found", "NOT_FOUND");
    }

    await prisma.contentCollection.deleteMany({
      where: { collectionId, contentId: String(req.params.contentId) },
    });

    return res.sendStatus(204);
  } catch (err) {
    return internal(res, "removeContent", err);
  }
};