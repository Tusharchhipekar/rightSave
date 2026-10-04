import { publish, Topics } from "@repo/kafka";

export interface IngestJob {
  id: string;
  userId: string;
  sourceUrl: string;
  type: string;
  createdAt: Date;
}

export const publishIngest = (c: IngestJob) =>
  publish({
    topic: Topics.CONTENT_INGEST,
    key: c.id,
    payload: {
      contentId: c.id,
      userId: c.userId,
      sourceUrl: c.sourceUrl,
      type: c.type,
      receivedAt: c.createdAt.toISOString(),
    },
  });