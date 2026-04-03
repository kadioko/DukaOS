const test = require("node:test");
const assert = require("node:assert/strict");

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

async function login() {
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: LOGIN_PHONE, pin: LOGIN_PIN }),
  });

  assert.equal(result.response.status, 200, `Login failed: ${result.response.status} ${JSON.stringify(result.payload)}`);
  assert.ok(result.payload?.token, "Expected login token");
  return result.payload.token;
}

test("health endpoint returns ok", async () => {
  const result = await request("/health");
  assert.equal(result.response.status, 200);
  assert.equal(result.payload?.status, "ok");
});

test("authenticated me endpoint returns current user", async () => {
  const token = await login();
  const result = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(result.response.status, 200);
  assert.equal(result.payload?.user?.phone, LOGIN_PHONE);
});

test("invalid token is rejected", async () => {
  const result = await request("/api/auth/me", {
    headers: { Authorization: "Bearer definitely-invalid-token" },
  });

  assert.equal(result.response.status, 401);
});

test("invalid sales payload is rejected", async () => {
  const token = await login();
  const result = await request("/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items: [] }),
  });

  assert.equal(result.response.status, 400);
});

test("invalid stock payload is rejected", async () => {
  const token = await login();
  const result = await request("/api/stock/adjust", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId: "", type: "BAD", quantity: 0 }),
  });

  assert.equal(result.response.status, 400);
});

test("invalid supplier payload is rejected", async () => {
  const token = await login();
  const result = await request("/api/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: "", phone: "" }),
  });

  assert.equal(result.response.status, 400);
});
