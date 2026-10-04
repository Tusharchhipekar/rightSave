import type { Request, Response } from "express";
import { prisma } from "@repo/db-prisma";
import { keys, ttl, cacheGet, cacheSet, cacheDel, setNX, getRedis } from "@repo/redis";
import { publish, Topics } from "@repo/kafka";
import { config } from "../config/config";


const LINK_CODE_RE = /^RS-[A-Z0-9]{6}$/;

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.ig.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

export const receiveWebhook = async (req: Request, res: Response) => {
  res.sendStatus(200);

  try {
    const body = JSON.parse((req.body as Buffer).toString("utf8"));
    for (const entry of body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        await handleEvent(event).catch((err) =>
          console.error("[ig-webhook] event failed", err)
        );
      }
    }
  } catch (err) {
    console.error("[ig-webhook] parse failed", err);
  }
};

async function resolveUserId(igUserId: string): Promise<string | null> {
  const cached = await cacheGet<string>(keys.igSender(igUserId));
  if (cached) return cached;

  const account = await prisma.instagramAccount.findUnique({
    where: { igUserId },
    select: { userId: true },
  });
  if (!account) return null;

  await cacheSet(keys.igSender(igUserId), account.userId, ttl.igSender);
  return account.userId;
}

async function isDuplicate(mid: string, event: any): Promise<boolean> {
  const first = await setNX(keys.webhook("instagram", mid), ttl.webhook);
  if (!first) return true;

  try {
    await prisma.webhookEvent.create({
      data: { platform: "instagram", externalId: mid, payload: event },
    });
    return false;
  } catch (err: any) {
    if (err?.code === "P2002") return true;
    throw err;
  }
}

async function releaseDedupe(mid: string) {
  await cacheDel(keys.webhook("instagram", mid)).catch(() => {});
  await prisma.webhookEvent
    .deleteMany({ where: { platform: "instagram", externalId: mid } })
    .catch(() => {});
}

async function handleEvent(event: any) {
  console.log("[ig]", JSON.stringify(event));
  const senderId: string | undefined = event?.sender?.id;
  const message = event?.message;
  if (!senderId || !message || message.is_echo) return;

  const mid: string | undefined = message.mid;
  if (!mid) return;
  if (await isDuplicate(mid, event)) return;

  try {
    const text: string =
      typeof message.text === "string" ? message.text.trim() : "";

    if (text && LINK_CODE_RE.test(text.toUpperCase())) {
      await handleLinkCode(senderId, text.toUpperCase());
      return;
    }

    const userId = await resolveUserId(senderId);
    if (!userId) return;

    const attachment = (message.attachments ?? []).find((a: any) =>
      ["ig_reel", "share", "video", "ig_post"].includes(a.type)
    );

    if (attachment) {
      await handleShare(userId, senderId, attachment);
      return;
    }

    if (text) {
      await handleFolderText(userId, senderId, text);
    }
  } catch (err) {
    await releaseDedupe(mid);
    throw err;
  }
}

async function handleShare(userId: string, senderId: string, attachment: any) {
  const sourceUrl: string | undefined = attachment?.payload?.url;
  if (!sourceUrl) return;

  const isReel =
    attachment.type === "ig_reel" ||
    attachment.type === "video" ||
    sourceUrl.includes("/reel/");
  const type = isReel ? "reel" : "post";

  let content;
  try {
    content = await prisma.content.create({
      data: {
        userId,
        type,
        sourceUrl,
        ingestSource: "instagram_dm",
        status: "pending",
      },
      select: { id: true },
    });
  } catch (err: any) {
    if (err?.code !== "P2002") throw err;

    const existing = await prisma.content.findUnique({
      where: { userId_sourceUrl: { userId, sourceUrl } },
      select: { id: true, deletedAt: true },
    });
    if (!existing || !existing.deletedAt) return;

    content = await prisma.content.update({
      where: { id: existing.id },
      data: { deletedAt: null, status: "pending" },
      select: { id: true },
    });
  }

  const redis = await getRedis();
  if (redis) {
    const k = keys.igPendingShares(senderId);
    await redis.multi().sAdd(k, content.id).expire(k, ttl.igPendingShares).exec();
  }

  await publish({
    topic: Topics.CONTENT_INGEST,
    key: content.id,
    payload: { contentId: content.id, userId, sourceUrl, type },
  });
}

async function handleFolderText(userId: string, senderId: string, text: string) {
  const redis = await getRedis();
  if (!redis) return;

  const k = keys.igPendingShares(senderId);
  const contentIds = await redis.sMembers(k);
  if (contentIds.length === 0) return;

  const name = text.slice(0, 60);

  const collection = await prisma.collection.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: { userId, name },
    select: { id: true },
  });

  await prisma.contentCollection.createMany({
    data: contentIds.map((contentId) => ({
      contentId,
      collectionId: collection.id,
    })),
    skipDuplicates: true,
  });

  await redis.sRem(k, contentIds);
}

async function handleLinkCode(senderId: string, code: string) {
  const redis = await getRedis();
  if (!redis) return;

  const userId = await redis.getDel(keys.igLinkCode(code));
  if (!userId) return;

  const existing = await prisma.instagramAccount.findUnique({
    where: { igUserId: senderId },
    select: { userId: true },
  });

  if (existing) {
    if (existing.userId !== userId) {
      console.warn("[ig-link] igUserId already linked to another user");
    }
    return;
  }

  try {
    await prisma.instagramAccount.create({
      data: { userId, igUserId: senderId },
    });
  } catch (err: any) {
    if (err?.code === "P2002") return;
    throw err;
  }

  await cacheDel(keys.igSender(senderId));
  console.log("[ig-link] linked", senderId, "->", userId);
}