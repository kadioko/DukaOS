const PROD_BASE_URL = process.env.SMOKE_BASE_URL || "https://dukaos-production.up.railway.app";
const LOGIN_PHONE = process.env.SMOKE_TEST_PHONE || "+255700000003";
const LOGIN_PIN = process.env.SMOKE_TEST_PIN || "1234";

async function request(path, options = {}) {
  const response = await fetch(`${PROD_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  return { response, payload };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  console.log(`Running smoke test against ${PROD_BASE_URL}`);

  const health = await request("/health");
  assert(health.response.ok, `Healthcheck failed: ${health.response.status}`);
  assert(health.payload?.status === "ok", "Healthcheck payload did not include status=ok");
  console.log("✓ Healthcheck passed");

  const login = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: LOGIN_PHONE, pin: LOGIN_PIN }),
  });
  assert(login.response.ok, `Login failed: ${login.response.status} ${JSON.stringify(login.payload)}`);
  assert(login.payload?.token, "Login response did not include a token");
  console.log("✓ Login passed");

  const me = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${login.payload.token}` },
  });
  assert(me.response.ok, `Auth /me failed: ${me.response.status} ${JSON.stringify(me.payload)}`);
  assert(me.payload?.user?.phone === LOGIN_PHONE, "Auth /me returned an unexpected user");
  console.log("✓ Authenticated /me passed");

  const invalid = await request("/api/auth/me", {
    headers: { Authorization: "Bearer definitely-invalid-token" },
  });
  assert(invalid.response.status === 401, `Invalid token check expected 401, got ${invalid.response.status}`);
  console.log("✓ Invalid token handling passed");

  console.log("Smoke test completed successfully.");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
