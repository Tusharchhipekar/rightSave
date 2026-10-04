import { config } from "../config/config";


export async function sendIgMessage(igUserId: string, text: string): Promise<void> {
  try {
    const res = await fetch(`${config.ig.graphBase}/me/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.ig.accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: igUserId },
        message: { text },
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error("[ig-send] failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[ig-send] error", (err as Error).message);
  }
}