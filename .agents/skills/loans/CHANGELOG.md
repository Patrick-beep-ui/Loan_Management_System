# Changelog — loans

### 2026-11-27 — Corrected authentication documentation

- Change: replaced the obsolete Bearer-token requirement with the current
  `access_token` HttpOnly cookie requirement.
- Impact: loan ownership behavior is unchanged; the module guide now matches
  `checkAuth` and the cookie-based session contract.
- Verification: reviewed `checkAuth.js` and `docs/openapi.json`.

### 2026-11-25 — Lender options in the admin panel

- Change: the reassignment dropdown in the `/admin/loans` panel is built from
  `GET /api/users` filtered to accounts with `Role.role_name = "lender"`,
  instead of showing all stakeholders.
- Impact: the loan API contract does not change; only the UI is restricted to
  lenders with an account. Inactive accounts with the `lender` role remain
  available as options.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

### 2026-11-25 — P5 loan administration

- Change: `loanRoutes.js` applies `requireAdminForLenderChange` in `POST`, `PUT`
  and `PATCH`. The `/admin/loans` panel lists all loans with `GET /api/loans`
  and reassigns the lender with `PATCH /api/loans/:id`.
- Impact: a `lender` account cannot send a `lender_id` belonging to another
  lender in any mutation; it receives `403 Only admins can change the lender`.
  An `admin` can reassign lenders even on loans with payments, without new
  endpoints.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

### 2026-11-23 — Partial editing of loans with payments

- Change: `updateLoan` now checks whether payments exist and applies a
  whitelist: with payments it accepts only `guarantors` and `collaterals`, and
  `lender_id` additionally for `admin`. `assertNoPayments` was split into
  `findLoanPaymentConflicts`, `loanHasPayments`, and `assertNoPayments`, so
  `PUT` and `DELETE` remain blocked with `409`. Any other field in `PATCH` with
  payments returns `409` even if it repeats the stored value.
- Impact: loans with payments can update guarantors, collateral, and, for
  administrators only, the lender via `PATCH /api/loans/:id`. Financial changes,
  customer, disbursement date, and schedule changes require reversing the
  payments. Details are in [`SKILL.md`](SKILL.md).
- Verification: no API tests were run; only the code was reviewed. Database
  behavior and the `409`/`403` codes remain unverified at runtime.

## 2026-11-18 — `loanScope` shared with payments

- Change: `loanScope` was exported from `loanService` and loans with payments
  continue to block financial changes, replacement, and deletion with `409`.
  The documentation points to the new `payments` module.
- Impact: payment recording updates installment and interest statuses without
  duplicating ownership logic; the loan contract does not change.
- Verification: payment of an installment and interest on a temporary loan,
  subsequent `DELETE` blocked with `409`, and manual cleanup of payments to
  allow deletion.

## 2026-11-17 — Loans restricted to the authenticated lender

- Change: controllers pass `req.user` to all six loan services. `loanService`
  filters by `lender_id = req.user.stakeholder_id` for `lender` accounts,
  derives that value on creation, and rejects with `403` a different
  `lender_id` or an attempt to change it in PATCH. `admin` retains global
  access.
- Impact: a lender only sees and modifies its own loans; a loan belonging to
  another lender returns `404`. `ForbiddenError` (`403`) was added to the typed
  errors. Tokens include `role_name` and `stakeholder_id`.
- Verification: two lenders saw only their loans (`[29]` and `[30]`), admin saw
  both; a `lender_id` belonging to another lender on creation → 403, another
  lender's loan on read/delete → 404, `lender_id` change in PATCH → 403, admin
  created with `lender_id: 5`. Temporary data deleted; `node --check` without
  errors.

## 2026-11-17 — `national_id` conflict identified by index name

- Change: `handleConstraintError` gathers paths from `error.errors` and
  `error.fields` and recognizes `national_id` or index names containing it.
- Impact: a duplicate inline `national_id` returns
  `409 A stakeholder with that national ID already exists` instead of the
  generic message `A related record already exists`, even if Sequelize reports
  the constraint name. Other uniqueness constraints retain the generic message.
- Verification: creation of a loan with an inline guarantor whose `national_id`
  already existed returned the specific message without leaving stored loans;
  `node --check` and `git diff --check` without errors.

## 2026-11-17 — Simplified service and centralized validation

