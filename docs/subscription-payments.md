# Subscription payments

## Merchant experience

Choose Basic (TZS 15,000/month) or Pro (TZS 35,000/month) in Billing.

1. Lipa number / Send money: M-Pesa 52806296 (Necuva Group Limited), Mix by Yas
   18214626 (Necuva), AzamPesa 293726045 (Necuva Group Limited), Selcom 7006 3589
   (Necuva Group Limited), or send money
   to 0743910580. Check the recipient on the phone before paying. Submit the
   reference for admin verification; submitting a reference is not activation.
2. nTZS online: when enabled, an owner enters a Tanzanian mobile number and
  approves the collection prompt on the phone. nTZS creates a provider-side payer
  reference solely for the collection and collects directly to DukaPilot's treasury;
  it does not expose a wallet or API key to the browser. Never enter the mobile-money PIN
   in DukaPilot. Check payment status after approval. A verified completed deposit
   creates one confirmed subscription payment and adds one calendar month.

## Deployment gate

This integration is not yet approved for live customer payments. On 6 September
2026 the provider dashboard showed Collections enabled but KYB "Not started".
No real collection was initiated as part of this implementation.

- Complete nTZS KYB and confirm permission to collect to the business treasury.
- Rotate the API key shared in chat. Set NTZS_API_KEY privately in Railway.
- NTZS_API_KEY and NTZS_WEBHOOK_SECRET are configured as private Railway variables.
- Deploy backend first with `npm run db:deploy` in backend. The additive
  migrations create subscription_checkouts/branch fields and do not modify old payments.
- Configure provider webhook URL:
  https://dukapilotproduction.up.railway.app/api/webhooks/ntzs
- Keep NTZS_ENABLED=false until controlled acceptance testing is completed.
  Code currently requires a live key; sandbox end-to-end testing needs an isolated
  environment and explicit test-mode wiring before using a provider test key.
- Confirm signed webhook timestamp format and retry behavior with the provider.
  Handler accepts epoch seconds/milliseconds within five minutes and signs the
  exact timestamp + dot + raw JSON body using HMAC-SHA256.
- Enable only after the checklist below passes. Never put keys in frontend env,
  screenshots, Git, logs or customer messages.

## Payment integrity

Prices are server controlled whole TZS. Owners only, scoped to their shop; expired
subscriptions may pay, deliberately suspended shops must contact support.
One open checkout per shop prevents concurrent new prompts. The original request
key and provider idempotency key are persisted before initiating collection.
Initiation timeouts remain REVIEW with the lock intact. Owners and administrators
can retry/reconcile that same checkout; the backend reuses the original checkout ID
and provider idempotency keys and records the action in the audit log. Never create
a new checkout merely because the first provider response was lost.
Provider readback verifies deposit ID, amount and payment method. Webhooks require
a valid signature and live event, then perform the same authenticated readback.
No redirect, browser assertion, manual reference or unverified webhook activates access.
Shop row locking serializes online renewals; payment insertion and plan extension
are one transaction. Pending records do not enter confirmed-payment statistics.

## Support and limitations

- One-month purchases only. Changes between prepaid plans require support; no
  automatic proration or conversion of Basic months into Pro months.
- Failed collections require support before another attempt. Review/unknown outcomes
  appear in the administrator payment-exceptions queue and must be reconciled against
  nTZS before the pending lock can be released.
- No automatic refund, recurring debit mandate, hosted card checkout or merchant
  wallet features are implemented. The backend creates a provider payer reference
  per checkout because nTZS requires it, then collects to DukaPilot's treasury.
- Webhook delivery is the background completion path; owners can also check or retry
  the original checkout manually. The admin review queue supports the same safe retry.
  A scheduled provider-wide reconciliation worker remains a future reliability upgrade.
- Lost initiation responses without a deposit ID need provider-assisted matching
  using the saved checkout ID/idempotency key. Never guess a match by amount alone.
- Manual payment recording and online renewals now share shop row-lock discipline.
  Real database concurrency/rollback tests are still required before enabling
  mixed concurrent manual/online renewals.

## Acceptance checklist

The repository now runs the full mocked backend suite, payment tests, browser billing
tests, TypeScript and Prisma validation in CI. Browser tests use mocks, not real
charges. Live provider settlement still requires the controlled acceptance checks below.

- Apply migration to a disposable database; verify rollback on payment insertion failure.
- Concurrent duplicate check/webhook: exactly one payment and one month added.
- Wrong shop, wrong amount, wrong ID, test event and invalid signature never activate.
- Expired owner can pay; staff and suspended owners cannot initiate payments.
- Verify one authorized Basic and Pro collection including real provider delivery.
- Test denied phone prompt, insufficient funds, provider timeout and late completion.
- Close browser before paying; webhook must activate without browser polling.
- Repeat webhook and browser check; expiry must not move a second time.
- Check month-end renewal, no future paid days lost, and manual-renewal concurrency.
- Test mobile English/Swahili, copy numbers, failed reference preservation.

Official contract reviewed: https://www.ntzs.co.tz/developers and
https://www.ntzs.co.tz/openapi.json (6 September 2026).
