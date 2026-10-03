import type { NextFunction, Request, Response } from "express";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ message: "Something went wrong. Please try again later." });
};