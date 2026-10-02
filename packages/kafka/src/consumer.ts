import type { Consumer } from "kafkajs";
import { kafka } from "./client";
import { dlqFor } from "./topics";
import { publish } from "./producer";
import type { DlqPayload, SubscribeOptions } from "./types/types";

const consumers: Consumer[] = [];

export async function subscribe<T>({
  topic,
  groupId,
  schema,
  handler,
  maxAttempts = 3,
}: SubscribeOptions<T>) {
  const consumer = kafka.consumer({ groupId });
  consumers.push(consumer);

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message, partition }) => {
      const key = message.key?.toString() ?? null;
      const raw = message.value?.toString() ?? "";
      const meta = { key, partition, offset: message.offset };

      let lastError: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const parsed = JSON.parse(raw);
          const payload = schema ? schema.parse(parsed) : (parsed as T);
          await handler(payload, meta);
          return;
        } catch (err) {
          lastError = err;
          await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
        }
      }

      await publish<DlqPayload>({
        topic: dlqFor(topic),
        key: key ?? "unknown",
        payload: {
          originalTopic: topic,
          raw,
          error: lastError instanceof Error ? lastError.message : String(lastError),
          failedAt: new Date().toISOString(),
        },
      });
    },
  });

  return consumer;
}

export async function disconnectConsumers() {
  await Promise.all(consumers.map((c) => c.disconnect()));
  consumers.length = 0;
}

export function registerGracefulShutdown(extra?: () => Promise<void>) {
  const shutdown = async () => {
    await disconnectConsumers();
    if (extra) await extra();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}