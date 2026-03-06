"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { api, formatTZS } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  Package,
  Clock,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DashboardData {
  period: string;
  summary: {
    totalSales: number;
    totalProfit: number;
    salesCount: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  lowStockAlerts: Array<{ id: string; name: string; currentStock: number; minimumStock: number; unit: string }>;
  recentSales: Array<{ id: string; totalAmount: number; profit: number; paymentMethod: string; createdAt: string }>;
  dailyChart: Array<{ date: string; sales: number; profit: number }>;
  topProducts: Array<{ product: { name: string; unit: string }; totalQuantity: number; totalRevenue: number }>;
}

const PERIODS = [
  { key: "today", label: "Leo" },
  { key: "week", label: "Wiki" },
  { key: "month", label: "Mwezi" },
] as const;

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Taslimu",
  MPESA: "M-Pesa",
  TIGOPESA: "Tigo Pesa",
  AIRTEL_MONEY: "Airtel",
  HALOPESA: "HaloPesa",
  CREDIT: "Mkopo",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<DashboardData>(`/dashboard?period=${period}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      </AppShell>
    );
  }

  const s = data?.summary;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Muhtasari wa Biashara</h1>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-0 ${
                  period === p.key
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard
            label="Mauzo"
            value={formatTZS(s?.totalSales || 0)}
            icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
            color="blue"
          />
          <KpiCard
            label="Faida"
            value={formatTZS(s?.totalProfit || 0)}
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            color="green"
            sub={s && s.totalSales > 0 ? `${((s.totalProfit / s.totalSales) * 100).toFixed(0)}% margin` : undefined}
          />
          <KpiCard
            label="Idadi ya Mauzo"
            value={String(s?.salesCount || 0)}
            icon={<BarChart2 className="w-5 h-5 text-purple-600" />}
            color="purple"
          />
          <KpiCard
            label="Maagizo Yanayosubiri"
            value={String(s?.pendingOrders || 0)}
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            color="orange"
          />
        </div>

        {/* Low Stock Alert */}
        {data && data.lowStockAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-amber-800 text-sm">
                Bidhaa Zinazokwisha ({data.lowStockAlerts.length})
              </h2>
            </div>
            <div className="space-y-2">
              {data.lowStockAlerts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm text-amber-900 font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${p.currentStock === 0 ? "text-red-600" : "text-amber-700"}`}>
                      {p.currentStock === 0 ? "IMEKWISHA" : `${p.currentStock} ${p.unit} zilizobaki`}
                    </span>
                  </div>
                </div>
              ))}
              {data.lowStockAlerts.length > 5 && (
                <p className="text-amber-600 text-xs">+{data.lowStockAlerts.length - 5} zaidi...</p>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">Mauzo ya Wiki Iliyopita</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.dailyChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return d.toLocaleDateString("sw-TZ", { weekday: "short" });
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatTZS(value),
                    name === "sales" ? "Mauzo" : "Faida",
                  ]}
                />
                <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} name="sales" />
                <Bar dataKey="profit" fill="#86efac" radius={[4, 4, 0, 0]} name="profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">Bidhaa Zinazouzwa Zaidi</h2>
            {data?.topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Hakuna data bado</p>
            ) : (
              <div className="space-y-3">
                {data?.topProducts.map((tp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tp.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {tp.totalQuantity} {tp.product?.unit} ziliuzwa
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-brand-700">
                      {formatTZS(tp.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        {data && data.recentSales.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">Mauzo ya Hivi Karibuni</h2>
            <div className="divide-y divide-gray-100">
              {data.recentSales.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatTZS(s.totalAmount)}</p>
                    <p className="text-xs text-gray-500">
                      {PAYMENT_LABELS[s.paymentMethod] || s.paymentMethod} •{" "}
                      {new Date(s.createdAt).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-600">+{formatTZS(s.profit)}</p>
                    <p className="text-xs text-gray-400">faida</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  const bgMap: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-8 h-8 ${bgMap[color]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
