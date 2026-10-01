import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import { config } from "./config/config";


const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(config.AUTH_SERVICE_PORT, () => {
  console.log(`Auth service is running on port ${config.AUTH_SERVICE_PORT}`);
});

export default app;