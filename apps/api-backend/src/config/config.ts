import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!process.env.API_BACKEND_PORT) {
  throw new Error("API_BACKEND_PORT is not set");
}

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV is not set");
}

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not set");
}

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not set");
}

if (!process.env.KAFKA_BROKERS) {
  throw new Error("KAFKA_BROKERS is not set");
}

export const config = {
  API_BACKEND_PORT: process.env.API_BACKEND_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  KAFKA_BROKERS: process.env.KAFKA_BROKERS,
};