import { t, type Lang } from "@/lib/i18n";

const PROD_API_URL = "https://dukaos-production.up.railway.app/api";

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

export function getFriendlyErrorMessage(message: string, lang: Lang): string {
  const normalized = message.trim();

  if (normalized === "Invalid phone or PIN") {
    return t("auth.error.invalidCredentials", lang);
  }

  if (normalized === "Session expired") {
    return t("auth.error.sessionExpired", lang);
  }

  if (normalized.includes("Too many authentication attempts")) {
    return t("auth.error.rateLimited", lang);
  }

  if (normalized === "Unable to reach the DukaOS server. Confirm the API URL is correct and the backend is online.") {
    return t("auth.error.serverOffline", lang);
  }

  if (normalized === "The DukaOS server returned an unexpected response format.") {
    return t("auth.error.unexpectedResponse", lang);
  }

  return normalized;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  lang: Lang = "en"
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
    clearToken();
    window.location.href = "/";
    throw new Error("Session expired");
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const rawMessage =
      typeof payload === "string"
        ? payload || `Request failed with status ${res.status}`
        : payload?.error || `Request failed with status ${res.status}`;

    throw new Error(getFriendlyErrorMessage(rawMessage, lang));
  }

  if (!isJson) {
    throw new Error("The DukaOS server returned an unexpected response format.");
  }

  const data = payload;
  return data as T;
}

export const api = {
  get: <T>(path: string, lang?: Lang) => request<T>(path, {}, lang),
  post: <T>(path: string, body: unknown, lang?: Lang) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, lang),
  patch: <T>(path: string, body: unknown, lang?: Lang) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, lang),
  delete: <T>(path: string, lang?: Lang) => request<T>(path, { method: "DELETE" }, lang),
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
