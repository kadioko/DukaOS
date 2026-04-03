# DukaOS — Merchant OS for Tanzania 🛒

> **Merchant operating system for informal retailers in Tanzania.**
> Track stock, record sales, order from suppliers, and grow your business — all in Kiswahili, from your phone.

---

## Why DukaOS

Tanzania has over **1 million informal operators** in Dar es Salaam alone, with wholesale/retail as the single largest segment. These merchants lose money every day from:

- Stockouts they never saw coming
- Cash they cannot reconcile
- Suppliers they can only reach by walking to the market
- Records kept in notebooks that get lost

Mobile money adoption is strong and growing. The infrastructure exists. What is missing is a tool built for how these merchants actually work — in Kiswahili, on a basic smartphone, with no training required.

DukaOS starts as **software + payments + procurement**, then layers working-capital financing later once trust and compliance are established.

---

## Live Production

- **Frontend:** [https://duka-os.vercel.app/](https://duka-os.vercel.app/)
- **Backend API:** [https://dukaos-production.up.railway.app/api](https://dukaos-production.up.railway.app/api)
- **Health Check:** [https://dukaos-production.up.railway.app/health](https://dukaos-production.up.railway.app/health)

---

## What DukaOS Does

### For Merchants (Wafanyabiashara)

| Feature | Description |
| --- | --- |
| **Inventory tracking** | Add products, set buying/selling prices, track stock levels |
| **Low-stock alerts** | Instant badge + dashboard alert when any product hits minimum stock |
| **POS / Sales entry** | Record sales by product, quantity, and payment method |
| **Profit snapshot** | Real-time profit margin per sale and daily/weekly/monthly/all-time totals |
| **Business history** | Review all-time business history and monthly performance trends from the dashboard |
| **Supplier ordering** | Create orders from suppliers in one tap |
| **WhatsApp export** | Every order generates a ready-to-send WhatsApp message in Kiswahili |
| **One-tap reorder** | Repeat any previous order with a single button |
| **Delivery confirmation** | Confirm goods received and auto-restock inventory (merchant only) |
| **Payment reconciliation** | Bank, M-Pesa, Tigo Pesa, Airtel Money, HaloPesa, Cash, Credit |
| **Language switching** | Full Kiswahili interface with an in-app English/Swahili toggle |

### For Suppliers (Wasambazaji)

| Feature | Description |
| --- | --- |
| **Order dashboard** | See all incoming orders from merchants |
| **Status management** | Confirm → Dispatch (supplier advances to OUT_FOR_DELIVERY only) |
| **Route view** | Group pending orders by location |
| **Performance data** | Which merchants order most frequently |

### Current End-User Experience

- **Login and registration** — users sign in with phone number and PIN, and can switch the interface between Swahili and English from the auth screen or inside the app.
- **Merchant dashboard** — merchants can review sales, profit, pending orders, low-stock alerts, payment mix, and all-time business history.
- **Sales / POS** — merchants can record sales with cash, bank, credit, or supported mobile money methods.
- **Supplier ordering** — merchants can create, repeat, and confirm supplier orders, then send the order details through WhatsApp.
- **Supplier portal** — suppliers can review incoming orders and advance status (PENDING → CONFIRMED → OUT_FOR_DELIVERY). The merchant confirms delivery, which triggers automatic stock replenishment.

---

## Revenue Model

| Stream | Target |
| --- | --- |
| Merchant subscriptions | ~300 merchants × TZS 25,000/month = **TZS 7.5M MRR** |
| Supplier subscriptions | ~20 suppliers × TZS 375,000/month = **TZS 7.5M MRR** |
| Transaction/procurement fees | % of GMV flowing through orders |
| Onboarding & training | One-time setup fees |
| **Working-capital financing** | Later stage, with BoT microfinance license or licensed partner |

**Path to TZS 25M MRR (~$10k/month):** 300 merchants + 20 suppliers + transaction fees + setup. No thousands of users needed before revenue.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend** | Node.js · Express · Prisma ORM |
| **Database** | PostgreSQL |
| **Frontend** | Next.js 14 · React · TypeScript · Tailwind CSS |
| **Auth** | JWT + phone + PIN login, with saved user language preference |
| **Messaging** | WhatsApp deep links + WhatsApp Cloud API (optional) |
| **Payments** | Cash, Bank, Credit, M-Pesa, Tigo Pesa, Airtel Money, HaloPesa |
| **Charts** | Recharts |
| **Containerisation** | Docker + Docker Compose |

---

## Verification and Authentication Status

- **Current production verification flow:** phone number + PIN + JWT session
- **Current registration flow:** merchant or supplier account creation with phone and PIN
- **Current language preference:** persisted per user and updated through `PATCH /api/auth/language`
- **Not yet implemented:** OTP / SMS phone verification
- **Recommended next step:** add OTP-based phone verification before high-trust financial workflows

### Security Notes

- PIN-only authentication is acceptable for early testing, but it is **not sufficient for stronger trust or payment-sensitive workflows**.
- Before enabling higher-risk actions, add OTP verification, rate-limiting, stronger PIN policies, and account recovery controls.
- Never commit real production secrets into git; keep `DATABASE_URL`, `JWT_SECRET`, and payment credentials in environment variables only.

---

## Project Structure

```text
DukaOS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Full data model
│   │   └── seed.js                # Demo merchant + supplier data
│   ├── src/
│   │   ├── app.js                 # Express entrypoint
│   │   ├── middleware/auth.js     # JWT middleware
│   │   ├── lib/prisma.js          # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── sale.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── supplier.controller.js
│   │   │   ├── stock.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── routes/                # One file per resource
│   │   └── services/
│   │       └── whatsapp.service.js  # WhatsApp message builder
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Login / Register
│   │   │   ├── dashboard/         # Business overview with charts
│   │   │   ├── inventory/         # Product list, stock adjustment
│   │   │   ├── sales/             # POS + history
│   │   │   ├── orders/            # Supplier orders + WhatsApp
│   │   │   ├── suppliers/         # Supplier directory
│   │   │   └── supplier/          # Supplier portal (separate login)
│   │   ├── components/
│   │   │   └── layout/AppShell.tsx  # Sidebar + mobile nav
│   │   └── lib/
│   │       ├── api.ts             # Typed fetch wrapper
│   │       └── i18n.ts            # Kiswahili / English translations
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

## Database Schema

```text
User ──────── Shop ──────── Product ──────── StockMovement
               │                │
               └──── Sale ──────┘ (SaleItem)
                      │
                    Order ──── Supplier ──── (OrderItem)
```

**Core models:**

- `User` — merchant or supplier, identified by phone + PIN
- `Shop` — one shop per merchant (extensible to multi-shop)
- `Product` — SKU, buying/selling price, stock level, minimum threshold
- `Sale` + `SaleItem` — each sale records profit per line item
- `StockMovement` — full audit trail of every stock change
- `Order` + `OrderItem` — supplier purchase orders with status lifecycle
- `Supplier` — can optionally have a user account (supplier portal)

---

## Getting Started

### Prerequisites

- Docker + Docker Compose, **or** Node.js 18+ and PostgreSQL

### Quick Start with Docker

```bash
git clone https://github.com/your-org/DukaOS.git
cd DukaOS

# Copy and edit env files
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build

# In a separate terminal, run migrations and seed
docker-compose exec backend npm run db:migrate -- --name init
docker-compose exec backend node prisma/seed.js
```

The app will be available at:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)

### Local Development (without Docker)

```bash
# 1. Database
createdb dukaos

# 2. Backend
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate -- --name init
node prisma/seed.js
npm run dev         # runs on :4000

# 3. Frontend (new terminal)
cd frontend
npm install
# Create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
npm run dev         # runs on :3000
```

### Local Verification Checklist

- Backend health responds at `http://localhost:4000/health`
- Frontend loads at `http://localhost:3000`
- Test merchant can log in
- Dashboard `All Time` tab renders
- Sales page shows `Bank` as a payment option
- Language toggle persists after refresh

### Production Environment Variables

- **Backend required:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` or `VERCEL_FRONTEND_URL`
- **Backend optional:** `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID`, `MPESA_API_URL`, `MPESA_BUSINESS_SHORT_CODE`, `MPESA_PASSKEY`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`
- **Frontend required:** `NEXT_PUBLIC_API_URL=https://dukaos-production.up.railway.app/api`

### Production Database Workflow

- **Official production command:** `npm run db:deploy`
- **Container startup command:** `npm run start:prod`
- **Policy:** create and commit Prisma migrations in git, then let production apply them with `prisma migrate deploy`
- **Do not use in production:** `prisma migrate dev`, `prisma db push`

### Deployment Checklist

1. Push changes to `main`.
2. Confirm the backend host has `DATABASE_URL`, `JWT_SECRET`, and frontend URL variables configured.
3. Deploy the backend from the `backend` root directory using the Dockerfile startup path (`npm run start:prod` inside the container).
4. If needed, run `npm run db:deploy` manually before release.
5. Deploy the frontend with `NEXT_PUBLIC_API_URL` pointing to `https://dukaos-production.up.railway.app/api`.
6. Verify Railway healthcheck path is `/health`.
7. Run `cd backend && npm run smoke:prod` and `cd frontend && npm run smoke` against the live URLs.
8. Run `cd frontend && npm run smoke:login` for the browser login/dashboard/sales/logout smoke flow.
9. Review `TESTING.md` for the full manual and automated smoke checklist.
10. Verify language switching, bank sales, all-time analytics, and supplier flows after release.

---

## Demo Accounts (after seeding)

| Role | Phone | PIN | Notes |
| --- | --- | --- | --- |
| Merchant | +255700000002 | 1234 | Mama Amina's grocery shop in Mbagala |
| Test Merchant | +255700000003 | 1234 | Dedicated production testing merchant account in Kinondoni |
| Supplier | +255700000001 | 1234 | Jumla Traders Ltd, Kariakoo |

---

## API Reference

### Auth

```text
POST   /api/auth/register    # Register new merchant or supplier
POST   /api/auth/login       # Login, returns JWT
GET    /api/auth/me          # Get current user profile
PATCH  /api/auth/language    # Switch UI language (sw / en)
```

### Products (Merchant only)

```text
GET    /api/products              # List all products (search, filter)
GET    /api/products/low-stock    # Products at or below minimum stock
GET    /api/products/:id          # Product detail + stock history
POST   /api/products              # Create product
PATCH  /api/products/:id          # Update product
DELETE /api/products/:id          # Soft-delete (deactivate)
```

### Stock Movements

```text
POST   /api/stock/adjust                    # Adjust stock (IN / OUT / ADJUSTMENT)
GET    /api/stock/:productId/movements      # Full audit trail for a product
```

### Sales

```text
GET    /api/sales            # Sale history (filterable by date)
GET    /api/sales/summary    # Aggregated totals by period (today/week/month)
GET    /api/sales/:id        # Sale detail
POST   /api/sales            # Record a sale (auto-decrements stock) with cash, bank, credit, or mobile money
```

### Orders

```text
GET    /api/orders                          # List orders (filterable by status)
GET    /api/orders/:id                      # Order detail + WhatsApp message
POST   /api/orders                          # Create order (returns WhatsApp message)
POST   /api/orders/:id/reorder              # One-tap repeat of previous order
PATCH  /api/orders/:id/confirm-delivery     # Receive goods (auto-increments stock)
PATCH  /api/orders/:id/cancel               # Cancel order
```

### Suppliers

```text
GET    /api/suppliers                                       # List all suppliers
GET    /api/suppliers/:id                                   # Supplier detail
POST   /api/suppliers                                       # Add supplier
PATCH  /api/suppliers/:id                                   # Update supplier

# Supplier portal (Supplier role)
GET    /api/suppliers/portal/orders                         # My incoming orders
GET    /api/suppliers/portal/dashboard                      # Dashboard stats
PATCH  /api/suppliers/portal/orders/:orderId/status         # Update order status
```

### Dashboard

```text
GET    /api/dashboard?period=today|week|month|all   # Full business overview, payment mix, and all-time business history
```

---

## Testing and QA

- Use `TESTING.md` as the primary release-verification reference.

### Smoke tests

- Goal: fast checks against production-safe paths and critical availability.
- Commands:
  - `cd backend && npm run smoke:prod`
  - `cd frontend && npm run smoke`
  - `cd frontend && npm run smoke:login`

### Integration tests

- Goal: API-level validation and negative-path checks with the Node test runner.
- Commands:
  - `cd backend && npm run test:api`

### E2E tests

- Goal: browser-level workflow checks with Playwright.
- Commands:
  - `cd frontend && npm run test:auth`
  - `cd frontend && npm run test:e2e`

### Minimum release regression checklist

- login for merchant and supplier accounts
- dashboard load with `today`, `month`, and `all` filters
- language toggle persistence
- bank payment sale creation
- supplier order visibility and status transitions
- inventory add, edit, and stock adjustment workflows
- backend health endpoint response

---

## WhatsApp Integration

Every order automatically generates a WhatsApp message in Kiswahili:

```text
🛒 *AGIZO JIPYA - Duka la Amina*
📅 Tarehe: 6 Machi 2026
🔢 Nambari ya Agizo: #A1B2C3D4

*Bidhaa Zilizoagizwa:*
  • Unga wa Sembe (2kg): *10 bag*
  • Mchele (1kg): *20 kg*
  • Mafuta ya Kupikia (1L): *12 litre*

💰 Jumla ya Thamani: TZS 85,600
📍 Mahali pa Biashara: Mbagala, Temeke

Tafadhali thibitisha agizo hili. Asante! 🙏
```

The frontend provides a **"Fungua WhatsApp"** button that opens WhatsApp with the pre-filled message. For API-driven sending, configure `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_ID` in the backend `.env`.

---

## Payment Methods Supported

| Method | Swahili Label |
| --- | --- |
| Cash | Pesa Taslimu |
| Bank | Benki |
| M-Pesa (Vodacom) | M-Pesa |
| Tigo Pesa | Tigo Pesa |
| Airtel Money | Airtel Money |
| HaloPesa (CRDB) | HaloPesa |
| Credit | Mkopo |

---

## Roadmap

### Phase 1 — Now (Launched)

- [x] Merchant registration + PIN auth
- [x] Product catalog + stock tracking
- [x] Low-stock alerts
- [x] POS sales recording
- [x] Profit analytics (daily/weekly/monthly/all-time)
- [x] Supplier directory
- [x] Supplier ordering
- [x] WhatsApp order export
- [x] One-tap reorder
- [x] Delivery confirmation + auto stock update
- [x] Supplier portal
- [x] Kiswahili UI
- [x] English/Swahili language toggle
- [x] Bank payment method support
- [x] Payment mix and business history dashboard views

### Phase 2 — Next

- [ ] OTP-based phone verification (Africa's Talking / Twilio)
- [ ] M-Pesa STK push integration (Vodacom Tanzania API)
- [ ] Barcode/QR scanner for stock-in
- [ ] Multi-store support
- [ ] Receipt generation (SMS / PDF)
- [ ] Bulk product import (CSV)
- [ ] Offline mode (PWA with service worker)
- [ ] Supplier route optimization

### Phase 3 — Scale

- [ ] Working-capital financing (requires BoT microfinance license or licensed partner)
- [ ] Demand forecasting ("order X units based on last 4 weeks")
- [ ] Supplier marketplace (merchants browse supplier catalogs)
- [ ] B2B payment rails between merchants and suppliers
- [ ] Accountant/bookkeeper access role
- [ ] Expansion: Mwanza, Arusha, Mbeya

---

## Tanzania Market Context

- **1,023,520** informal operators in Dar es Salaam (2019 informal sector survey)
- Wholesale/retail is the **largest informal segment**
- Mobile money users and transaction values **growing year-on-year** (Bank of Tanzania, 2024)
- Merchant surcharges on mobile money **prohibited** by Bank of Tanzania
- Digital lending requires BoT microfinance license — DukaOS enters as **software-first**, lending later
- NALA raised **$40M Series A in 2024** — Tanzanian fintech is attracting serious capital

---

## Target Go-to-Market (Month 1–3)

**Wedge:** Mini-groceries and kiosks in Dar es Salaam

**Priority areas:**

- Kariakoo
- Mbagala
- Tegeta
- Buguruni
- Kinondoni

**Acquisition channels:**

- Field reps with in-person demos
- One-page Kiswahili flyer
- WhatsApp onboarding flow
- Merchant referral bonus

**Pricing:**

- Merchants: TZS 20,000–37,500/month (~$8–15)
- Suppliers: TZS 375,000/month (~$150)
- Free setup for first 20 merchants

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push: `git push origin feature/your-feature`
5. Open a pull request

---

## License

MIT

---

*DukaOS — Kujenga biashara Tanzania* 🇹🇿
