import { Router } from "express";
import { deleteMemory, listMemories } from "../controllers/memory.controller";

const MemoryRouter: Router = Router();

MemoryRouter.get("/", listMemories);
MemoryRouter.delete("/:id", deleteMemory);

export default MemoryRouter;