# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: supplier.portal.spec.ts >> supplier can confirm, dispatch, and cancel portal orders
- Location: tests\supplier.portal.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/imethibitishwa/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/imethibitishwa/i)

```

```
Error: apiRequestContext._wrapApiCall: ENOENT: no such file or directory, open 'c:\Users\USER\Documents\Coding\Projects 2\DukaOS\frontend\test-results\.playwright-artifacts-0\traces\cc577a6121ab01bbfb72-61a11f08c5250c5fafa4.trace'
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - button "Zilizothibitishwa" [ref=e33] [cursor=pointer]
        - button "Zinakwenda" [ref=e34] [cursor=pointer]
        - button "Zimepokelewa" [ref=e35] [cursor=pointer]
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - paragraph [ref=e41]: Duka la Juma
            - generic [ref=e42]: Inasubiri
          - paragraph [ref=e43]: "Tegeta, Kinondoni • #DING-2"
          - paragraph [ref=e44]: TZS 15,000
        - button "Expand order Duka la Juma" [ref=e45] [cursor=pointer]:
          - img [ref=e46]
  - alert [ref=e48]
```