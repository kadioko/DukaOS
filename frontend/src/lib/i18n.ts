/**
 * DukaOS Translations
 * sw = Kiswahili (default)
 * en = English
 */

type Lang = "sw" | "en";

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.dashboard": { sw: "Dashibodi", en: "Dashboard" },
  "nav.inventory": { sw: "Hifadhi ya Bidhaa", en: "Inventory" },
  "nav.sales": { sw: "Mauzo", en: "Sales" },
  "nav.orders": { sw: "Maagizo", en: "Orders" },
  "nav.suppliers": { sw: "Wasambazaji", en: "Suppliers" },
  "nav.settings": { sw: "Mipangilio", en: "Settings" },

  // Dashboard
  "dashboard.title": { sw: "Muhtasari wa Biashara", en: "Business Overview" },
  "dashboard.todaySales": { sw: "Mauzo ya Leo", en: "Today's Sales" },
  "dashboard.todayProfit": { sw: "Faida ya Leo", en: "Today's Profit" },
  "dashboard.salesCount": { sw: "Idadi ya Mauzo", en: "Sales Count" },
  "dashboard.pendingOrders": { sw: "Maagizo Yanayosubiri", en: "Pending Orders" },
  "dashboard.lowStock": { sw: "Bidhaa Zinazokwisha", en: "Low Stock Items" },
  "dashboard.outOfStock": { sw: "Bidhaa Zilizokwisha", en: "Out of Stock" },
  "dashboard.weeklyChart": { sw: "Mauzo ya Wiki Iliyopita", en: "Last 7 Days Sales" },
  "dashboard.topProducts": { sw: "Bidhaa Zinazouzwa Zaidi", en: "Top Selling Products" },
  "dashboard.recentSales": { sw: "Mauzo ya Hivi Karibuni", en: "Recent Sales" },

  // Inventory
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

  // Sales
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
  "sales.credit": { sw: "Mkopo", en: "Credit" },
  "sales.profit": { sw: "Faida", en: "Profit" },

  // Orders
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

  // Common
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
};

let currentLang: Lang = "sw";

export function setLanguage(lang: Lang) {
  currentLang = lang;
}

export function t(key: string, lang?: Lang): string {
  const l = lang || currentLang;
  return translations[key]?.[l] ?? key;
}

export function useLang(): Lang {
  return currentLang;
}

export { currentLang };
