import type { Topic, TopicConfig } from "./types/types";

export const Topics = {
  CONTENT_INGEST: "content-ingest",
  CONTENT_PROCESSED: "content-processed",
  CONTENT_INGEST_DLQ: "content-ingest.dlq",
  CONTENT_PROCESSED_DLQ: "content-processed.dlq",
} as const satisfies Record<string, Topic>;

export const dlqFor = (topic: Topic): Topic =>
  topic === Topics.CONTENT_INGEST
    ? Topics.CONTENT_INGEST_DLQ
    : Topics.CONTENT_PROCESSED_DLQ;

export const ALL_TOPICS: TopicConfig[] = Object.values(Topics).map((topic) => ({
  topic,
}));