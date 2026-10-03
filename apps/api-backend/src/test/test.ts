const PORT = process.env.API_BACKEND_PORT ?? "4002";
const ROOT = `http://localhost:${PORT}`;
const BASE = `${ROOT}/api/v1`;
const AUTH_BASE = `${process.env.AUTH_URL ?? "http://localhost:4001"}/api/v1/auth`;

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

const run = async () => {
  // health
  const health = await fetch(`${ROOT}/healthz`);
  check("healthz returns 200", health.status === 200);

  const ready = await fetch(`${ROOT}/readyz`);
  check("readyz returns 200", ready.status === 200);

  // unknown route
  const nf = await fetch(`${ROOT}/nope`);
  check("unknown route returns 404", nf.status === 404);

  // protected route without token
  const noToken = await fetch(`${BASE}/ping`);
  check("ping without token returns 401", noToken.status === 401);

  // protected route with garbage token
  const bad = await fetch(`${BASE}/ping`, {
    headers: { Authorization: "Bearer garbage.token.here" },
  });
  check("ping with invalid token returns 401", bad.status === 401);

  // protected route with a real token from auth-service
  let accessToken: string | undefined;
  let userId: string | undefined;
  try {
    const signup = await fetch(`${AUTH_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const body: any = await signup.json();
    accessToken = body.accessToken;
    userId = body.user?.id;
  } catch {
    // auth-service not running
  }

  if (!accessToken) {
    console.log("SKIP  authenticated ping (auth-service unreachable or signup failed)");
  } else {
    const ok = await fetch(`${BASE}/ping`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const okBody: any = await ok.json();
    check("ping with valid token returns 200", ok.status === 200, okBody);
    check("ping returns the token's user id", okBody.userId === userId, okBody);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});