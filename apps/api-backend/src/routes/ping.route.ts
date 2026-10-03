import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import { pingController } from "../controllers/ping.controller";

// Everything mounted on PingRouter requires a valid access token.
//Todo------
// Add protected routers here (content, collections, search, chat).
// The Instagram webhook is public (signature-verified), so it must NOT be mounted here.
const PingRouter: Router = Router();

PingRouter.use(requireAuth);
PingRouter.get("/ping", pingController);

export default PingRouter;