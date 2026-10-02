import { Kafka, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:19092").split(",");
const TOPIC = `smoke.${Date.now()}`;
const GROUP = `smoke-group-${Date.now()}`;
const TIMEOUT_MS = 20_000;

let failed = 0;
const check = (name: string, ok: boolean, extra?: unknown) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`, ok ? "" : (extra ?? ""));
  if (!ok) failed++;
};

async function testUp() {
  const kafka = new Kafka({
    clientId: "smoke",
    brokers,
    logLevel: logLevel.NOTHING,
    retry: { retries: 3 },
  });
  const admin = kafka.admin();
  const producer = kafka.producer({ allowAutoTopicCreation: false });
  const consumer = kafka.consumer({ groupId: GROUP });

  try {
    await admin.connect();
    check("admin connect", true);

    await admin.createTopics({
      topics: [{ topic: TOPIC, numPartitions: 3, replicationFactor: 1 }],
      waitForLeaders: true,
    });
    check("topic created", (await admin.listTopics()).includes(TOPIC));

    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

    const payload = {
      jobId: crypto.randomUUID(),
      userId: "user-1",
      sentAt: Date.now(),
    };

    const received = new Promise<{ key?: string; value: any }>(
      (resolve, reject) => {
        const t = setTimeout(
          () => reject(new Error("consume timeout")),
          TIMEOUT_MS,
        );
        consumer
          .run({
            eachMessage: async ({ message }) => {
              const value = JSON.parse(message.value!.toString());
              if (value.jobId !== payload.jobId) return;
              clearTimeout(t);
              resolve({ key: message.key?.toString(), value });
            },
          })
          .catch(reject);
      },
    );

    await producer.send({
      topic: TOPIC,
      messages: [{ key: payload.userId, value: JSON.stringify(payload) }],
    });
    check("produce", true);

    const msg = await received;
    check("consume round trip", msg.value.jobId === payload.jobId);
    check("key preserved", msg.key === payload.userId, msg.key);

    const partitions = new Set<number>();
    for (let i = 0; i < 5; i++) {
      const res = await producer.send({
        topic: TOPIC,
        messages: [{ key: payload.userId, value: JSON.stringify({ i }) }],
      });
      partitions.add(res[0]?.partition ?? 0);
    }
    check("same key -> same partition", partitions.size === 1, [...partitions]);
  } catch (e) {
    check("up flow", false, e);
  } finally {
    await consumer.disconnect().catch(() => {});
    await producer.disconnect().catch(() => {});
    await admin.deleteTopics({ topics: [TOPIC] }).catch(() => {});
    await admin.disconnect().catch(() => {});
  }
}

async function testDown() {
  const kafka = new Kafka({
    clientId: "smoke-down",
    brokers: ["localhost:1"],
    connectionTimeout: 1500,
    logLevel: logLevel.NOTHING,
    retry: { retries: 0 },
  });
  const producer = kafka.producer();
  let threw = false;
  try {
    await producer.connect();
  } catch {
    threw = true;
  }
  check("broker down -> connect fails fast", threw);
  await producer.disconnect().catch(() => {});
}

await testUp();
await testDown();

console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);