import type { Producer } from "kafkajs";
import { kafka } from "./client";
import type { PublishOptions } from "./types/types";

let producer: Producer | null = null;
let connecting: Promise<Producer> | null = null;

async function getProducer(): Promise<Producer> {
  if (producer) return producer;
  if (!connecting) {
    const p = kafka.producer({ allowAutoTopicCreation: false, idempotent: true });
    connecting = p.connect().then(() => {
      producer = p;
      return p;
    });
  }
  return connecting;
}

export async function publish<T>({
  topic,
  key,
  payload,
  schema,
  headers,
}: PublishOptions<T>) {
  const value = schema ? schema.parse(payload) : payload;
  const p = await getProducer();
  await p.send({
    topic,
    acks: -1,
    messages: [{ key, value: JSON.stringify(value), headers }],
  });
}

export async function disconnectProducer() {
  if (producer) {
    await producer.disconnect();
    producer = null;
    connecting = null;
  }
}