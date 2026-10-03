import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config/config";

export const verifyIgSignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawBody: Buffer = req.body;
  const signature = req.header("x-hub-signature-256") || "";
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", config.ig.appSecret).update(rawBody).digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return res.sendStatus(401);
  }
  next();
};