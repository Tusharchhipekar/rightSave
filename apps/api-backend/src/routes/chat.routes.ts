import { Router } from "express";
import { chat } from "../controllers/chat.controller";

const ChatRouter: Router = Router();

ChatRouter.post("/", chat);

export default ChatRouter;