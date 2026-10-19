import { Router } from "express";
import {
  chat,
  forgetMemories,
  listConversationMessages,
  listConversations,
} from "../controllers/chat.controller";

const ChatRouter: Router = Router();

ChatRouter.post("/", chat);
ChatRouter.delete("/memories", forgetMemories);
ChatRouter.get("/conversations", listConversations);
ChatRouter.get("/conversations/:id/messages", listConversationMessages);

export default ChatRouter;
