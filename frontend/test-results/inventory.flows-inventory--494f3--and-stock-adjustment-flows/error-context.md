# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.flows.spec.ts >> inventory supports add, edit, and stock adjustment flows
- Location: tests\inventory.flows.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /inventory|hifadhi ya bidhaa/i })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /inventory|hifadhi ya bidhaa/i })

```

# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog "Server Error" [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e8]:
          - button "previous" [disabled] [ref=e9]:
            - img "previous" [ref=e10]
          - button "next" [disabled] [ref=e12]:
            - img "next" [ref=e13]
          - generic [ref=e15]: 1 of 1 error
          - generic [ref=e16]:
            - text: Next.js (14.2.35) is outdated
            - link "(learn more)" [ref=e18] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - heading "Server Error" [level=1] [ref=e19]
        - paragraph [ref=e20]: "Error: Cannot find module './819.js' Require stack: - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\.next\\server\\webpack-runtime.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\.next\\server\\app\\supplier\\page.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\require.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\load-components.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\build\\utils.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\dev\\hot-middleware.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\dev\\hot-reloader-webpack.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\lib\\router-utils\\setup-dev-bundler.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\lib\\router-server.js - c:\\Users\\USER\\Documents\\Coding\\Projects 2\\DukaOS\\frontend\\node_modules\\next\\dist\\server\\lib\\start-server.js"
        - generic [ref=e21]: This error happened while generating the page. Any console logs will be displayed in the terminal window.
      - generic [ref=e22]:
        - heading "Call Stack" [level=2] [ref=e23]
        - group [ref=e24]:
          - generic "Next.js" [ref=e25] [cursor=pointer]:
            - img [ref=e26]
            - img [ref=e28]
            - text: Next.js
        - generic [ref=e33]:
          - heading "TracingChannel.traceSync" [level=3] [ref=e34]
          - generic [ref=e36]: node:diagnostics_channel (328:14)
        - group [ref=e37]:
          - generic "Next.js" [ref=e38] [cursor=pointer]:
            - img [ref=e39]
            - img [ref=e41]
            - text: Next.js
        - generic [ref=e46]:
          - heading "Array.reduce" [level=3] [ref=e47]
          - generic [ref=e49]: <anonymous>
        - group [ref=e50]:
          - generic "Next.js" [ref=e51] [cursor=pointer]:
            - img [ref=e52]
            - img [ref=e54]
            - text: Next.js
        - generic [ref=e59]:
          - heading "Array.map" [level=3] [ref=e60]
          - generic [ref=e62]: <anonymous>
        - group [ref=e63]:
          - generic "Next.js" [ref=e64] [cursor=pointer]:
            - img [ref=e65]
            - img [ref=e67]
            - text: Next.js
        - generic [ref=e72]:
          - heading "<unknown>" [level=3] [ref=e73]
          - generic [ref=e75]: file:///C:/Users/USER/Documents/Coding/Projects%202/DukaOS/frontend/.next/server/app/inventory/page.js (1:24077)
        - generic [ref=e76]:
          - heading "Object.<anonymous>" [level=3] [ref=e77]
          - generic [ref=e79]: file:///C:/Users/USER/Documents/Coding/Projects%202/DukaOS/frontend/.next/server/app/inventory/page.js (1:24125)
        - generic [ref=e80]:
          - heading "TracingChannel.traceSync" [level=3] [ref=e81]
          - generic [ref=e83]: node:diagnostics_channel (328:14)
        - group [ref=e84]:
          - generic "Next.js" [ref=e85] [cursor=pointer]:
            - img [ref=e86]
            - img [ref=e88]
            - text: Next.js
```

# Test source

