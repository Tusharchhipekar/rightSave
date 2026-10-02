import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser"
import { config } from "./config/config";
import AuthRouter from "./routes/auth.route";


const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/readyz", (_req, res) => {
  res.status(200).json({ status: "ready" });
});

app.use("/api/v1/auth", AuthRouter);

app.listen(config.AUTH_SERVICE_PORT, () => {
  console.log(`Auth service is running on port ${config.AUTH_SERVICE_PORT}`);
});

export default app;