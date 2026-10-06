import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@repo/db-prisma";
import { auth } from "@repo/types";
import { publish, Topics, type AuthEventPayload } from "@repo/kafka";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { REFRESH_COOKIE_OPTIONS } from "../utils/cookie-options";
import { config } from "../config/config";

export const signupController = async (req: Request, res: Response) => {
  try {
    const result = auth.SignupApiRequestSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    const { username, fullName, email, password } = result.data;

    const userExist = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (userExist) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const passwordHash = await Bun.password.hash(password, {
      algorithm: "bcrypt",
    });

    const newUser = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        accounts: {
          create: {
            provider: "credentials",
            providerAccountId: email,
            passwordHash,
          },
        },
      },
    });

    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    const response: auth.AuthResponse = {
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const result = auth.SigninApiRequestSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    const { identifier, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
      include: {
        accounts: { where: { provider: "credentials" } },
      },
    });

    const passwordHash = user?.accounts[0]?.passwordHash;

    if (!user || !passwordHash) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValid = await Bun.password.verify(password, passwordHash, "bcrypt");

    if (!isValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    // Fire-and-forget: a Kafka failure must never block a successful signin.
    void publish<AuthEventPayload>({
      topic: Topics.AUTH_EVENTS,
      key: user.id,
      payload: {
        type: "login",
        userId: user.id,
        email: user.email,
        occurredAt: new Date().toISOString(),
        ip: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
      },
    }).catch((err) => console.error("[auth-events] publish failed", err));

    const response: auth.AuthResponse = {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Signin error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const logoutController = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    let payload: auth.JwtPayload;
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        algorithms: ["HS256"],
      });
      const parsed = auth.JwtPayloadSchema.safeParse(decoded);

      if (!parsed.success || parsed.data.type !== "refresh") {
        res.status(401).json({ message: "Invalid refresh token" });
        return;
      }
      payload = parsed.data;
    } catch {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });

    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    const accessToken = generateAccessToken(user.id);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const response: auth.AuthUser = user;

    res.status(200).json({ user: response });
  } catch (error) {
    console.error("Me error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body ?? {};

    // Keep the min length in sync with your signup password rule.
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    if (currentPassword === newPassword) {
      res
        .status(400)
        .json({ message: "New password must be different from the current one" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: { where: { provider: "credentials" } },
      },
    });

    const currentHash = user?.accounts[0]?.passwordHash;

    if (!user || !currentHash) {
      res.status(400).json({ message: "Password change is not available" });
      return;
    }

    const isValid = await Bun.password.verify(
      currentPassword,
      currentHash,
      "bcrypt",
    );

    if (!isValid) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const newHash = await Bun.password.hash(newPassword, {
      algorithm: "bcrypt",
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        accounts: {
          updateMany: {
            where: { provider: "credentials" },
            data: { passwordHash: newHash },
          },
        },
      },
    });

    // Fire-and-forget: a Kafka failure must never block the password change.
    void publish<AuthEventPayload>({
      topic: Topics.AUTH_EVENTS,
      key: user.id,
      payload: {
        type: "password_changed",
        userId: user.id,
        email: user.email,
        occurredAt: new Date().toISOString(),
      },
    }).catch((err) => console.error("[auth-events] publish failed", err));

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};