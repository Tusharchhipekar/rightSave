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

if(!process.env.NODE_ENV){
  throw new Error("NODE_ENV is not set");
}

if(!process.env.JWT_ACCESS_SECRET){
  throw new Error("JWT_ACCESS_SECRET is not set");
}

if(!process.env.JWT_REFRESH_SECRET){
  throw new Error("JWT_REFRESH_SECRET is not set");
}

if(!process.env.FRONTEND_URL){
  throw new Error("FRONTEND_URL is not set");
}



export const config = { 
    AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ,
    FRONTEND_URL: process.env.FRONTEND_URL ,
}