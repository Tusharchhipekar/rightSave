import { useAuthStore } from "@/features/auth/store";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:4001/api/v1";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // body was not JSON
  }
  return res.statusText || "Request failed";
}

let refreshPromise: Promise<string | null> | null = null;

// One refresh at a time: parallel 401s share the same request.
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${AUTH_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return null;

        const data = (await res.json()) as { accessToken?: string };
        if (!data.accessToken) return null;

        useAuthStore.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function createClient(baseUrl: string) {
  const send = (
    path: string,
    options: RequestOptions,
    token: string | null,
  ) => {
    const hasBody = options.body !== undefined;
    const headers: Record<string, string> = {};
    if (hasBody) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${baseUrl}${path}`, {
      method: options.method ?? (hasBody ? "POST" : "GET"),
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "include",
      signal: options.signal,
    });
  };

  return async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const sentToken = useAuthStore.getState().accessToken;
    let res = await send(path, options, sentToken);

    // Expired access token: refresh once and retry.
    if (res.status === 401 && sentToken) {
      const fresh = await refreshAccessToken();
      if (fresh) {
        res = await send(path, options, fresh);
      } else {
        useAuthStore.getState().clear();
      }
    }

    if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  };
}

export const authClient = createClient(AUTH_URL);
export const apiClient = createClient(API_URL);