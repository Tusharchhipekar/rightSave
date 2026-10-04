import { prisma } from "@repo/db-prisma";
import {
  subscribe,
  Topics,
  ContentProcessedSchema,
  type ContentProcessedPayload,
} from "@repo/kafka";

async function handle(p: ContentProcessedPayload) {
  const base = { id: p.contentId, userId: p.userId, deletedAt: null };

  if (p.status === "processing") {
    await prisma.content.updateMany({
      where: { ...base, status: "pending" },
      data: { status: "processing" },
    });
    return;
  }

  if (p.status === "failed") {
    console.error(
      "[content-processed] failed",
      p.contentId,
      p.retryable ? "(retryable)" : "",
      p.error,
    );
    await prisma.content.updateMany({
      where: { ...base, status: { in: ["pending", "processing"] } },
      data: { status: "failed" },
    });
    return;
  }

  const vector = `[${p.embedding.join(",")}]`;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.content.updateMany({
      where: base,
      data: {
        status: "ready",
        mediaType: p.mediaType,
        creatorUsername: p.creatorUsername,
        caption: p.caption,
        hashtags: p.hashtags,
        thumbnailUrl: p.thumbnailUrl,
        transcript: p.transcript,
        ocrText: p.ocrText,
        visionCaption: p.visionCaption,
        tags: p.tags,
      },
    });
    if (updated.count === 0) return;

    await tx.$executeRaw`UPDATE "Content" SET embedding = ${vector}::vector WHERE id = ${p.contentId}`;
  });
}

export const startContentProcessedConsumer = () =>
  subscribe<ContentProcessedPayload>({
    topic: Topics.CONTENT_PROCESSED,
    groupId: "api-backend-content-processed",
    schema: ContentProcessedSchema,
    handler: (payload) => handle(payload),
  });