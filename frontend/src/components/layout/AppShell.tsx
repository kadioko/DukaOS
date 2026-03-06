"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Truck,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { clearToken, api } from "@/lib/api";
import clsx from "clsx";

interface User {
  name: string;
  role: string;
  shop?: { name: string };
  supplier?: { name: string };
}

const merchantNav = [
  { href: "/dashboard", label: "Dashibodi", icon: LayoutDashboard },
  { href: "/inventory", label: "Bidhaa", icon: Package },
  { href: "/sales", label: "Mauzo", icon: ShoppingCart },
  { href: "/orders", label: "Maagizo", icon: ClipboardList },
  { href: "/suppliers", label: "Wasambazaji", icon: Truck },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    api.get<{ user: User }>("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => router.push("/"));
  }, [router]);

  useEffect(() => {
    if (user?.role === "MERCHANT") {
      api.get<{ products: unknown[] }>("/products/low-stock")
        .then((d) => setLowStockCount(d.products.length))
        .catch(() => {});
    }
  }, [user]);

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const nav = merchantNav;
  const displayName = user?.shop?.name || user?.supplier?.name || user?.name || "DukaOS";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-brand-800 text-white flex flex-col z-30 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-brand-700">
          <div className="bg-white/10 rounded-xl p-2">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{displayName}</p>
            <p className="text-brand-300 text-xs">DukaOS</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-brand-300 hover:text-white min-h-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/15 text-white"
                  : "text-brand-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {href === "/inventory" && lowStockCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {lowStockCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-brand-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-brand-300 text-xs">{user?.role === "MERCHANT" ? "Mfanyabiashara" : "Msambazaji"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-brand-200 hover:bg-white/10 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Toka
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 min-h-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-gray-800 text-sm truncate">{displayName}</span>
          </div>
          {lowStockCount > 0 && (
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {lowStockCount}
              </span>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      {/* Bottom nav for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {nav.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
              pathname === href ? "text-brand-600" : "text-gray-500"
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {href === "/inventory" && lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px]">
                  {lowStockCount}
                </span>
              )}
            </div>
            <span className="hidden xs:block">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
