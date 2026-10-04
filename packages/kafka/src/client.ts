import { Kafka, logLevel, type SASLOptions } from "kafkajs";
import type { TopicConfig } from "./types/types";

const sasl: SASLOptions | undefined =
  process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD
    ? {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD,
      }
    : undefined;

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "rightsave",
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  ssl: process.env.KAFKA_SSL === "true",
  sasl,
  logLevel: logLevel.WARN,
  retry: { initialRetryTime: 300, retries: 8 },
});

export async function ensureTopics(topics: TopicConfig[]) {
  const admin = kafka.admin();
  await admin.connect();
  try {
    // Only create topics that are missing. Calling createTopics for topics that
    // already exist makes kafkajs log a scary "Topic creation errors" ERROR line.
    const existing = new Set(await admin.listTopics());
    const missing = topics.filter((t) => !existing.has(t.topic));
    if (missing.length === 0) return;

    await admin.createTopics({
      waitForLeaders: true,
      topics: missing.map((t) => ({
        topic: t.topic,
        numPartitions: t.numPartitions ?? 3,
        replicationFactor: 1,
      })),
    });
  } finally {
    await admin.disconnect();
  }
}