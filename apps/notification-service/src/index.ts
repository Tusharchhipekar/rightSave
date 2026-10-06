import express from "express";
import {
  subscribe,
  ensureTopics,
  ALL_TOPICS,
  registerGracefulShutdown,
  Topics,
  AuthEventSchema,
  type AuthEventPayload,
} from "@repo/kafka";
import { config } from "./config/config";
import { sendAuthEventEmail, verifyMailer } from "./services/mail";

async function main() {
  // Fail fast if the SMTP credentials are wrong.
  await verifyMailer();

  // Make sure auth-events and auth-events.dlq exist before subscribing.
  await ensureTopics(ALL_TOPICS);

  await subscribe<AuthEventPayload>({
    topic: Topics.AUTH_EVENTS,
    groupId: "notification-auth-events",
    schema: AuthEventSchema,
    handler: async (payload) => {
      await sendAuthEventEmail(payload);
      console.log("[notification] sent", payload.type, payload.userId);
    },
  });

  const app = express();

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const server = app.listen(config.NOTIFICATION_PORT, () => {
    console.log(`[notification] http on :${config.NOTIFICATION_PORT}`);
  });

  registerGracefulShutdown(
    () => new Promise<void>((resolve) => server.close(() => resolve())),
  );

  console.log("[notification] listening on auth-events");
}

main().catch((err) => {
  console.error("[notification] failed to start", err);
  process.exit(1);
});