import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import {
  signinController,
  signupController,
  logoutController,
  refreshController,
  meController
} from "../controllers/auth.controller";

const AuthRouter: Router = Router();

AuthRouter.post("/signup", signupController);
AuthRouter.post("/signin", signinController);
AuthRouter.post("/logout", logoutController);
AuthRouter.post("/refresh", refreshController);
AuthRouter.get("/me", requireAuth, meController);

export default AuthRouter;