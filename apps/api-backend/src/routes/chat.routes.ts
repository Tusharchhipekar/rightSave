import { Router } from "express";
import { chat, forgetMemories } from "../controllers/chat.controller";

const ChatRouter: Router = Router();

ChatRouter.post("/", chat);
ChatRouter.delete("/memories", forgetMemories);

export default ChatRouter;