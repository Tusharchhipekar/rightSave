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

if (!process.env.KAFKA_CLIENT_ID) {
  throw new Error("KAFKA_CLIENT_ID is not set");
}

if (!process.env.KAFKA_SSL) {
  throw new Error("KAFKA_SSL is not set");
}

if (!process.env.IG_VERIFY_TOKEN) {
  throw new Error("IG_VERIFY_TOKEN is not set");
}

if (!process.env.IG_APP_SECRET) {
  throw new Error("IG_APP_SECRET is not set");
}

if (!process.env.IG_ACCESS_TOKEN) {
  throw new Error("IG_ACCESS_TOKEN is not set");
}

if (!process.env.IG_ACCESS_TOKEN) {
  throw new Error("IG_ACCESS_TOKEN is not set");
}

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is not set");
}

export const config = {
  API_BACKEND_PORT: process.env.API_BACKEND_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  KAFKA_BROKERS: process.env.KAFKA_BROKERS,
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
  KAFKA_SSL: process.env.KAFKA_SSL === "true",


  ig: {
    verifyToken: process.env.IG_VERIFY_TOKEN!,
    appSecret: process.env.IG_APP_SECRET!,
    accessToken: process.env.IG_ACCESS_TOKEN!,
     graphBase: process.env.IG_GRAPH_BASE ?? "https://graph.instagram.com/v26.0"
  },


  mistral: {
    apiKey: process.env.MISTRAL_API_KEY!,
    chatModel: process.env.MISTRAL_CHAT_MODEL ?? "mistral-small-latest",
    embedModel: process.env.MISTRAL_EMBED_MODEL ?? "mistral-embed",
  },

 
  tavily: {
    apiKey: process.env.TAVILY_API_KEY ?? "",
  },
};