```ts
  26  |   await page.route("**/api/auth/me", async (route) => {
  27  |     await route.fulfill({
  28  |       status: 200,
  29  |       contentType: "application/json",
  30  |       body: JSON.stringify({
  31  |         user: {
  32  |           name: "Test Merchant",
  33  |           role: "MERCHANT",
  34  |           language: "en",
  35  |           shop: { name: "Test Shop" },
  36  |         },
  37  |       }),
  38  |     });
  39  |   });
  40  | 
  41  |   await page.route("**/api/products/low-stock", async (route) => {
  42  |     await route.fulfill({
  43  |       status: 200,
  44  |       contentType: "application/json",
  45  |       body: JSON.stringify({ products: products.filter((item) => item.currentStock <= item.minimumStock) }),
  46  |     });
  47  |   });
  48  | 
  49  |   await page.route("**/api/suppliers", async (route) => {
  50  |     await route.fulfill({
  51  |       status: 200,
  52  |       contentType: "application/json",
  53  |       body: JSON.stringify({ suppliers }),
  54  |     });
  55  |   });
  56  | 
  57  |   await page.route("**/api/products?*", async (route) => {
  58  |     await route.fulfill({
  59  |       status: 200,
  60  |       contentType: "application/json",
  61  |       body: JSON.stringify({ products }),
  62  |     });
  63  |   });
  64  | 
  65  |   await page.route("**/api/products", async (route) => {
  66  |     if (route.request().method() !== "POST") {
  67  |       await route.fallback();
  68  |       return;
  69  |     }
  70  | 
  71  |     const body = JSON.parse(route.request().postData() || "{}");
  72  |     products.unshift({
  73  |       id: `prod-${products.length + 1}`,
  74  |       isActive: true,
  75  |       supplier: suppliers.find((item) => item.id === body.supplierId),
  76  |       ...body,
  77  |     });
  78  | 
  79  |     await route.fulfill({
  80  |       status: 201,
  81  |       contentType: "application/json",
  82  |       body: JSON.stringify({ product: products[0] }),
  83  |     });
  84  |   });
  85  | 
  86  |   await page.route("**/api/products/*", async (route) => {
  87  |     if (route.request().method() !== "PATCH") {
  88  |       await route.fallback();
  89  |       return;
  90  |     }
  91  | 
  92  |     const body = JSON.parse(route.request().postData() || "{}");
  93  |     const productId = route.request().url().split("/").pop();
  94  |     const product = products.find((item) => item.id === productId);
  95  |     if (product) {
  96  |       Object.assign(product, body, {
  97  |         supplier: suppliers.find((item) => item.id === body.supplierId) || product.supplier,
  98  |       });
  99  |     }
  100 | 
  101 |     await route.fulfill({
  102 |       status: 200,
  103 |       contentType: "application/json",
  104 |       body: JSON.stringify({ product }),
  105 |     });
  106 |   });
  107 | 
  108 |   await page.route("**/api/stock/adjust", async (route) => {
  109 |     const body = JSON.parse(route.request().postData() || "{}");
  110 |     const product = products.find((item) => item.id === body.productId);
  111 |     if (product) {
  112 |       if (body.type === "IN") product.currentStock += Number(body.quantity);
  113 |       if (body.type === "OUT") product.currentStock -= Number(body.quantity);
  114 |       if (body.type === "ADJUSTMENT") product.currentStock = Number(body.quantity);
  115 |     }
  116 | 
  117 |     await route.fulfill({
  118 |       status: 200,
  119 |       contentType: "application/json",
  120 |       body: JSON.stringify({ ok: true }),
  121 |     });
  122 |   });
  123 | 
  124 |   await page.goto("/inventory");
  125 | 
> 126 |   await expect(page.getByRole("heading", { name: /inventory|hifadhi ya bidhaa/i })).toBeVisible();
      |                                                                                     ^ Error: expect(locator).toBeVisible() failed
  127 |   await expect(page.getByText("Mchele Super")).toBeVisible();
  128 | 
  129 |   await page.getByRole("button", { name: /add product|ongeza bidhaa/i }).click();
  130 |   await expect(page.getByText(/add new product|ongeza bidhaa mpya/i)).toBeVisible();
  131 |   await page.getByLabel(/product name|jina la bidhaa/i).fill("Sukari White");
  132 |   await page.getByLabel(/sku/i).fill("SKR001");
  133 |   await page.getByLabel(/buying price|bei ya kununua/i).fill("3000");
  134 |   await page.getByLabel(/selling price|bei ya kuuza/i).fill("3500");
  135 |   await page.getByLabel(/current stock|idadi iliyopo/i).fill("8");
  136 |   await page.getByLabel(/minimum stock|kiwango cha chini/i).fill("2");
  137 |   await page.getByLabel(/supplier|msambazaji/i).selectOption("sup-1");
  138 |   await page.getByLabel(/does not expire|haiishi muda/i).check();
  139 |   await page.getByLabel(/^save$|^hifadhi$/i).click();
  140 | 
  141 |   await expect(page.getByText("Sukari White")).toBeVisible();
  142 |   await expect(page.getByText(/tzs 3,500/i)).toBeVisible();
  143 | 
  144 |   await page.getByLabel(/edit product sukari white|hariri bidhaa sukari white/i).click();
  145 |   await expect(page.getByText(/edit product|hariri bidhaa/i)).toBeVisible();
  146 |   await page.getByLabel(/product name|jina la bidhaa/i).fill("");
  147 |   await page.getByLabel(/product name|jina la bidhaa/i).fill("Sukari Brown");
  148 |   await page.getByLabel(/selling price|bei ya kuuza/i).fill("");
  149 |   await page.getByLabel(/selling price|bei ya kuuza/i).fill("3600");
  150 |   await page.getByLabel(/^save$|^hifadhi$/i).click();
  151 | 
  152 |   await expect(page.getByText("Sukari Brown")).toBeVisible();
  153 |   await expect(page.getByText(/tzs 3,600/i)).toBeVisible();
  154 | 
  155 |   await page.getByLabel(/adjust stock sukari brown|rekebisha hifadhi sukari brown/i).click();
  156 |   await expect(page.getByText(/adjust stock|rekebisha hifadhi/i)).toBeVisible();
  157 |   await page.getByLabel(/set amount|rekebisha/i).click();
  158 |   await page.getByLabel(/new quantity|idadi mpya/i).fill("25");
  159 |   await page.getByLabel(/note|maelezo/i).fill("Stock take correction");
  160 |   await page.getByLabel(/^save$|^hifadhi$/i).click();
  161 | 
  162 |   await expect(page.getByText(/25 kg/)).toBeVisible();
  163 | });
  164 | 
```