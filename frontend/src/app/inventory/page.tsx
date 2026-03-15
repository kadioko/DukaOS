"use client";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import { api, formatTZS } from "@/lib/api";
import {
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Package,
  X,
  ArrowUp,
  ArrowDown,
  CalendarClock,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  expiryDate?: string | null;
  doesNotExpire: boolean;
  supplier?: { id: string; name: string; phone: string };
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
}

// Returns { label, color } describing the expiry status
function expiryStatus(p: Product): { label: string; color: string } | null {
  if (p.doesNotExpire) return { label: "Haiishi muda", color: "bg-gray-100 text-gray-500" };
  if (!p.expiryDate) return null;
  const now = new Date();
  const exp = new Date(p.expiryDate);
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: "Imekwisha muda", color: "bg-red-100 text-red-700" };
  if (daysLeft <= 30) return { label: `Inaisha siku ${daysLeft}`, color: "bg-orange-100 text-orange-700" };
  return { label: exp.toLocaleDateString("sw-TZ", { day: "2-digit", month: "short", year: "numeric" }), color: "bg-green-100 text-green-700" };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", sku: "", unit: "pcs", buyingPrice: "", sellingPrice: "",
    currentStock: "0", minimumStock: "5", supplierId: "",
    expiryDate: "", doesNotExpire: false,
  });
  const [adjustForm, setAdjustForm] = useState({ type: "IN", quantity: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const data = await api.get<{ products: Product[] }>(`/products?${params}`);
    let list = data.products;
    if (lowStockOnly) list = list.filter((p) => p.currentStock <= p.minimumStock);
    setProducts(list);
    setLoading(false);
  }, [search, lowStockOnly]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    api.get<{ suppliers: Supplier[] }>("/suppliers").then((d) => setSuppliers(d.suppliers));
  }, []);

  function openAdd() {
    setEditProduct(null);
    setForm({ name: "", sku: "", unit: "pcs", buyingPrice: "", sellingPrice: "", currentStock: "0", minimumStock: "5", supplierId: "", expiryDate: "", doesNotExpire: false });
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name, sku: p.sku || "", unit: p.unit,
      buyingPrice: String(p.buyingPrice), sellingPrice: String(p.sellingPrice),
      currentStock: String(p.currentStock), minimumStock: String(p.minimumStock),
      supplierId: p.supplier?.id || "",
      expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : "",
      doesNotExpire: p.doesNotExpire,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name || !form.buyingPrice || !form.sellingPrice) {
      setError("Jaza sehemu zote zinazohitajika");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name, sku: form.sku || undefined, unit: form.unit,
        buyingPrice: Number(form.buyingPrice), sellingPrice: Number(form.sellingPrice),
        currentStock: Number(form.currentStock), minimumStock: Number(form.minimumStock),
        supplierId: form.supplierId || undefined,
        doesNotExpire: form.doesNotExpire,
        expiryDate: form.doesNotExpire ? null : (form.expiryDate || null),
      };
      if (editProduct) {
        await api.patch(`/products/${editProduct.id}`, body);
      } else {
        await api.post("/products", body);
      }
      setShowForm(false);
      fetchProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hitilafu");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdjust() {
    if (!adjustProduct || !adjustForm.quantity) return;
    setSaving(true);
    try {
      await api.post("/stock/adjust", {
        productId: adjustProduct.id,
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        note: adjustForm.note || undefined,
      });
      setAdjustProduct(null);
      fetchProducts();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Hitilafu");
    } finally {
      setSaving(false);
    }
  }

  const margin = (p: Product) =>
    p.sellingPrice > 0 ? (((p.sellingPrice - p.buyingPrice) / p.sellingPrice) * 100).toFixed(0) : "0";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">Hifadhi ya Bidhaa</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ongeza Bidhaa</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tafuta bidhaa..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              lowStockOnly
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-gray-300 text-gray-600"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zinazokwisha</span>
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Bidhaa Zote", value: products.length },
            { label: "Zinazokwisha", value: products.filter((p) => p.currentStock <= p.minimumStock && p.currentStock > 0).length, color: "text-amber-600" },
            { label: "Zimekwisha", value: products.filter((p) => p.currentStock === 0).length, color: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className={`text-lg font-bold ${stat.color || "text-gray-900"}`}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Product list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Inapakia...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Hakuna bidhaa</p>
            <p className="text-gray-400 text-sm mt-1">Bonyeza &quot;Ongeza Bidhaa&quot; kuanza</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((p) => {
              const isLow = p.currentStock <= p.minimumStock && p.currentStock > 0;
              const isOut = p.currentStock === 0;
              const expiry = expiryStatus(p);
              const isExpired = expiry?.label === "Imekwisha muda";
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl border p-4 ${
                    isExpired ? "border-red-300" :
                    isOut ? "border-red-200" :
                    isLow ? "border-amber-200" :
                    "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                        {isOut && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            Imekwisha
                          </span>
                        )}
                        {isLow && !isOut && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Inakwisha
                          </span>
                        )}
                        {expiry && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${expiry.color}`}>
                            <CalendarClock className="w-3 h-3" />
                            {expiry.label}
                          </span>
                        )}
                      </div>
                      {p.supplier && (
                        <p className="text-xs text-gray-400 mt-0.5">{p.supplier.name}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div>
                          <p className="text-xs text-gray-400">Hifadhi</p>
                          <p className={`text-sm font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-800"}`}>
                            {p.currentStock} {p.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Bei ya Kununua</p>
                          <p className="text-sm font-medium text-gray-700">{formatTZS(p.buyingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Bei ya Kuuza</p>
                          <p className="text-sm font-medium text-brand-700">{formatTZS(p.sellingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Faida</p>
                          <p className="text-sm font-medium text-green-600">{margin(p)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setAdjustProduct(p);
                          setAdjustForm({ type: "IN", quantity: "", note: "" });
                        }}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors min-h-0"
                        title="Badilisha Hifadhi"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <Modal title={editProduct ? "Hariri Bidhaa" : "Ongeza Bidhaa Mpya"} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-2">{error}</p>}
            <Field label="Jina la Bidhaa *">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={INPUT} placeholder="Unga wa Sembe (2kg)" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU / Nambari">
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className={INPUT} placeholder="UNG001" />
              </Field>
              <Field label="Kipimo">
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={INPUT}>
                  {["pcs", "kg", "litre", "box", "crate", "bag", "pkt", "bar"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bei ya Kununua (TZS) *">
                <input type="number" value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })}
                  className={INPUT} placeholder="2800" />
              </Field>
              <Field label="Bei ya Kuuza (TZS) *">
                <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  className={INPUT} placeholder="3200" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hifadhi ya Sasa">
                <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                  className={INPUT} placeholder="0" />
              </Field>
              <Field label="Kiwango cha Chini">
                <input type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
                  className={INPUT} placeholder="5" />
              </Field>
            </div>
            <Field label="Msambazaji">
              <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className={INPUT}>
                <option value="">-- Chagua msambazaji --</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>

            {/* Expiry section */}
            <div className="border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Tarehe ya Kuisha Muda
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.doesNotExpire}
                  onChange={(e) => setForm({ ...form, doesNotExpire: e.target.checked, expiryDate: "" })}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600"
                />
                <span className="text-sm text-gray-700">Bidhaa hii haiishi muda</span>
              </label>
              {!form.doesNotExpire && (
                <Field label="Tarehe ya Kuisha Muda">
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className={INPUT}
                  />
                </Field>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium">
                Futa
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60">
                {saving ? "Inahifadhi..." : "Hifadhi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <Modal title={`Badilisha Hifadhi: ${adjustProduct.name}`} onClose={() => setAdjustProduct(null)}>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Hifadhi ya sasa: <strong>{adjustProduct.currentStock} {adjustProduct.unit}</strong>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "IN", label: "Ongeza", icon: <ArrowUp className="w-4 h-4" />, color: "green" },
                { v: "OUT", label: "Punguza", icon: <ArrowDown className="w-4 h-4" />, color: "red" },
                { v: "ADJUSTMENT", label: "Rekebisha", icon: <Edit2 className="w-4 h-4" />, color: "blue" },
              ].map(({ v, label, icon, color }) => (
                <button
                  key={v}
                  onClick={() => setAdjustForm({ ...adjustForm, type: v })}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors min-h-0 ${
                    adjustForm.type === v
                      ? `bg-${color}-50 border-${color}-300 text-${color}-700`
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
            <Field label={adjustForm.type === "ADJUSTMENT" ? "Idadi Mpya" : "Idadi"}>
              <input type="number" value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                className={INPUT} placeholder="0" min="0" />
            </Field>
            <Field label="Maelezo (hiari)">
              <input value={adjustForm.note}
                onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                className={INPUT} placeholder="Sababu ya mabadiliko..." />
            </Field>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAdjustProduct(null)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium">Futa</button>
              <button onClick={handleAdjust} disabled={saving || !adjustForm.quantity}
                className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60">
                {saving ? "..." : "Hifadhi"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 min-h-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
