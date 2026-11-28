---
name: loans
description: Loans CRUD with a nested installment schedule, guarantors, collateral, and included/separate ordinary-interest tracking.
---

# loans

CRUD for loans (`loans`) that link a lender (`lender_id`) and a customer
(`customer_id`) with the amount, interest rate, disbursement date, and ordinary
interest payment mode. `lender` accounts record and manage only the loans they
provide; `admin` retains global access.

Creation and replacement create or replace, in a single transaction, the
installment schedule (`loan_installments`), guarantors (`loan_guarantors`), and
collateral (`loan_collaterals`). When interest is charged separately, a pending
obligation is also created in `loan_interest_payments`. Payments are recorded in
the [`payments`](../payments/SKILL.md) module, which updates installment and
interest statuses and blocks these loans from subsequent changes.

The change history of this module is in [`CHANGELOG.md`](CHANGELOG.md).

## Validation

All payload validation and normalization lives in
`src/server/utils/validators/loanValidation.js`. The service does not validate
input data: it receives already-normalized attributes and arrays and only
performs transactional persistence, blocks due to existing payments, and the
`PATCH` whitelist when payments exist. In `PATCH`, the validator receives the
stored loan to resolve rules that depend on the current status (effective terms,
financial changes, and installment totals).

When a request has input errors and the loan also has payments, it returns the
validation error (`400`); the payment conflict (`409`) is evaluated afterward.
A nonexistent `:id` is detected before an invalid body in `PATCH`, so it returns
`404` in that case.

## Endpoints

All routes require `Authorization: Bearer <token>`.

| Method | Route | Controller | Service | Access |
| --- | --- | --- | --- | --- |
| `GET` | `/api/loans` | `loanController.getAllLoans` | `loanService.getAllLoans` | own lender / admin |
| `GET` | `/api/loans/:id` | `loanController.getLoanById` | `loanService.getLoanById` | own lender / admin |
| `POST` | `/api/loans` | `loanController.createLoan` | `loanService.createLoan` | lender / admin |
| `PUT` | `/api/loans/:id` | `loanController.replaceLoan` | `loanService.replaceLoan` | own lender / admin |
| `PATCH` | `/api/loans/:id` | `loanController.updateLoan` | `loanService.updateLoan` | own lender / admin |
| `DELETE` | `/api/loans/:id` | `loanController.deleteLoan` | `loanService.deleteLoan` | own lender / admin |

## Permissions and ownership

Controllers pass `req.user` (`user_id`, `role_id`, `role_name`,
`stakeholder_id`) to all loan services.

- `admin` (`role_name = "admin"`): global access; `lender_id` remains
  configurable on creation, replacement, and PATCH.
- `requireAdminForLenderChange` is applied in `POST`, `PUT`, and `PATCH` from
  `loanRoutes.js`: it rejects with `403 Only admins can change the lender` any
  `lender_id` other than a `lender` account's own `stakeholder_id`. The services
  retain their ownership and validation rules.
- The `/admin/loans` panel reuses `GET /api/loans` for listing and
  `PATCH /api/loans/:id` with `{ "lender_id" }` to reassign the lender; there
  are no new endpoints under `/api/admin`. The dropdown takes its options from
  `GET /api/users`, filtering accounts with the `lender` role.
- `lender`: its queries and mutations are filtered by
  `lender_id = req.user.stakeholder_id`. On creation, the service derives
  `lender_id` from the user: if the payload sends another value it returns
  `403`. In PATCH it cannot change `lender_id` either. If the user has no
  `stakeholder_id`, it returns `403`.
- A loan belonging to another lender returns `404` on any route with `:id`,
  even if the record exists; this does not reveal its existence.
- `loanScope(user)` is exported from `loanService` and reused by the `payments`
  module to apply the same ownership filter.
- The routes `/api/users`, `/api/roles`, and `/api/stakeholders` do not filter
  by role.

## Loan fields

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `loan_id` | integer | — | Auto-incrementing PK; in the URL it must be a positive integer. |
| `lender_id` | integer | yes | Positive integer; reference to `stakeholders.stakeholder_id`; must differ from `customer_id`. For `lender` it is derived from the JWT (403 if another is sent); `admin` can choose it. |
| `customer_id` | integer | yes | Positive integer; reference to `stakeholders.stakeholder_id`; must differ from `lender_id`. |
| `loan_amount` | number/decimal | yes | Finite number greater than 0 and up to `9999999999.99`; at most 2 decimals; accepts numeric strings. |
| `interest_rate` | number/decimal | no | Finite number between 0 and `999.9999`; `""`/`null` is stored as `null`. |
| `interest_payment_mode` | enum | yes | `included` or `separate`. |
| `disbursed_at` | datetime | yes | Must include a time. Accepts ISO 8601 (`YYYY-MM-DDTHH:mm[:ss[.sss]]` with optional `Z` or offset) or `YYYY-MM-DD HH:mm[:ss]`; the date must be valid. Without a zone it is interpreted in the server's local time zone and the response is normalized to ISO UTC. |

`interest_amount` and `total_to_pay` are read-only virtual fields calculated and
returned by the API:

```text
interest_amount = round(loan_amount * interest_rate / 100, 2)
total_to_pay    = loan_amount + interest_amount
```

If `interest_rate` is `null`, interest is 0.

## Payload relationships

In addition to the loan fields, `POST` and `PUT` require these non-empty arrays:

### `installments[]`

