# Changelog — payments

### 2026-11-27 — Corrected authentication documentation

- Change: replaced the obsolete Bearer-token requirement with the current
  `access_token` HttpOnly cookie requirement.
- Impact: payment ownership behavior is unchanged; the module guide now matches
  `checkAuth` and the cookie-based session contract.
- Verification: reviewed `checkAuth.js` and `docs/openapi.json`.

### 2026-11-27 — Lender payment recording

- Change: `/payments` now lets lenders record a pending installment or separate
  interest using the shared `useAdminPayments` hook and recording dialog. The
  read-only `usePaymentsOverview` hook was removed.
- Impact: lenders use the same validated form and endpoints as admins, with
  loans and payments scoped by the API to their own account. No API or schema
  changed; reversal remains on `/loans/:id`. Details are in
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` succeeded. Not tested in a browser or against a
  server.

### 2026-11-27 — Lender payments header simplified

- Change: removed `Back to loans` from `PaymentsHeader` and the `Payments`
  button from `LoanListHeader`; navigation now stays in `LenderLayout`.
- Impact: the read-only history and its data loading are unchanged, and no API
  or schema changed. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` succeeded. Not tested in a browser.

### 2026-11-26 — General lender payments view

- Change: added `/payments` with `usePaymentsOverview` and components under
  `src/components/payments/` for a read-only payment history. `RequireLender`
  redirects admins to `/admin/payments`, and the loans list links lenders to the
  new view.
- Impact: a lender can review all payments on their loans in one place, with
  loan links, target, amount, date, recorder, and total. The page relies on the
  existing lender-scoped `GET /api/payments`; no backend route or schema changed.
- Verification: `pnpm build` succeeded. Not tested in a browser or against a
  server.

### 2026-11-25 — P6 payment administration

- Change: `/admin/payments` was no longer a stub. `useAdminPayments` and five
  components under `src/components/admin/payments/` were added to query the
  global history, record pending payments, and reverse existing payments.
- Impact: recording reuses `buildPaymentPayload` and the
  `/api/payments/installment` and `/api/payments/interest` endpoints, with
  `GET /api/loans` as the source of pending targets. Reversal uses
  `usePaymentRevert` and `RevertPaymentDialog` without duplicating logic or
  routes under `/api/admin`.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

### 2026-11-23 — Relationship with partial loan editing

- Change: it was documented that, with payments recorded, `PATCH /api/loans/:id`
  still allows guarantors, collateral, and, for `admin`, the lender. Reversing
  payments restores full financial editing and deletion.
- Impact: does not change the `/api/payments` contract; it clarifies when the
  detail view shows the reduced form versus the full form. Details are in
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-23 — Reversal exposed in the client

- Change: The detail view consumes `GET /api/payments?loan_id=...` and
  `DELETE /api/payments/:id` via its own hooks, separate from payment recording.
  Deletion remains the transactional reversal already implemented.
- Impact: Installment and interest payments can be reversed from `/loans/:id`
  with confirmation; the view reloads the loan and the history, enables
  deletion, and restores full financial editing. The flow is in
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-18 — Payment correction and reversal

- Change: `PATCH /api/payments/:id` (only `paid_at`) and
  `DELETE /api/payments/:id` were added. Deletion reverses the payment in a
  transaction: it removes the installment link or nullifies the interest link,
  restores the target to `pending`, and deletes the record in `loan_payments`.
- Impact: Payments remain immutable in amount, target, and `recorded_by`; only
  the date can be corrected. After a reversal the loan again accepts financial
  changes and deletion because it no longer has payments.
- Verification: service test on MySQL without `node --check`: installment and
  separate interest payment, `PATCH` of `paid_at` on both, `PATCH` without
  `paid_at` → `400`, `DELETE` of both → `404` on detail, installment/interest in
  `pending`, null `payment_id`, and temporary loan deleted. Pre-existing data
  not modified.

## 2026-11-18 — Separate endpoints for installments and interest

- Change: The generic `POST /api/payments` was replaced by
  `POST /api/payments/installment` and `POST /api/payments/interest`. The
  validator exposes a builder per target and the service exports two explicit
  functions sharing a single transaction; payload-based dispatch was removed.
- Impact: The route declares what is being paid, so there is no ambiguity from
  the `installment_id`/`loan_interest_payment_id` fields. The field for the
  other target is ignored. `recorded_by` still derives from the JWT and is
  returned in the response.
- Verification: the same test ran `createInstallmentPayment` and
  `createInterestPayment` from scratch, checking `recorded_by: 16`, provided
  `paid_at`, and the installment and interest links.

## 2026-11-18 — Recording of installment and separate interest payments

- Change: The `payments` module was added with a validator, transactional
  service, controller, and protected routes `GET /api/payments`,
  `GET /api/payments/:id` and `POST /api/payments`. A payment covers the full
  amount of an installment or of a separate interest obligation, updates its
  status, and stores `recorded_by` from the JWT. `loanScope` was exported from
  `loanService` to reuse the lender filter.
- Impact: Loans with payments remain blocked for financial changes and deletion
  (`409`). Payment listings respect `lender` scoping and `admin` retains global
  access.
- Verification: `node --check` on the new and modified files; service test on
  MySQL with installment and interest payment, `paid` statuses, `payment_id`
  links, duplicates `409`, a `loan_id` belonging to another lender, and
  `DELETE` block (`409`), listings by lender/admin and detail by id. Temporary
  data deleted; database at 0 loans and 0 payments.
