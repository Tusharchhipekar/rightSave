import type { AuthEventPayload } from "@repo/kafka";
import { config } from "../config/config";

export type Email = { subject: string; text: string; html: string };

// ip and userAgent come from the request, so they must be escaped.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatTime = (iso: string) => new Date(iso).toUTCString();

export function buildEmail(event: AuthEventPayload): Email {
  const app = config.APP_NAME;
  const time = formatTime(event.occurredAt);

  if (event.type === "login") {
    const ip = event.ip ?? "Unknown";
    const device = event.userAgent ?? "Unknown";

    return {
      subject: `New login to your ${app} account`,
      text: [
        `We noticed a new login to your ${app} account.`,
        ``,
        `Time: ${time}`,
        `IP address: ${ip}`,
        `Device: ${device}`,
        ``,
        `If this wasn't you, change your password right away.`,
      ].join("\n"),
      html: `
        <p>We noticed a new login to your ${escapeHtml(app)} account.</p>
        <ul>
          <li><b>Time:</b> ${escapeHtml(time)}</li>
          <li><b>IP address:</b> ${escapeHtml(ip)}</li>
          <li><b>Device:</b> ${escapeHtml(device)}</li>
        </ul>
        <p>If this wasn't you, change your password right away.</p>
      `,
    };
  }

  return {
    subject: `Your ${app} password was changed`,
    text: [
      `The password for your ${app} account was changed.`,
      ``,
      `Time: ${time}`,
      ``,
      `If this wasn't you, reset your password immediately.`,
    ].join("\n"),
    html: `
      <p>The password for your ${escapeHtml(app)} account was changed.</p>
      <p><b>Time:</b> ${escapeHtml(time)}</p>
      <p>If this wasn't you, reset your password immediately.</p>
    `,
  };
}