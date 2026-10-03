import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { config } from "./config/config";
import PingRouter from "./routes/ping.route";
import { notFound, errorHandler } from "./middlewares/error.middleware";

const app = express();
// TODO(k8s): app.set("trust proxy", <real hop count>) once deployed behind an ingress.
app.use(morgan("dev"));
app.use(express.json());
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

app.use("/api/v1", PingRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.API_BACKEND_PORT, () => {
  console.log(`API is running on port ${config.API_BACKEND_PORT}`);
});

export default app;