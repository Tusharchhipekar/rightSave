import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import { createLinkCode } from "../controllers/instagram-link.controller";

const LinkCoderouter: Router = Router();

LinkCoderouter.post("/link-code", requireAuth, createLinkCode);

export default LinkCoderouter;