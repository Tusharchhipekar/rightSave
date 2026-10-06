import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import { pingController } from "../controllers/ping.controller";
import ContentRouter from "./content.routes";
import CollectionsRouter from "./collections.route";
import ChatRouter from "./chat.routes";
import MemoryRouter from "./memory.routes";
import SearchRouter from "./search.routes";

const ProtectedRouter: Router = Router();

ProtectedRouter.use(requireAuth);
ProtectedRouter.get("/ping", pingController);
ProtectedRouter.use("/content", ContentRouter);
ProtectedRouter.use("/collections", CollectionsRouter);
ProtectedRouter.use("/chat", ChatRouter);
ProtectedRouter.use("/memories", MemoryRouter);
ProtectedRouter.use("/search", SearchRouter);


export default ProtectedRouter;