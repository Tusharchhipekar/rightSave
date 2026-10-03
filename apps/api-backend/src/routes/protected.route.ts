import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import { pingController } from "../controllers/ping.controller";


// Everything mounted on protectedRouter requires a valid access token.
// TODO: mount content, collections, search, chat routers here.
// The Instagram webhook is public (signature-verified) and must NOT be mounted here.
const ProtectedRouter: Router = Router();

ProtectedRouter.use(requireAuth);
ProtectedRouter.get("/ping", pingController);

export default ProtectedRouter;