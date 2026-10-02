import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!process.env.AUTH_SERVICE_PORT) {
  throw new Error("AUTH_SERVICE_PORT is not set");
}

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

export const config = { 
    AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
}