"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

interface OverviewResponse {
  summary: {
    users: number;
    merchants: number;
    suppliers: number;
    admins: number;
    shops: number;
    products: number;
    sales: number;
    orders: number;
    auditLogs: number;
  };
}

interface AdminUser {
  id: string;
  phone: string;
  name: string;
  role: string;
  language: string;
  createdAt: string;
  shop?: { name: string };
  supplier?: { name: string };
}

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  method: string;
  path: string;
  createdAt: string;
  user?: { name: string; role: string } | null;
}

export default function AdminPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<OverviewResponse>("/admin/overview"),
      api.get<{ users: AdminUser[] }>("/admin/users"),
      api.get<{ logs: AuditLog[] }>("/admin/audit-logs?limit=20"),
    ]).then(([o, u, l]) => {
      setOverview(o);
      setUsers(u.users);
      setLogs(l.logs);
    });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">System-wide metrics, users, audit logs, and export tools.</p>
        </div>

        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(overview.summary).map(([key, value]) => (
              <div key={key} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">{key}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/exports/sales.csv`} className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
            Export Sales CSV
          </a>
          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/exports/inventory.csv`} className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Export Inventory CSV
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Users</h2>
            <div className="space-y-3">
              {users.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.phone} · {user.role}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Audit Logs</h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.method} {log.path} · {log.resourceType}</p>
                  <p className="text-xs text-gray-400">{log.user?.name || "Unknown user"} · {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
