import type { ZodType } from "zod";

export type Topic =
  | "content-ingest"
  | "content-processed"
  | "auth-events"
  | "content-ingest.dlq"
  | "content-processed.dlq"
  | "auth-events.dlq";

export type TopicConfig = {
  topic: string;
  numPartitions?: number;
};

export type MessageMeta = {
  key: string | null;
  partition: number;
  offset: string;
};

export type MessageHandler<T> = (payload: T, meta: MessageMeta) => Promise<void>;

export type SubscribeOptions<T> = {
  topic: Topic;
  groupId: string;
  schema?: ZodType<T>;
  handler: MessageHandler<T>;
  maxAttempts?: number;
};

export type PublishOptions<T> = {
  topic: Topic;
  key: string;
  payload: T;
  schema?: ZodType<T>;
  headers?: Record<string, string>;
};

export type DlqPayload = {
  originalTopic: Topic;
  raw: string;
  error: string;
  failedAt: string;
};