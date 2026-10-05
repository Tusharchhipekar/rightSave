import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import { pingController } from "../controllers/ping.controller";
import ContentRouter from "./content.routes";
import CollectionsRouter from "./collections.route";
import ChatRouter from "./chat.routes";
import MemoryRouter from "./memory.routes";


// Everything mounted on protectedRouter requires a valid access token.
// TODO: mount content, collections, search, chat routers here.
// The Instagram webhook is public (signature-verified) and must NOT be mounted here.
const ProtectedRouter: Router = Router();

ProtectedRouter.use(requireAuth);
ProtectedRouter.get("/ping", pingController);
ProtectedRouter.use("/content", ContentRouter);
ProtectedRouter.use("/collections", CollectionsRouter);
ProtectedRouter.use("/chat", ChatRouter);
ProtectedRouter.use("/memories", MemoryRouter);


export default ProtectedRouter;