| Field | Rules |
| --- | --- |
| `installment_number` | Positive integer, unique and consecutive starting at 1; the server sorts by this value. |
| `amount_due` | Number greater than 0, up to `9999999999.99`, with at most 2 decimals. |
| `due_date` | `YYYY-MM-DD`, a valid date, unique and strictly increasing by `installment_number`. |

Amounts must be equal to each other except for the last installment. The sum
must match exactly:

- `included`: `loan_amount + interest_amount` (interest included in the
  installments).
- `separate`: `loan_amount` (interest is recorded separately).

`interest_payment_mode = separate` requires `interest_rate > 0`.

### `guarantors[]`

Each entry must contain **either** `stakeholder_id` **or** the fields of a new
stakeholder, but not both:

- `stakeholder_id`: positive integer of an existing stakeholder.
- Inline: `first_name` and `last_name` are required; `national_id`,
  `marital_status`, `occupation`, and `date_of_birth` follow the rules of the
  `stakeholders` module.

Repeating the same stakeholder is not allowed. Inline stakeholders are created
within the same transaction and remain in the database if the loan is later
deleted. A duplicate `national_id` returns `409`.

### `collaterals[]`

| Field | Rules |
| --- | --- |
| `description` | Required text, `trim`, max 65535 characters. |
| `estimated_value` | Optional; number greater than or equal to 0, up to `9999999999.99`, with at most 2 decimals. |

## Endpoint behavior

- `GET /`: returns all loans sorted by `loan_id` descending (`200`). Each loan
  includes `lender` and `customer` (`stakeholder_id`, `first_name`,
  `last_name`), `installments` sorted by `installment_number`, `guarantors` with
  their `guarantor`, `collaterals`, and `interestPayment` (with its `payment`
  when paid). If the loan has no separate interest, `interestPayment` is `null`.
- `GET /:id`: returns the loan with the same relationships or `404` if it does
  not exist.
- `POST /`: creates the loan, its installments, guarantors, collateral, and the
  pending interest obligation when applicable (`201`). Returns the loan with
  all its relationships. `lender_id` is taken from the authenticated user for
  `lender` accounts; sending another value returns `403`. If `customer_id` does
  not exist, if a `guarantor.stakeholder_id` does not exist, or if an inline
  `national_id` already exists, it returns `409`. If the lender and customer are
  the same person it returns `400`.
- `PUT /:id`: full replacement (`200`). Requires the loan fields and the
  `installments`, `guarantors`, and `collaterals` arrays; replaces all
  relationships. If the loan has any installment payment or paid interest it
  returns `409` and changes nothing.
- `PATCH /:id`: partial update (`200`). Changes only the fields and arrays
  sent; an empty body returns `400`. Sent arrays replace their entire
  relationship. If `loan_amount`, `interest_rate`, or
  `interest_payment_mode` changes, `installments` is required to recalculate
  and validate the schedule. If the loan has installment payments or paid
  interest, only `guarantors` and `collaterals` are allowed for any user, and
  `lender_id` additionally for `admin`; any other field or array (including
  `customer_id`, `disbursed_at`, financial fields, `installments`, and
  `lender_id` from a `lender`) returns `409` with
  `A loan with payments can only update ...`. Disallowed fields are rejected
  even if sent with the same stored value.
- `DELETE /:id`: deletes the loan (`204`, no body). If it has installment
  payments or paid interest it returns `409`. Otherwise it first deletes the
  pending interest obligation, guarantor links, collateral, installments, and
  finally the loan. Inline stakeholders are not deleted.

### Included and separate interest

- `included`: installments add up to principal + interest and there is no row
  in `loan_interest_payments`.
- `separate`: installments add up to principal and there is exactly one row in
  `loan_interest_payments` with `payment_id = null` and `status = "pending"`.
- When changing from `separate` to `included`, the pending obligation is
  deleted. When changing from `included` to `separate`, a new pending obligation
  is created.
- An obligation with `status = "paid"` blocks financial changes and deletion
  of the loan; partial editing of guarantors, collateral, and, for `admin`, the
  lender remains available under the `PATCH` rule.

Unknown fields are ignored. A non-numeric `:id` or one less than or equal to
zero returns `400`.

## Errors

- `400` required fields, invalid format/value, inconsistent installments,
  lender same as customer, or invalid `:id`.
- `401` token missing or invalid (applied by `checkAuth`).
- `403` lender not linked, `lender_id` different from the `lender` user's in
  any mutation (`Only admins can change the lender` when detected by the
  guard), or an attempt to change it in PATCH.
- `404` loan nonexistent or belonging to another lender.
- `409` invalid reference, duplicate inline `national_id` (message
  `A stakeholder with that national ID already exists`), duplicate guarantor
  (a `stakeholder_id` and an inline stakeholder resolving to the same record),
  installment payments, paid interest, disallowed field in `PATCH` with
  payments, or a uniqueness conflict on creation/replacement.
- `500` unexpected error.

## Files

- `src/server/routes/loanRoutes.js` (mounted on `/api/loans`)
- `src/server/middlewares/requireAdminForLenderChange.js`
- `src/server/controllers/loanController.js`
- `src/server/services/loanService.js`
- `src/server/utils/validators/loanValidation.js`
- `src/server/utils/validators/stakeholderValidation.js` (inline guarantors)
- `src/server/models/Loan.js`
- `src/server/models/LoanInstallment.js`
- `src/server/models/LoanGuarantor.js`
- `src/server/models/LoanCollateral.js`
- `src/server/models/LoanInterestPayment.js`
- `database/migrations/2026-11-16-loan-interest-payment-mode.sql`
- `database/migrations/2026-11-17-rename-operator-role-to-lender.sql`
