"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Lang } from "@/lib/i18n";
interface Product { id: string; name: string; unit: string; currentStock: number }
export default function BranchTransferForm({ branches, lang }: { branches: { id: string; name: string }[]; lang: Lang }) {
  const sw = lang === "sw";
  const [source, setSource] = useState(""); const [target, setTarget] = useState("");
  const [sourceQuery, setSourceQuery] = useState(""); const [targetQuery, setTargetQuery] = useState("");
  const [sourceProductId, setSourceProductId] = useState(""); const [targetProductId, setTargetProductId] = useState("");
  const [sourceItems, setSourceItems] = useState<Product[]>([]); const [targetItems, setTargetItems] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const pending = useRef<{ requestKey: string; sourceProductId: string; targetProductId: string; quantity: number } | null>(null);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { if (source) api.get<{ products: Product[] }>(`/branches/products?shopId=${encodeURIComponent(source)}&q=${encodeURIComponent(sourceQuery)}`, lang).then((d) => { if (active) setSourceItems(d.products); }).catch((e) => { if (active) setMessage(e.message); }); }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [source, sourceQuery, lang]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { if (target) api.get<{ products: Product[] }>(`/branches/products?shopId=${encodeURIComponent(target)}&q=${encodeURIComponent(targetQuery)}`, lang).then((d) => { if (active) setTargetItems(d.products); }).catch((e) => { if (active) setMessage(e.message); }); }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [target, targetQuery, lang]);
  async function submit() {
    if (busy) return;
    setBusy(true); setMessage("");
    pending.current ||= { requestKey: crypto.randomUUID(), sourceProductId, targetProductId, quantity };
    try {
      await api.post("/branches/transfers", pending.current, lang);
      pending.current = null; setSourceProductId(""); setTargetProductId("");
      setMessage(sw ? "Bidhaa zimehamishwa. Historia ya bidhaa imehifadhiwa." : "Stock transferred. Both stock histories have been recorded.");
    } catch (e) {
      if (e instanceof ApiError && e.status && e.status >= 400 && e.status < 500) pending.current = null;
      // Keep the exact request after an uncertain response, so retry cannot move stock twice.
      setMessage((e as Error).message);
    } finally { setBusy(false); }
  }
  return <section className="border-t pt-5"><h2 className="text-lg font-semibold">{sw ? "Hamisha bidhaa kati ya matawi" : "Transfer stock between branches"}</h2>
    <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <fieldset disabled={busy || Boolean(pending.current)} className="grid gap-4 sm:grid-cols-2">
        {[{ id: source, set: setSource, q: sourceQuery, setQ: setSourceQuery, product: sourceProductId, setProduct: setSourceProductId, items: sourceItems, label: sw ? "Kutoka" : "From" }, { id: target, set: setTarget, q: targetQuery, setQ: setTargetQuery, product: targetProductId, setProduct: setTargetProductId, items: targetItems, label: sw ? "Kwenda" : "To" }].map((side) => <div className="grid min-w-0 gap-2" key={side.label}>
          <label className="grid gap-1 text-sm">{side.label}<select required value={side.id} onChange={(e) => { side.set(e.target.value); side.setProduct(""); }} className="w-full min-w-0 rounded-lg border p-3"><option value="">{sw ? "Chagua tawi" : "Select branch"}</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm">{sw ? "Tafuta bidhaa" : "Search products"}<input type="search" value={side.q} onChange={(e) => { side.setQ(e.target.value); side.setProduct(""); }} className="min-w-0 rounded-lg border p-3" /></label>
          <label className="grid gap-1 text-sm">{sw ? "Bidhaa" : "Product"}<select required value={side.product} onChange={(e) => side.setProduct(e.target.value)} className="min-w-0 rounded-lg border p-3"><option value="">{sw ? "Chagua bidhaa" : "Select product"}</option>{side.items.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.currentStock} {p.unit})</option>)}</select></label>
        </div>)}
        <label className="grid gap-1 text-sm">{sw ? "Idadi" : "Quantity"}<input required type="number" min={1} step={1} max={100000000} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-lg border p-3" /></label>
      </fieldset>
      <button disabled={busy || !sourceProductId || !targetProductId || source === target} className="flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 text-white disabled:opacity-50"><ArrowRightLeft size={18} />{busy ? (sw ? "Inachakata..." : "Processing...") : pending.current ? (sw ? "Jaribu ombi lilelile" : "Retry same request") : (sw ? "Hamisha" : "Transfer")}</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  </section>;
}
