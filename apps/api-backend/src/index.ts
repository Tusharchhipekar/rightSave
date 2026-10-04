import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "./config/config";
import protectedRouter from "./routes/protected.route";
import IGWebhookRouter from "./routes/instagram-webhook.routes";
import instagramLinkRoutes from "./routes/instagram-link.routes";
import { notFound, errorHandler } from "./middlewares/error.middleware";
import { prisma } from "@repo/db-prisma";
import { getRedis, redisPing, closeRedis } from "@repo/redis";
import {
  ensureTopics,
  ALL_TOPICS,
  disconnectProducer,
  disconnectConsumers,
} from "@repo/kafka";
import { startIngestSweeper } from "./services/ingest-sweeper";
import { startContentProcessedConsumer } from "./services/content-processed-consumer";

const app = express();
// TODO(k8s): app.set("trust proxy", <real hop count>) once deployed behind an ingress.
app.use(morgan("dev"));
app.use("/webhooks/instagram", IGWebhookRouter);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

const withTimeout = <T>(p: Promise<T>, ms = 2000) =>
  Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/readyz", async (_req, res) => {
  let db = false;
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`);
    db = true;
  } catch {}

  // Redis fails open everywhere, so it is reported but does not affect readiness.
  const redis = await withTimeout(redisPing()).catch(() => false);

  res
    .status(db ? 200 : 503)
    .json({ status: db ? "ready" : "not_ready", db, redis });
});

app.use("/api/v1", protectedRouter);
app.use("/api/v1/instagram", instagramLinkRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await prisma.$connect();
  await getRedis();
  try {
    await ensureTopics(ALL_TOPICS);
  } catch (err) {
    console.error("[kafka] ensureTopics failed:", (err as Error).message);
  }
  try {
    await startContentProcessedConsumer();
  } catch (err) {
    console.error("[kafka] consumer start failed:", (err as Error).message);
  }

  const server = app.listen(config.API_BACKEND_PORT, () => {
    console.log(`API is running on port ${config.API_BACKEND_PORT}`);
  });

  const sweeper = startIngestSweeper();

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);
    clearInterval(sweeper);
    const force = setTimeout(() => process.exit(1), 10000);
    force.unref();
    server.close(async () => {
      await Promise.allSettled([
        disconnectConsumers(),
        disconnectProducer(),
        closeRedis(),
        prisma.$disconnect(),
      ]);
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});

export default app;