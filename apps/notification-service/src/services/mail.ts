import nodemailer from "nodemailer";
import type { AuthEventPayload } from "@repo/kafka";
import { config } from "../config/config";
import { buildEmail } from "./templates";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
});

export const verifyMailer = () => transporter.verify();

export async function sendAuthEventEmail(event: AuthEventPayload) {
  const { subject, text, html } = buildEmail(event);

  await transporter.sendMail({
    from: config.MAIL_FROM,
    to: event.email,
    subject,
    text,
    html,
  });
}