- Change: `loanService.js` went from 24 to 10 functions (6 operations and 4
  helpers: `handleConstraintError`, `findLoanOrThrow`, `assertNoPayments` and
  `writeChildren`). Bridge functions were removed and calculation of effective
  terms, detection of financial changes, and all `PATCH` rules (different
  stakeholders, interest mode, and installment totals) were moved to
  `loanValidation.js`. Validation helpers are no longer exported.
- Impact: No changes to routes or the response contract. A repeated guarantor
  `stakeholder_id` together with an inline stakeholder resolving to the same
  record now returns `409` due to the unique constraint on `loan_guarantors`
  (previously `400`). Input validation resolves before payment blocks, and a
  nonexistent `:id` is detected before an invalid body in `PATCH`.
- Verification: 28 service checks against the database (create, list, replace,
  update, and delete; nested relationships, virtual fields, 400/404/409 codes,
  installment-payment blocks, and included/separate interest synchronization)
  and startup of the API server on port 3000. `node --check` and
  `git diff --check` without errors. Database restored to 0 loans and 6
  stakeholders.

## 2026-11-16 — Loans with installments, guarantors, collateral, and included/separate interest

- Change: `loanValidation.js` and `loanService.js` were redesigned so that
  `POST` and `PUT` receive nested `installments`, `guarantors`, and
  `collaterals` and persist them in a transaction. `interest_payment_mode`
  (`included`/`separate`), the virtual calculation of `interest_amount` and
  `total_to_pay`, and a pending obligation in `loan_interest_payments` for
  separate interest were added. The migration
  `database/migrations/2026-11-16-loan-interest-payment-mode.sql` was added.
- Impact: `POST`/`PUT` require the three arrays and validate numbering, dates,
  equal amounts except for the last installment, and totals. `PATCH` replaces
  only the arrays sent and requires `installments` when financial fields
  change. Responses include sorted installments, guarantors, collateral,
  interest, and the calculated fields. Installment payments or paid interest
  block changes and deletion with `409`. `DELETE` removes the loan's
  relationships but preserves stakeholders created inline.
- Verification: invalid validation cases and installment rounding; service test
  with create/read/replace/update/delete and `409` blocks; rollback for
  duplicate `national_id`; HTTP test of `POST`, `GET`, `PATCH` and `DELETE`;
  model with `interest_amount = 200` and `total_to_pay = 1200` for `1000` at
  20%. Database counts restored.

## 2026-11-16 — Strict validation of date, amounts, and borrower/customer

- Change: `loanValidation.js` was moved to `src/server/utils/validators/`.
  `disbursed_at` now requires a time and accepts ISO 8601 (with optional
  `Z`/offset) or MySQL format; without a zone it is interpreted in server local
  time, validated that the date exists, and normalized to ISO UTC.
  `loan_amount` is set to `(0, 9999999999.99]` and `interest_rate` to
  `[0, 999.9999]`, accepting numeric strings. `assertDistinctStakeholders` was
  added, applied on creation, replacement, and partial update (considering
  already-stored values).
- Impact: `POST /api/loans` and `PUT /api/loans/:id` respond `400` if
  `lender_id === customer_id`; `PATCH` does the same when the change produces
  that equality. Dates without a time or impossible dates and amounts/rates out
  of range respond `400`. `disbursed_at` remains `DataTypes.DATE` and is
  returned in ISO UTC.
- Verification: Runtime tests with token: missing/date-only/impossible/non-string
  date → `400`; ISO `Z`, MySQL, and `+02:00` offset → `201` with correct
  instants; amount `0`, above the maximum, non-numeric, and boolean → `400`;
  rate out of range/non-numeric → `400`; same person in POST/PUT/PATCH → `400`;
  nonexistent reference → `409`; `PUT`/`PATCH`/listing/detail/`404`/invalid
  id/`DELETE` verified. Temporary data deleted and counts restored.

## 2026-11-16 — Initial loan CRUD

- Change: The `loans` CRUD was added in `loanRoutes` → `loanController` →
  `loanService`, with input validation and parsing in
  `src/server/utils/loanValidation.js`. Includes listing/detail with `lender`
  and `customer`, creation, replacement (`PUT`), partial update (`PATCH`) and
  deletion (`DELETE`).
- Impact: New routes protected by `checkAuth` under `/api/loans`. Input
  validations respond `400`; nonexistent loans `404`; invalid references or
  referenced records on deletion respond `409`.
- Verification: `node --check` on `src/server/api.js`,
  `src/server/routes/loanRoutes.js`,
  `src/server/controllers/loanController.js`,
  `src/server/services/loanService.js` and
  `src/server/utils/loanValidation.js` (without errors). No functional endpoint
  tests were run in this session.
