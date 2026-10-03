import express, { Router } from "express";
import {
  verifyWebhook,
  receiveWebhook,
} from "../controllers/instagram-webhook.controller";
import { verifyIgSignature } from "../middlewares/verify-ig-signature";

const IGWebhookRouter: Router = Router();

IGWebhookRouter.get("/", verifyWebhook);

IGWebhookRouter.post(
  "/",
  express.raw({ type: "*/*", limit: "1mb" }),
  verifyIgSignature,
  receiveWebhook
);

export default IGWebhookRouter;