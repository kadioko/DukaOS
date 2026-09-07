"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Smartphone } from "lucide-react";
import { api, formatTZS } from "@/lib/api";
import type { Lang } from "@/lib/i18n";

interface Checkout { id: string; status: string; amount: number; plan: string }
export default function NtzsCheckout({ plan, extraBranches = 0, kind = "RENEWAL", amount, lang, onConfirmed }: { plan: string; extraBranches?: number; kind?: string; amount?: number; lang: Lang; onConfirmed: () => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestKey = useRef<{ key: string; plan: string; phone: string; extraBranches: number; kind: string } | null>(null);
  const inFlight = useRef(false);
  const sw = lang === "sw";
  useEffect(() => {
    let active = true;
    api.get<{ enabled: boolean; prices: Record<string, number>; pending: Checkout | null }>("/subscription/checkout", lang).then((data) => {
      if (!active) return;
      setEnabled(data.enabled); setPrices(data.prices); setCheckout(data.pending);
    }).catch(() => { if (active) setEnabled(false); });
    return () => { active = false; };
  }, [lang]);
  useEffect(() => {
    // A retry key is deliberately tied to one exact commercial request.
    // Changing plan or branch capacity must start a distinct request.
    if (!checkout) requestKey.current = null;
  }, [plan, extraBranches, kind, checkout]);

  async function payOrCheck() {
    if (inFlight.current) return;
    if (!checkout && !requestKey.current && !/^(?:0[67]\d{8}|\+?255[67]\d{8})$/.test(phone.replace(/[\s()-]/g, ""))) {
      setError(sw ? "Weka namba sahihi ya simu ya Tanzania." : "Enter a valid Tanzanian mobile number.");
      return;
    }
    inFlight.current = true; setBusy(true); setError("");
    try {
      requestKey.current ||= { key: crypto.randomUUID(), plan, phone, extraBranches, kind };
      const result = checkout
        ? await api.post<Checkout>(`/subscription/checkout/${checkout.id}/check`, {}, lang)
        : await api.post<Checkout>("/subscription/checkout", { ...requestKey.current, requestKey: requestKey.current.key }, lang);
      setCheckout(result);
      if (result.status === "CONFIRMED") onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : (sw ? "Imeshindikana. Jaribu tena." : "Unable to check payment."));
    } finally { inFlight.current = false; setBusy(false); }
  }

  return <section className="border-b border-gray-200 py-4 space-y-3" aria-live="polite">
    <h2 className="font-semibold">nTZS online</h2>
    {enabled === null ? <p>{sw ? "Inapakia..." : "Loading..."}</p> : !enabled && !checkout ? <p className="text-sm text-gray-600">{sw ? "Malipo ya mtandaoni hayapatikani kwa sasa. Tumia Lipa namba au Tuma pesa." : "Online payments are unavailable right now. Use Lipa number or Send money."}</p> : <>
      <p className="text-sm font-semibold">{checkout?.plan || plan}: {formatTZS(checkout?.amount ?? amount ?? prices[plan] ?? 0)}</p>
      {!checkout && <>
        <p className="text-sm text-gray-600">{sw ? "Ombi la malipo litatumwa kwenye simu yako. Thibitisha kiasi kwenye simu. Usiweke PIN yako hapa." : "A payment prompt will be sent to your phone. Confirm the amount on your phone. Never enter your mobile-money PIN here."}</p>
        <label className="grid gap-1 text-sm font-medium max-w-sm">{sw ? "Namba ya simu ya kulipia" : "Payment phone number"}<input type="tel" autoComplete="tel" value={phone} onChange={(event) => { setPhone(event.target.value); }} placeholder="0712 345 678" className="rounded-lg border border-gray-300 px-3 py-3" disabled={busy || Boolean(requestKey.current)} /></label>
      </>}
      {checkout && <p className="text-sm">{checkout.status === "CONFIRMED" ? (sw ? "Malipo yamethibitishwa. Mpango wako umewashwa." : "Payment verified. Your subscription is active.") : checkout.status === "FAILED" ? (sw ? "Malipo hayakufanikiwa. Wasiliana nasi kabla ya kujaribu tena." : "Payment failed. Contact support before trying again.") : checkout.status === "REVIEW" ? (sw ? "Malipo yanahitaji uhakiki. Usilipe tena; wasiliana na msaada." : "Payment needs review. Do not pay again; contact support.") : (sw ? "Inasubiri uthibitisho. Baada ya kulipa, angalia hali ya malipo. Usitume malipo mengine." : "Awaiting confirmation. After paying, check payment status. Do not send another payment.")}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error} {sw ? "Usilipe tena ikiwa pesa zimekatwa." : "Do not pay again if money was deducted."}</p>}
      {(!checkout || !["CONFIRMED", "FAILED"].includes(checkout.status)) && <button type="button" onClick={payOrCheck} disabled={busy || (!checkout && !phone.trim())} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{checkout ? <RefreshCw className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}{busy ? (sw ? "Inachakata..." : "Processing...") : checkout ? (sw ? "Angalia malipo" : "Check payment") : (sw ? "Lipa sasa" : "Pay now")}</button>}
    </>}
  </section>;
}
