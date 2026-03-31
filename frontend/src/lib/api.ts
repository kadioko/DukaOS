const PROD_API_URL = "https://backend-production-a87a.up.railway.app/api";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  }

  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return normalizeBaseUrl(PROD_API_URL);
  }

  return normalizeBaseUrl("http://localhost:4000/api");
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dukaos_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const baseUrl = getBaseUrl();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error("Unable to reach the DukaOS server. Confirm the API URL is correct and the backend is online.");
  }

  if (res.status === 401) {
    localStorage.removeItem("dukaos_token");
    window.location.href = "/";
    throw new Error("Session expired");
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "string"
        ? payload || `Request failed with status ${res.status}`
        : payload?.error || `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  if (!isJson) {
    throw new Error("The DukaOS server returned an unexpected response format.");
  }

  const data = payload;
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function setToken(token: string) {
  localStorage.setItem("dukaos_token", token);
}

export function clearToken() {
  localStorage.removeItem("dukaos_token");
}

export function formatTZS(amount: number): string {
  return `TZS ${Number(amount).toLocaleString("en-TZ")}`;
}
