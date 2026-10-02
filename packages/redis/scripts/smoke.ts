import { redisPing, getOrSet, setNX, rateLimit, keys, closeRedis } from "../src";

const down = process.argv[2] === "down";
let failed = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
};

const run = Date.now();

check(`ping -> ${down ? "false" : "true"}`, (await redisPing()) === !down);

let calls = 0;
const fetcher = async () => ({ n: ++calls });
const k = `smoke:${run}`;
await getOrSet(k, 30, fetcher);
await getOrSet(k, 30, fetcher);
check(
  down ? "getOrSet hits fetcher every time (fail open)" : "getOrSet caches (fetcher called once)",
  down ? calls === 2 : calls === 1,
);

const nxKey = keys.webhook("smoke", String(run));
const first = await setNX(nxKey, 30);
const second = await setNX(nxKey, 30);
check(
  down ? "setNX fails open (true, true)" : "setNX true then false",
  down ? first && second : first && !second,
);

const rlKey = keys.rateLimit("smoke", String(run));
const results = [];
for (let i = 0; i < 5; i++) results.push(await rateLimit(rlKey, 3, 10));
check(
  down ? "rateLimit fails open (all allowed)" : "rateLimit blocks after 3",
  down
    ? results.every((r) => r.allowed)
    : results.slice(0, 3).every((r) => r.allowed) && results.slice(3).every((r) => !r.allowed),
);

await closeRedis();
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
