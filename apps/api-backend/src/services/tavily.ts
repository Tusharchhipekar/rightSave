import { config } from "../config/config";

export type WebResult = { title: string; url: string; content: string };

export const tavilyEnabled = () => config.tavily.apiKey.length > 0;

export async function webSearch(
  query: string,
  maxResults = 5,
): Promise<WebResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.tavily.apiKey}`,
    },
    body: JSON.stringify({
      query: query.slice(0, 400),
      search_depth: "basic",
      max_results: maxResults,
      include_answer: false,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`tavily ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    results?: { title?: string; url?: string; content?: string }[];
  };

  return (data.results ?? [])
    .filter((r) => r.url && r.content)
    .map((r) => ({
      title: r.title || r.url!,
      url: r.url!,
      content: r.content!.slice(0, 800),
    }));
}