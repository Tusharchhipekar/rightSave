import { getRedis } from "@repo/redis";

const PORT = process.env.PORT ?? "4001";
const ROOT = `http://localhost:${PORT}`;
const BASE = `${ROOT}/api/v1/auth`;

// Must match the limits in routes/auth.route.ts
const SIGNUP_LIMIT = 5;
const SIGNIN_LIMIT = 10;

const suffix = Date.now();
const user = {
  username: `tushar_${suffix}`,
  email: `tushar_${suffix}@test.com`,
  password: "password123",
  fullName: "Tushar",
};

let passed = 0;
let failed = 0;

const check = (name: string, ok: boolean, extra?: unknown) => {
  if (ok) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`, extra ?? "");
  }
};

const post = (path: string, body?: unknown, cookie?: string) =>
  fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

const getRefreshCookie = (res: Response) => {
  const raw = res.headers
    .getSetCookie()
    .find((c) => c.startsWith("refreshToken="));
  return raw?.split(";")[0];
};

// Clears the signup/signin rate-limit buckets so runs don't affect each other.
// Returns false if Redis is unreachable (limiter fails open, so limit tests can't run).
const resetLimits = async (): Promise<boolean> => {
  const r = await getRedis();
  if (!r) return false;
  const found = [
    ...(await r.keys("rl:signup:*")),
    ...(await r.keys("rl:signin:*")),
  ];
  if (found.length) await r.del(found);
  return true;
};

const run = async () => {
  const redisUp = await resetLimits();

  // health
  const health = await fetch(`${ROOT}/healthz`);
  check("healthz returns 200", health.status === 200);

  // signup
  const signup = await post("/signup", user);
  const signupBody: any = await signup.json();
  check("signup returns 201", signup.status === 201, signupBody);
  check("signup returns accessToken", !!signupBody.accessToken);
  check("signup sets refreshToken cookie", !!getRefreshCookie(signup));

  // signup duplicate
  const dup = await post("/signup", user);
  check("duplicate signup returns 400", dup.status === 400);

  // signup invalid input
  const invalid = await post("/signup", { username: "x", email: "bad" });
  check("invalid signup returns 400", invalid.status === 400);

  // signin by email
  const signinEmail = await post("/signin", {
    identifier: user.email,
    password: user.password,
  });
  const signinBody: any = await signinEmail.json();
  const refreshCookie = getRefreshCookie(signinEmail);
  check("signin by email returns 200", signinEmail.status === 200, signinBody);
  check("signin sets refreshToken cookie", !!refreshCookie);

  // signin by username
  const signinUsername = await post("/signin", {
    identifier: user.username,
    password: user.password,
  });
  check("signin by username returns 200", signinUsername.status === 200);

  // signin wrong password
  const wrongPass = await post("/signin", {
    identifier: user.username,
    password: "wrongpassword",
  });
  check("wrong password returns 401", wrongPass.status === 401);

  // signin unknown user
  const unknown = await post("/signin", {
    identifier: "nobody_here",
    password: "password123",
  });
  check("unknown user returns 401", unknown.status === 401);

  // me
  const me = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${signinBody.accessToken}` },
  });
  const meBody: any = await me.json();
  check("me returns 200", me.status === 200, meBody);
  check("me returns correct user", meBody.user?.email === user.email);

  // me without token
  const meNoToken = await fetch(`${BASE}/me`);
  check("me without token returns 401", meNoToken.status === 401);

  // me with garbage token
  const meBad = await fetch(`${BASE}/me`, {
    headers: { Authorization: "Bearer garbage.token.here" },
  });
  check("me with invalid token returns 401", meBad.status === 401);

  // refresh
  const refresh = await post("/refresh", undefined, refreshCookie);
  const refreshBody: any = await refresh.json();
  check("refresh returns 200", refresh.status === 200, refreshBody);
  check("refresh returns new accessToken", !!refreshBody.accessToken);

  // refresh without cookie
  const refreshNone = await post("/refresh");
  check("refresh without cookie returns 401", refreshNone.status === 401);

  // refresh with access token in place of refresh token (wrong type)
  const refreshWrong = await post(
    "/refresh",
    undefined,
    `refreshToken=${signinBody.accessToken}`,
  );
  check("refresh with access token returns 401", refreshWrong.status === 401);

  // logout
  const logout = await post("/logout", undefined, refreshCookie);
  const cleared = logout.headers
    .getSetCookie()
    .some((c) => c.startsWith("refreshToken=;"));
  check("logout returns 200", logout.status === 200);
  check("logout clears refreshToken cookie", cleared);

  // ---- rate limiting ----
  // Invalid bodies are used on purpose: the limiter runs before validation,
  // so each request counts, but nothing touches the DB or hashes a password.
  if (!redisUp) {
    console.log("SKIP  rate limit tests (Redis unreachable, limiter fails open)");
  } else {
    await resetLimits();

    // signup: first SIGNUP_LIMIT requests pass through, next one is blocked
    const signupStatuses: number[] = [];
    let firstSignup: Response | undefined;
    for (let i = 0; i < SIGNUP_LIMIT; i++) {
      const res = await post("/signup", {});
      if (i === 0) firstSignup = res;
      signupStatuses.push(res.status);
    }
    check(
      `signup: first ${SIGNUP_LIMIT} requests are not rate limited`,
      signupStatuses.every((s) => s === 400),
      signupStatuses,
    );
    check(
      "signup: X-RateLimit-Remaining counts down",
      firstSignup?.headers.get("X-RateLimit-Remaining") ===
        String(SIGNUP_LIMIT - 1),
      firstSignup?.headers.get("X-RateLimit-Remaining"),
    );

    const signupBlocked = await post("/signup", {});
    check(
      `signup: request ${SIGNUP_LIMIT + 1} returns 429`,
      signupBlocked.status === 429,
      signupBlocked.status,
    );
    check(
      "signup: 429 includes Retry-After",
      Number(signupBlocked.headers.get("Retry-After")) > 0,
      signupBlocked.headers.get("Retry-After"),
    );

    // signin has its own bucket, so it must be unaffected by the signup block
    const signinFirst = await post("/signin", {});
    check(
      "signin: separate bucket, not blocked by signup limit",
      signinFirst.status === 400,
      signinFirst.status,
    );

    // signin: SIGNIN_LIMIT total (one already sent above)
    const signinStatuses: number[] = [signinFirst.status];
    for (let i = 1; i < SIGNIN_LIMIT; i++) {
      const res = await post("/signin", {});
      signinStatuses.push(res.status);
    }
    check(
      `signin: first ${SIGNIN_LIMIT} requests are not rate limited`,
      signinStatuses.every((s) => s === 400),
      signinStatuses,
    );

    const signinBlocked = await post("/signin", {});
    check(
      `signin: request ${SIGNIN_LIMIT + 1} returns 429`,
      signinBlocked.status === 429,
      signinBlocked.status,
    );
    check(
      "signin: 429 includes Retry-After",
      Number(signinBlocked.headers.get("Retry-After")) > 0,
      signinBlocked.headers.get("Retry-After"),
    );

    // leave buckets clean so the next run (or manual testing) isn't blocked
    await resetLimits();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});