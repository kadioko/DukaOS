# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: supplier.portal.spec.ts >> supplier can confirm, dispatch, and cancel portal orders
- Location: tests\supplier.portal.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /expand order duka la amina/i })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - img [ref=e6]
          - generic [ref=e9]:
            - paragraph [ref=e10]: DukaOS — Msambazaji
            - paragraph [ref=e11]: Portal ya Wasambazaji
        - button "Toka" [ref=e12] [cursor=pointer]:
          - img [ref=e13]
          - text: Toka
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - paragraph [ref=e19]: "2"
          - paragraph [ref=e20]: Zinazosubiri
        - generic [ref=e21]:
          - paragraph [ref=e22]: "1"
          - paragraph [ref=e23]: Zilizothibitishwa
        - generic [ref=e24]:
          - paragraph [ref=e25]: "0"
          - paragraph [ref=e26]: Zinakwenda
        - generic [ref=e27]:
          - paragraph [ref=e28]: "0"
          - paragraph [ref=e29]: Zimepokelewa
      - generic [ref=e30]:
        - button "Yote" [ref=e31] [cursor=pointer]
        - button "Zinazosubiri" [ref=e32] [cursor=pointer]
        - button "Zilizothibitishwa" [active] [ref=e33] [cursor=pointer]
        - button "Zinakwenda" [ref=e34] [cursor=pointer]
        - button "Zimepokelewa" [ref=e35] [cursor=pointer]
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]:
                - paragraph [ref=e41]: Duka la Amina
                - generic [ref=e42]: Imethibitishwa
              - paragraph [ref=e43]: "Mbagala, Temeke • #DING-1"
              - paragraph [ref=e44]: TZS 24,000
            - button "Collapse order Duka la Amina" [ref=e45] [cursor=pointer]:
              - img [ref=e46]
          - generic [ref=e48]:
            - generic [ref=e50]:
              - generic [ref=e51]: Unga
              - generic [ref=e52]: 5 bag
            - paragraph [ref=e53]: "\"Pakia mapema\""
            - button "Safirishwa Duka la Amina" [ref=e54] [cursor=pointer]:
              - img [ref=e55]
              - text: Safirishwa
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]:
              - paragraph [ref=e61]: Duka la Rehema
              - generic [ref=e62]: Imethibitishwa
            - paragraph [ref=e63]: "Buguruni, Ilala • #RMED-1"
            - paragraph [ref=e64]: TZS 18,000
          - button "Expand order Duka la Rehema" [ref=e65] [cursor=pointer]:
            - img [ref=e66]
  - alert [ref=e68]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("supplier can confirm, dispatch, and cancel portal orders", async ({ page }) => {
  4  |   const orders = [
  5  |     {
  6  |       id: "ord-pending-1",
  7  |       status: "PENDING",
  8  |       totalAmount: 24000,
  9  |       createdAt: "2026-04-03T08:00:00.000Z",
  10 |       note: "Pakia mapema",
  11 |       shop: { name: "Duka la Amina", location: "Mbagala", district: "Temeke" },
  12 |       items: [{ product: { name: "Unga", unit: "bag" }, quantity: 5 }],
  13 |     },
  14 |     {
  15 |       id: "ord-pending-2",
  16 |       status: "PENDING",
  17 |       totalAmount: 15000,
  18 |       createdAt: "2026-04-03T09:00:00.000Z",
  19 |       shop: { name: "Duka la Juma", location: "Tegeta", district: "Kinondoni" },
  20 |       items: [{ product: { name: "Mafuta", unit: "litre" }, quantity: 3 }],
  21 |     },
  22 |     {
  23 |       id: "ord-confirmed-1",
  24 |       status: "CONFIRMED",
  25 |       totalAmount: 18000,
  26 |       createdAt: "2026-04-03T10:00:00.000Z",
  27 |       shop: { name: "Duka la Rehema", location: "Buguruni", district: "Ilala" },
  28 |       items: [{ product: { name: "Sukari", unit: "bag" }, quantity: 2 }],
  29 |     },
  30 |   ];
  31 | 
  32 |   await page.addInitScript(() => {
  33 |     window.localStorage.setItem("dukaos_token", "playwright-supplier-token");
  34 |   });
  35 | 
  36 |   await page.route("**/api/suppliers/portal/dashboard", async (route) => {
  37 |     await route.fulfill({
  38 |       status: 200,
  39 |       contentType: "application/json",
  40 |       body: JSON.stringify({
  41 |         ordersByStatus: { PENDING: 2, CONFIRMED: 1, OUT_FOR_DELIVERY: 0, DELIVERED: 0 },
  42 |         pendingOrders: [orders[0]],
  43 |       }),
  44 |     });
  45 |   });
  46 | 
  47 |   await page.route("**/api/suppliers/portal/orders", async (route) => {
  48 |     await route.fulfill({
  49 |       status: 200,
  50 |       contentType: "application/json",
  51 |       body: JSON.stringify({ orders }),
  52 |     });
  53 |   });
  54 | 
  55 |   await page.route("**/api/suppliers/portal/orders/*/status", async (route) => {
  56 |     const body = JSON.parse(route.request().postData() || "{}");
  57 |     const orderId = route.request().url().split("/").slice(-2)[0];
  58 |     const order = orders.find((item) => item.id === orderId);
  59 |     if (order) {
  60 |       order.status = body.status;
  61 |     }
  62 | 
  63 |     await route.fulfill({
  64 |       status: 200,
  65 |       contentType: "application/json",
  66 |       body: JSON.stringify({ ok: true }),
  67 |     });
  68 |   });
  69 | 
  70 |   await page.goto("/supplier");
  71 | 
  72 |   await expect(page.getByText(/portal ya wasambazaji/i)).toBeVisible();
  73 |   await expect(page.getByText("Duka la Amina")).toBeVisible();
  74 |   await expect(page.getByText("Duka la Juma")).toBeVisible();
  75 | 
  76 |   await page.getByRole("button", { name: /expand order duka la amina/i }).click();
  77 |   await page.getByRole("button", { name: /thibitisha/i }).click();
  78 | 
  79 |   await page.getByRole("button", { name: /zilizothibitishwa/i }).click();
  80 |   await expect(page.getByText("Duka la Amina")).toBeVisible();
  81 |   await expect(page.getByText("Duka la Rehema")).toBeVisible();
  82 |   await expect(page.locator("div.bg-white.rounded-xl.border").filter({ hasText: "Duka la Amina" }).getByText(/imethibitishwa/i)).toBeVisible();
> 83 |   await page.getByRole("button", { name: /expand order duka la amina/i }).click();
     |                                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  84 |   await page.getByRole("button", { name: /safirishwa/i }).first().click();
  85 |   await page.getByRole("button", { name: /zinakwenda/i }).click();
  86 |   await expect(page.getByText("Duka la Amina")).toBeVisible();
  87 |   await expect(page.getByText(/imesafirishwa/i)).toBeVisible();
  88 |   await expect(page.getByText(/inasubiri uthibitisho wa mpokeaji/i)).toBeVisible();
  89 | 
  90 |   await page.getByRole("button", { name: /zinazosubiri/i }).click();
  91 |   await page.getByRole("button", { name: /expand order duka la juma/i }).click();
  92 |   await page.getByRole("button", { name: /kataa agizo duka la juma/i }).click();
  93 |   await page.getByRole("button", { name: /yote/i }).click();
  94 |   await expect(page.getByText(/imefutwa/i)).toBeVisible();
  95 | });
  96 | 
```