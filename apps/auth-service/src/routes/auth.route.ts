import { Router } from "express";
import { requireAuth } from "@repo/auth-guard";
import {
  signinController,
  signupController,
  logoutController,
  refreshController,
  meController,
  changePasswordController,
} from "../controllers/auth.controller";
import { rateLimiter } from "../middleware/ratelimit.middleware";

const AuthRouter: Router = Router();

const signupLimiter = rateLimiter({ name: "signup", limit: 5, windowSeconds: 10 * 60 });
const signinLimiter = rateLimiter({ name: "signin", limit: 10, windowSeconds: 15 * 60 });
const changePasswordLimiter = rateLimiter({ name: "change-password", limit: 5, windowSeconds: 15 * 60 });

AuthRouter.post("/signup", signupLimiter, signupController);
AuthRouter.post("/signin", signinLimiter, signinController);
AuthRouter.post("/logout", logoutController);
AuthRouter.post("/refresh", refreshController);
AuthRouter.get("/me", requireAuth, meController);
AuthRouter.post("/change-password", requireAuth, changePasswordLimiter, changePasswordController);

export default AuthRouter;