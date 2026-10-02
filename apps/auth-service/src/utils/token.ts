import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ sub: userId, type: "access" }, config.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: "10m",
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ sub: userId, type: "refresh" }, config.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
};