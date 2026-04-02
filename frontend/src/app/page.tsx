"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getFriendlyErrorMessage, setToken } from "@/lib/api";
import { ShoppingBag, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { t, useLang, setLanguage as setAppLanguage } from "@/lib/i18n";

function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, "").trim();
}

function isValidPhone(value: string): boolean {
  return /^\+?[1-9]\d{8,14}$/.test(normalizePhone(value));
}

function isValidPin(value: string): boolean {
  return /^\d{4,8}$/.test(value.trim());
}

export default function LoginPage() {
  const router = useRouter();
  const lang = useLang();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [role, setRole] = useState<"MERCHANT" | "SUPPLIER">("MERCHANT");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalizedPhone = normalizePhone(phone);
    const normalizedPin = pin.trim();
    const normalizedName = name.trim();
    const normalizedShopName = shopName.trim();

    if (!isValidPhone(normalizedPhone)) {
      setError(t("auth.error.invalidPhone", lang));
      return;
    }

    if (!isValidPin(normalizedPin)) {
      setError(t("auth.error.invalidPin", lang));
      return;
    }

    if (isRegister && !normalizedName) {
      setError(t("auth.error.nameRequired", lang));
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister
        ? { phone: normalizedPhone, pin: normalizedPin, name: normalizedName, role, shopName: normalizedShopName }
        : { phone: normalizedPhone, pin: normalizedPin };

      const data = await api.post<{ token: string; user: { role: string } }>(endpoint, body, lang);
      setToken(data.token);

      if (data.user.role === "SUPPLIER") {
        router.push("/supplier");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? getFriendlyErrorMessage(err.message, lang) : t("auth.error", lang));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 border border-white/10 shadow-lg">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-center text-brand-100 px-3 pt-1 pb-2">
              {t("app.language", lang)}
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setAppLanguage("sw")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${lang === "sw" ? "bg-white text-brand-700 shadow-sm" : "text-white hover:bg-white/10"}`}
              >
                {t("app.swahili", lang)}
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage("en")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${lang === "en" ? "bg-white text-brand-700 shadow-sm" : "text-white hover:bg-white/10"}`}
              >
                {t("app.english", lang)}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <ShoppingBag className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">DukaOS</h1>
          <p className="text-brand-200 mt-1 text-sm">Merchant OS • Tanzania</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {isRegister ? t("auth.register", lang) : t("auth.welcome", lang)}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isRegister ? t("auth.createAccount", lang) : t("auth.enterShop", lang)}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.yourName", lang)}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mama Amina"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.iAm", lang)}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("MERCHANT")}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        role === "MERCHANT"
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      {t("app.merchant", lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("SUPPLIER")}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        role === "SUPPLIER"
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      {t("app.supplier", lang)}
                    </button>
                  </div>
                </div>
                {role === "MERCHANT" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.shopName", lang)}</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Duka la Amina"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.phone", lang)}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  autoComplete="tel"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.pin", lang)}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={8}
                  inputMode="numeric"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 min-h-0"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? t("auth.loading", lang) : isRegister ? t("auth.register", lang) : t("auth.login", lang)}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-brand-600 text-sm hover:underline min-h-0"
            >
              {isRegister ? t("auth.haveAccount", lang) : t("auth.noAccount", lang)}
            </button>
          </div>
        </div>

        <p className="text-center text-brand-200 text-xs mt-6">
          DukaOS — Kujenga biashara Tanzania
        </p>
      </div>
    </div>
  );
}
