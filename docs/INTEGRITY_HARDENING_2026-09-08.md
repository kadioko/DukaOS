# Integrity hardening release - 8 September 2026

This release closes the highest-risk findings from the live-system review.

## Behaviour changes

- Debt edits can no longer set collection totals or status. Payment status is derived
  from the collection ledger, edits use an optimistic concurrency guard, and payment
  retries use a unique request key that cannot be reused with different details.
- Every branch reads billing entitlement from the main business while branch archival
  remains an independent access block.
- Owner and staff access tokens carry a session version. PIN resets and PIN changes
  increment that version and immediately invalidate older access and refresh tokens.
- Unknown nTZS checkout outcomes stay in REVIEW and can be retried by the owner or an
  administrator using the original provider idempotency context. Admin actions are audited.
- Merchant deletion uses a transactional anonymization workflow. Operational,
  behavioural, device, and contact data are removed or de-identified; limited payment
  and audit records remain for legal and reconciliation purposes.
- Push delivery uses a deterministic daily deduplication key and an atomic five-minute
  delivery lease. Only 404/410 responses disable a device; temporary provider failures
  retry without invalidating the subscription.
- Notification content follows the business owner's language. Private previews hide
  business details on the lock screen by default and can be changed in Settings.
- AI actions record a baseline and show a verified-result badge only after the related
  debt, product, or quotation state actually improves.

## Deployment

1. Back up the production database.
2. Deploy the backend and apply `20260908090000_integrity_and_delivery_hardening`.
3. Expect existing users to sign in again because pre-release tokens do not contain the
   new session version.
4. Deploy the frontend after the migration and backend are healthy.
5. Run `npm run monitor:prod` in `backend`, then exercise debt collection, a branch write,
   PIN reset, checkout review retry, notification settings, and account anonymization on
   non-production test records.

## Verification

CI runs the backend unit suite, frontend typecheck and production Playwright suite,
dependency audits, Android wrapper checks, and a disposable PostgreSQL deletion test.
Live nTZS settlement and migration application remain deployment gates.
