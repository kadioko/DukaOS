/**
 * DukaOS Translations
 * sw = Kiswahili (default)
 * en = English
 */

import { useSyncExternalStore } from "react";

export type Lang = "sw" | "en";

const STORAGE_KEY = "dukaos_language";
const listeners = new Set<() => void>();

const translations: Record<string, Record<Lang, string>> = {
  "nav.dashboard": { sw: "Dashibodi", en: "Dashboard" },
  "nav.inventory": { sw: "Hifadhi ya Bidhaa", en: "Inventory" },
  "nav.sales": { sw: "Mauzo", en: "Sales" },
  "nav.orders": { sw: "Maagizo", en: "Orders" },
  "nav.suppliers": { sw: "Wasambazaji", en: "Suppliers" },
  "nav.settings": { sw: "Mipangilio", en: "Settings" },
  "app.language": { sw: "Lugha", en: "Language" },
  "app.swahili": { sw: "Kiswahili", en: "Swahili" },
  "app.english": { sw: "Kiingereza", en: "English" },
  "app.logout": { sw: "Toka", en: "Log out" },
  "app.merchant": { sw: "Mfanyabiashara", en: "Merchant" },
  "app.supplier": { sw: "Msambazaji", en: "Supplier" },

  "dashboard.title": { sw: "Muhtasari wa Biashara", en: "Business Overview" },
  "dashboard.sales": { sw: "Mauzo", en: "Sales" },
  "dashboard.profit": { sw: "Faida", en: "Profit" },
  "dashboard.salesCount": { sw: "Idadi ya Mauzo", en: "Sales Count" },
  "dashboard.pendingOrders": { sw: "Maagizo Yanayosubiri", en: "Pending Orders" },
  "dashboard.lowStock": { sw: "Bidhaa Zinazokwisha", en: "Low Stock Items" },
  "dashboard.outOfStock": { sw: "Bidhaa Zilizokwisha", en: "Out of Stock" },
  "dashboard.weeklyChart": { sw: "Mauzo ya Wiki Iliyopita", en: "Last 7 Days Sales" },
  "dashboard.topProducts": { sw: "Bidhaa Zinazouzwa Zaidi", en: "Top Selling Products" },
  "dashboard.recentSales": { sw: "Mauzo ya Hivi Karibuni", en: "Recent Sales" },
  "dashboard.allTime": { sw: "Muda Wote", en: "All Time" },
  "dashboard.allTimePerformance": { sw: "Utendaji wa Muda Wote", en: "All-Time Performance" },
  "dashboard.businessHistory": { sw: "Historia ya Biashara", en: "Business History" },
  "dashboard.paymentMix": { sw: "Mchanganyiko wa Malipo", en: "Payment Mix" },
  "dashboard.margin": { sw: "faida halisi", en: "margin" },
  "dashboard.noData": { sw: "Hakuna data bado", en: "No data yet" },
  "dashboard.remaining": { sw: "zilizobaki", en: "remaining" },
  "dashboard.more": { sw: "zaidi", en: "more" },
  "dashboard.started": { sw: "Imeanza", en: "Started" },
  "dashboard.transactions": { sw: "miamala", en: "transactions" },

  "inventory.title": { sw: "Hifadhi ya Bidhaa", en: "Inventory" },
  "inventory.addProduct": { sw: "Ongeza Bidhaa", en: "Add Product" },
  "inventory.search": { sw: "Tafuta bidhaa...", en: "Search products..." },
  "inventory.lowStockOnly": { sw: "Zinazokwisha tu", en: "Low stock only" },
  "inventory.product": { sw: "Bidhaa", en: "Product" },
  "inventory.stock": { sw: "Hifadhi", en: "Stock" },
  "inventory.buyingPrice": { sw: "Bei ya Kununua", en: "Buying Price" },
  "inventory.sellingPrice": { sw: "Bei ya Kuuza", en: "Selling Price" },
  "inventory.supplier": { sw: "Msambazaji", en: "Supplier" },
  "inventory.actions": { sw: "Vitendo", en: "Actions" },
  "inventory.adjustStock": { sw: "Badilisha Hifadhi", en: "Adjust Stock" },
  "inventory.reorder": { sw: "Agiza Tena", en: "Reorder" },
  "inventory.lowStockBadge": { sw: "Inakwisha", en: "Low Stock" },
  "inventory.outOfStockBadge": { sw: "Imekwisha", en: "Out of Stock" },

  "sales.title": { sw: "Rekodi ya Mauzo", en: "Record Sale" },
  "sales.history": { sw: "Historia ya Mauzo", en: "Sales History" },
  "sales.addItem": { sw: "Ongeza Bidhaa", en: "Add Item" },
  "sales.total": { sw: "Jumla", en: "Total" },
  "sales.payment": { sw: "Malipo", en: "Payment" },
  "sales.complete": { sw: "Kamilisha Mauzo", en: "Complete Sale" },
  "sales.cash": { sw: "Pesa Taslimu", en: "Cash" },
  "sales.mpesa": { sw: "M-Pesa", en: "M-Pesa" },
  "sales.tigopesa": { sw: "Tigo Pesa", en: "Tigo Pesa" },
  "sales.airtel": { sw: "Airtel Money", en: "Airtel Money" },
  "sales.halopesa": { sw: "HaloPesa", en: "HaloPesa" },
  "sales.bank": { sw: "Benki", en: "Bank" },
  "sales.credit": { sw: "Mkopo", en: "Credit" },
  "sales.profit": { sw: "Faida", en: "Profit" },
  "sales.pos": { sw: "POS", en: "POS" },
  "sales.cart": { sw: "Kapu", en: "Cart" },
  "sales.chooseProduct": { sw: "Chagua bidhaa kuanza", en: "Choose products to begin" },
  "sales.paymentReference": { sw: "Nambari ya muamala (hiari)", en: "Transaction reference (optional)" },
  "sales.saving": { sw: "Inahifadhi...", en: "Saving..." },
  "sales.completed": { sw: "Mauzo yamehifadhiwa!", en: "Sale saved successfully!" },
  "sales.noSales": { sw: "Hakuna mauzo bado", en: "No sales yet" },

  "orders.title": { sw: "Maagizo ya Bidhaa", en: "Supplier Orders" },
  "orders.newOrder": { sw: "Agizo Jipya", en: "New Order" },
  "orders.sendWhatsApp": { sw: "Tuma WhatsApp", en: "Send via WhatsApp" },
  "orders.reorder": { sw: "Agiza Tena", en: "Reorder" },
  "orders.confirmDelivery": { sw: "Thibitisha Kupokea", en: "Confirm Delivery" },
  "orders.status.PENDING": { sw: "Inasubiri", en: "Pending" },
  "orders.status.CONFIRMED": { sw: "Imethibitishwa", en: "Confirmed" },
  "orders.status.OUT_FOR_DELIVERY": { sw: "Inakuja", en: "Out for Delivery" },
  "orders.status.DELIVERED": { sw: "Imepokelewa", en: "Delivered" },
  "orders.status.CANCELLED": { sw: "Imefutwa", en: "Cancelled" },

  "auth.welcome": { sw: "Karibu!", en: "Welcome back!" },
  "auth.register": { sw: "Jisajili", en: "Register" },
  "auth.login": { sw: "Ingia", en: "Sign in" },
  "auth.createAccount": { sw: "Tengeneza akaunti yako", en: "Create your account" },
  "auth.enterShop": { sw: "Ingia kwenye duka lako", en: "Sign in to your business" },
  "auth.yourName": { sw: "Jina lako", en: "Your name" },
  "auth.iAm": { sw: "Mimi ni", en: "I am a" },
  "auth.shopName": { sw: "Jina la Duka", en: "Shop name" },
  "auth.phone": { sw: "Nambari ya Simu", en: "Phone number" },
  "auth.pin": { sw: "PIN (nambari 4+)", en: "PIN (4+ digits)" },
  "auth.noAccount": { sw: "Huna akaunti? → Jisajili", en: "No account? → Register" },
  "auth.haveAccount": { sw: "Nina akaunti → Ingia", en: "Already have an account? → Sign in" },
  "auth.loading": { sw: "Inaendelea...", en: "Please wait..." },
  "auth.error": { sw: "Hitilafu. Jaribu tena.", en: "Something went wrong. Please try again." },

  "common.save": { sw: "Hifadhi", en: "Save" },
  "common.cancel": { sw: "Futa", en: "Cancel" },
  "common.edit": { sw: "Hariri", en: "Edit" },
  "common.delete": { sw: "Futa", en: "Delete" },
  "common.loading": { sw: "Inapakia...", en: "Loading..." },
  "common.error": { sw: "Hitilafu", en: "Error" },
  "common.success": { sw: "Imefanikiwa", en: "Success" },
  "common.confirm": { sw: "Thibitisha", en: "Confirm" },
  "common.today": { sw: "Leo", en: "Today" },
  "common.week": { sw: "Wiki", en: "Week" },
  "common.month": { sw: "Mwezi", en: "Month" },
  "common.all": { sw: "Muda Wote", en: "All Time" },
};

let currentLang: Lang = "sw";

export function setLanguage(lang: Lang) {
  currentLang = lang;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
  listeners.forEach((listener) => listener());
}

export function getLanguage(): Lang {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "sw" || stored === "en") {
      currentLang = stored;
    }
  }
  return currentLang;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function t(key: string, lang?: Lang): string {
  const l = lang || getLanguage();
  return translations[key]?.[l] ?? key;
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLanguage, () => currentLang);
}

export { currentLang };
