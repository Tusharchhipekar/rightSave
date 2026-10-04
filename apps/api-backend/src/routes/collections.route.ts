import { Router } from "express";
import {
  listCollections,
  createCollection,
  renameCollection,
  deleteCollection,
  listCollectionContent,
  addContentToCollection,
  removeContentFromCollection,
} from "../controllers/collections.controller";

const CollectionsRouter: Router = Router();

CollectionsRouter.get("/", listCollections);
CollectionsRouter.post("/", createCollection);
CollectionsRouter.patch("/:id", renameCollection);
CollectionsRouter.delete("/:id", deleteCollection);
CollectionsRouter.get("/:id/content", listCollectionContent);
CollectionsRouter.post("/:id/content", addContentToCollection);
CollectionsRouter.delete("/:id/content/:contentId", removeContentFromCollection);

export default CollectionsRouter;