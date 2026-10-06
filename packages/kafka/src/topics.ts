import type { Topic, TopicConfig } from "./types/types";

export const Topics = {
  CONTENT_INGEST: "content-ingest",
  CONTENT_PROCESSED: "content-processed",
  AUTH_EVENTS: "auth-events",
  CONTENT_INGEST_DLQ: "content-ingest.dlq",
  CONTENT_PROCESSED_DLQ: "content-processed.dlq",
  AUTH_EVENTS_DLQ: "auth-events.dlq",
} as const satisfies Record<string, Topic>;

const DLQ_MAP: Partial<Record<Topic, Topic>> = {
  [Topics.CONTENT_INGEST]: Topics.CONTENT_INGEST_DLQ,
  [Topics.CONTENT_PROCESSED]: Topics.CONTENT_PROCESSED_DLQ,
  [Topics.AUTH_EVENTS]: Topics.AUTH_EVENTS_DLQ,
};

export const dlqFor = (topic: Topic): Topic => {
  const dlq = DLQ_MAP[topic];
  if (!dlq) throw new Error(`No DLQ defined for topic: ${topic}`);
  return dlq;
};

export const ALL_TOPICS: TopicConfig[] = Object.values(Topics).map((topic) => ({
  topic,
}));