
const API_URL = process.env.API_URL ?? "http://localhost:4002";
const SEARCH_PATH = process.env.SEARCH_PATH ?? "/api/v1/search";
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const KEYWORD = process.env.KEYWORD ?? "husband"; // literal word in the reel caption
const SEMANTIC = process.env.SEMANTIC ?? "relationship humor"; // no literal match
 
if (!AUTH_TOKEN) {
  console.error("AUTH_TOKEN is required");
  process.exit(1);
}
 
const results: { name: string; ok: boolean }[] = [];
function check(name: string, ok: boolean) {
  results.push({ name, ok });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}`);
}
 
async function get(params: Record<string, string>, token: string | null = AUTH_TOKEN!) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}${SEARCH_PATH}?${qs}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text };
}
 
async function main() {
  console.log("\n[keyword]");
  const kw = await get({ q: KEYWORD });
  console.log("status", kw.status, "hits", kw.json?.content?.length);
  check("2xx", kw.status === 200);
  check("folders is an array", Array.isArray(kw.json?.folders));
  check("content has a hit", (kw.json?.content?.length ?? 0) > 0);
  check(
    "top hit is a keyword match",
    kw.json?.content?.[0]?.keywordMatch === true,
  );
 
  console.log("\n[semantic]");
  const sem = await get({ q: SEMANTIC });
  console.log(
    "status",
    sem.status,
    "semantic:",
    sem.json?.semantic,
    "scores:",
    (sem.json?.content ?? []).map((c: any) => c.semanticScore),
  );
  check("2xx", sem.status === 200);
  check("embedding worked (semantic=true)", sem.json?.semantic === true);
  // depends on SEARCH_MIN_SCORE; if this fails, look at the scores above
  check(
    "semantic-only hit found",
    (sem.json?.content ?? []).some(
      (c: any) => c.keywordMatch === false && c.semanticScore !== null,
    ),
  );
 
  console.log("\n[type filter]");
  const reel = await get({ q: KEYWORD, type: "reel" });
  check("type=reel returns the reel", (reel.json?.content?.length ?? 0) > 0);
  const post = await get({ q: KEYWORD, type: "post" });
  check(
    "type=post excludes reels",
    post.status === 200 &&
      (post.json?.content ?? []).every((c: any) => c.type === "post"),
  );
 
  console.log("\n[validation + auth]");
  check("bad type -> 400", (await get({ q: KEYWORD, type: "bogus" })).status === 400);
  check("short q -> 400", (await get({ q: "a" })).status === 400);
  check("no token -> 401", (await get({ q: KEYWORD }, null)).status === 401);
 
  const ok = results.every((r) => r.ok);
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
}
 
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
 