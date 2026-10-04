import { Router } from "express";
import {
  listContent,
  getContent,
  deleteContent,
} from "../controllers/content.controller";

const ContentRouter: Router = Router();

ContentRouter.get("/", listContent);
ContentRouter.get("/:id", getContent);
ContentRouter.delete("/:id", deleteContent);

export default ContentRouter;