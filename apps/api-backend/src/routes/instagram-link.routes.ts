import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import { createLinkCode, getLinkStatus } from "../controllers/instagram-link.controller";

const LinkCoderouter: Router = Router();

LinkCoderouter.post("/link-code", requireAuth, createLinkCode);
LinkCoderouter.get("/status", requireAuth, getLinkStatus);

export default LinkCoderouter;