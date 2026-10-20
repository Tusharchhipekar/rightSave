import { Router } from "express";
import passport from "passport";
import { requireAuth } from "@repo/auth-guard";
import { config } from "../config/config";
import {
  signinController,
  signupController,
  logoutController,
  refreshController,
  meController,
  changePasswordController,
  googleCallbackController,
} from "../controllers/auth.controller";

const AuthRouter: Router = Router();

AuthRouter.post("/signup", signupController);
AuthRouter.post("/signin", signinController);
AuthRouter.post("/logout", logoutController);
AuthRouter.post("/refresh", refreshController);
AuthRouter.get("/me", requireAuth, meController);
AuthRouter.post("/change-password", requireAuth, changePasswordController);

AuthRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

AuthRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.FRONTEND_URL}/login?error=google_failed`,
  }),
  googleCallbackController,
);

export default AuthRouter;
