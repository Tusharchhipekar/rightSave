import {
    mlChatResponseSchema,
    type MlChatRequest,
    type MlChatResponse,
  } from "@repo/types";
  
  const ML_WORKER_URL = process.env.ML_WORKER_URL ?? "http://localhost:8000";
  const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";
  const TIMEOUT_MS = 35_000;
  
  export async function callMlChat(payload: MlChatRequest): Promise<MlChatResponse> {
    const res = await fetch(`${ML_WORKER_URL}/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ml-worker /chat failed: ${res.status} ${text.slice(0, 200)}`);
    }
  
    const json = await res.json();
    const parsed = mlChatResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("ml-worker /chat returned invalid response shape");
    }
    return parsed.data;
  }