"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, ArrowRightLeft, Plus, RotateCcw } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import BranchTransferForm from "@/components/BranchTransferForm";
import { api, formatTZS, switchBranch } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface Branch { id: string; name: string; location: string; branchArchived: boolean }
interface Listing { branches: Branch[]; mainId: string; selectedId: string; pro: boolean; limit: number; monthlyAmount: number }
interface Metric extends Branch { sales: number; grossProfit: number; expenses: number; receivables: number }

export default function BranchesPage() {
  const lang = useLang(), sw = lang === "sw";
  const [data, setData] = useState<Listing | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  async function load() {
    const result = await api.get<Listing>("/branches", lang);
    setData(result);
    if (result.pro) setMetrics((await api.get<{ branches: Metric[] }>("/branches/overview", lang)).branches);
  }
  useEffect(() => { load().catch((e) => setError(e.message)); }, [lang]);
  async function save(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try { await action(); await load(); setMessage(sw ? "Imehifadhiwa." : "Saved."); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save"); }
    finally { setBusy(false); }
  }
  const filtered = data?.branches.filter((b) => `${b.name} ${b.location}`.toLowerCase().includes(search.toLowerCase())) || [];
  const pages = Math.max(1, Math.ceil(filtered.length / 10)), currentPage = Math.min(page, pages);
  return <AppShell><main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
    <header className="border-b pb-4"><h1 className="text-2xl font-bold">{sw ? "Matawi" : "Branches"}</h1>
      <p className="mt-2 text-sm text-gray-600">{sw ? "Pro inajumuisha maeneo 4, pamoja na duka kuu. Kila eneo la ziada ni TZS 10,000 kwa mwezi." : "Pro includes 4 locations, including your main shop. Each extra location is TZS 10,000 per month."}</p>
      <Link href="/billing" className="mt-2 inline-block font-medium text-brand-700">{sw ? "Usajili na malipo" : "Subscription and payments"}</Link>
    </header>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {message && <p role="status" className="text-green-700">{message}</p>}
    {!data && !error && <p>{sw ? "Inapakia..." : "Loading..."}</p>}
    {data && <>
      <p className="text-sm">{sw ? "Maeneo yanayotumika" : "Active locations"}: {data.branches.filter((b) => !b.branchArchived).length} / {data.limit}</p>
      {data.pro && <form className="grid items-end gap-3 border-b pb-5 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); void save(async () => { await api.post("/branches", { name, location }, lang); setName(""); setLocation(""); }); }}>
        <label className="grid gap-1 text-sm">{sw ? "Jina la tawi" : "Branch name"}<input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 rounded-lg border p-3" /></label>
        <label className="grid gap-1 text-sm">{sw ? "Eneo" : "Location"}<input required maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} className="min-w-0 rounded-lg border p-3" /></label>
        <button disabled={busy} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-white disabled:opacity-50"><Plus size={18} />{sw ? "Ongeza tawi" : "Add branch"}</button>
      </form>}
      <label className="grid max-w-md gap-1 text-sm">{sw ? "Tafuta tawi" : "Search branches"}<input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-lg border p-3" /></label>
      <ul className="divide-y">{filtered.slice((currentPage - 1) * 10, currentPage * 10).map((b) => <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0 break-words"><h2 className="font-semibold">{b.name}</h2><p className="text-sm text-gray-600">{b.location} {b.id === data.mainId ? (sw ? "(Duka kuu)" : "(Main shop)") : ""}</p>{b.branchArchived && <p className="text-sm">{sw ? "Limehifadhiwa" : "Archived"}</p>}</div>
        <div className="flex flex-wrap gap-2">{!b.branchArchived && <button disabled={b.id === data.selectedId || busy} onClick={() => { try { switchBranch(b.id); } catch (e) { setError((e as Error).message); } }} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 disabled:opacity-50"><ArrowRightLeft size={16} />{b.id === data.selectedId ? (sw ? "Tawi la sasa" : "Current location") : (sw ? "Fungua" : "Open")}</button>}
        {b.id !== data.mainId && <button disabled={busy || b.id === data.selectedId} onClick={() => { if (window.confirm(sw ? "Badilisha hali ya tawi hili? Rekodi zitahifadhiwa." : "Change this branch's status? Records will be retained.")) void save(() => api.patch(`/branches/${b.id}`, { branchArchived: !b.branchArchived }, lang)); }} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 disabled:opacity-50">{b.branchArchived ? <RotateCcw size={16} /> : <Archive size={16} />}{b.branchArchived ? (sw ? "Rejesha" : "Restore") : (sw ? "Hifadhi" : "Archive")}</button>}</div>
      </li>)}</ul>
      <nav className="flex items-center justify-between gap-3"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="min-h-11 rounded-lg border px-3 disabled:opacity-40">{sw ? "Nyuma" : "Previous"}</button><span>{currentPage} / {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} className="min-h-11 rounded-lg border px-3 disabled:opacity-40">{sw ? "Mbele" : "Next"}</button></nav>
      {metrics.length > 0 && <section className="border-t pt-5"><h2 className="text-lg font-semibold">{sw ? "Mwezi huu: matawi yote" : "This month: all branches"}</h2><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{(sw ? ["Tawi", "Mauzo", "Faida ghafi", "Matumizi", "Madeni ya sasa"] : ["Branch", "Sales", "Gross profit", "Expenses", "Current receivables"]).map((s) => <th key={s} className="whitespace-nowrap p-3">{s}</th>)}</tr></thead><tbody>{metrics.slice((currentPage - 1) * 10, currentPage * 10).map((b) => <tr key={b.id} className="border-t"><td className="p-3">{b.name}</td>{[b.sales, b.grossProfit, b.expenses, b.receivables].map((v, i) => <td key={i} className="whitespace-nowrap p-3">{formatTZS(v)}</td>)}</tr>)}</tbody></table></div></section>}
      {data.pro && <BranchTransferForm branches={data.branches.filter((b) => !b.branchArchived)} lang={lang} />}
    </>}
  </main></AppShell>;
}
