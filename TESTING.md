# DukaOS Production Testing

## Live URLs

- Frontend: `https://duka-os.vercel.app/`
- Backend API: `https://dukaos-production.up.railway.app/api`
- Health: `https://dukaos-production.up.railway.app/health`

## Test Accounts

- Merchant: `+255700000002` / `1234`
- Test Merchant: `+255700000003` / `1234`
- Supplier: `+255700000001` / `1234`

## Quick Smoke Test

1. Open the frontend URL.
2. Log in with the test merchant account.
3. Confirm dashboard loads without API errors.
4. On the dashboard, switch the period filter to `All` and confirm all-time totals render.
5. Confirm the dashboard shows a payment mix section.
6. Confirm the dashboard shows a business history timeline section.
7. Use the language toggle and confirm labels switch between English and Swahili.
8. Refresh the page and confirm the selected language is preserved.
9. Open Inventory and confirm seeded products appear.
10. Open Suppliers and confirm the supplier record appears.
11. Open Sales and add at least one item to the cart.
12. Confirm `Bank` appears as a payment option.
13. Complete a sale using `Bank` and confirm success feedback appears.
14. Open Sales history and confirm the new sale is visible with the correct payment method.
15. Return to Dashboard and confirm recent sales/payment mix update accordingly.
16. Log out.
17. Log in with the supplier account.
18. Confirm the supplier portal loads.

## Deployment Readiness Checks

- Frontend production build should pass with `npx next build`
- Backend Prisma migration to apply: `20260311_add_bank_payment_method`
- Production backend deploy command remains: `npm run start:prod`
- Optional manual migration command: `npm run db:deploy`
- Backend smoke test: `cd backend && npm run smoke:prod`
- Frontend smoke test: `cd frontend && npm run smoke`
- Frontend Playwright login smoke test: `cd frontend && npm run smoke:login`
- Local Prisma validation requires `DATABASE_URL` to be set in the backend environment

## API Check

- Visit `https://dukaos-production.up.railway.app/health`
- Expected response:

```json
{"status":"ok","service":"DukaOS API"}
```

## Automated Smoke Coverage

- `backend/npm run smoke:prod`
  - Healthcheck success
  - Valid login success
  - Authenticated `/api/auth/me` success
  - Invalid token returns `401`
  - Invalid auth payload returns `400`
  - Invalid sales payload returns `400`
  - Invalid stock payload returns `400`
  - Invalid supplier payload returns `400`

- `frontend/npm run smoke`
  - Login page shell loads
  - Manifest is reachable

- `frontend/npm run smoke:login`
  - Live login works
  - Merchant dashboard loads
  - Sales page opens after login
  - Logout returns to the login page
