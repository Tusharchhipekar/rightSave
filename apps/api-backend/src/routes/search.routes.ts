import { Router } from "express";
import { search } from "../controllers/search.controller";

const SearchRouter: Router = Router();

SearchRouter.get("/", search);

export default SearchRouter;