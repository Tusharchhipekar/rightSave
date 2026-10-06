import dotenv from "dotenv";
dotenv.config();

if (!process.env.NOTIFICATION_PORT) {
  throw new Error("NOTIFICATION_PORT is not set");
}

if (!process.env.SMTP_HOST) {
  throw new Error("SMTP_HOST is not set");
}

if (!process.env.SMTP_PORT) {
  throw new Error("SMTP_PORT is not set");
}

if (!process.env.SMTP_USER) {
  throw new Error("SMTP_USER is not set");
}

if (!process.env.SMTP_PASS) {
  throw new Error("SMTP_PASS is not set");
}

if (!process.env.MAIL_FROM) {
  throw new Error("MAIL_FROM is not set");
}

if (!process.env.APP_NAME) {
  throw new Error("APP_NAME is not set");
}

export const config = {
  NOTIFICATION_PORT: Number(process.env.NOTIFICATION_PORT),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
  APP_NAME: process.env.APP_NAME,
};