---
name: payments
description: Payment recording for loan installments and separate ordinary interest, with lender-scoped reads and status updates.
---

# payments

Recording of payments applied to an installment (`installment_payments`) or to
the obligation for separately charged ordinary interest
(`loan_interest_payments`). Each payment is created in `loan_payments` with its
amount, date, and the authenticated user who records it. The operation is
transactional and updates the status of the target in the same transaction.

The change history of this module is in [`CHANGELOG.md`](CHANGELOG.md).

## Validation

All input validation lives in
`src/server/utils/validators/paymentValidation.js`. The service receives the
already-normalized attributes and only performs persistence and status
conflicts.

| Field | Rules |
| --- | --- |
| `loan_id` | Required positive integer; the loan must exist and belong to the authenticated lender (`admin` sees all). |
| `amount` | Required finite number in `(0, 9999999999.99]`, with at most 2 decimals; it must be exactly equal to the target's pending amount. Partial payments are not allowed. |
| `paid_at` | In `POST` it is optional: ISO 8601 with time and zone (`Z` or offset); if omitted, the server's current time is used and the response is in UTC. In `PATCH /api/payments/:id` it is required and is the only editable field. |
| `installment_id` | Required positive integer in `POST /api/payments/installment`. |
| `loan_interest_payment_id` | Required positive integer in `POST /api/payments/interest`. |

Each endpoint requires its own target identifier. The field for the other
target is ignored, so there is no ambiguous payload-based dispatch. An `amount`
different from the pending amount returns `400`.

## Endpoints

All routes require `Authorization: Bearer <token>`.

| Method | Route | Controller | Service | Access |
| --- | --- | --- | --- | --- |
| `GET` | `/api/payments` | `paymentController.getAllPayments` | `paymentService.getAllPayments` | own lender / admin |
| `GET` | `/api/payments/:id` | `paymentController.getPaymentById` | `paymentService.getPaymentById` | own lender / admin |
| `POST` | `/api/payments/installment` | `paymentController.createInstallmentPayment` | `paymentService.createInstallmentPayment` | own lender / admin |
| `POST` | `/api/payments/interest` | `paymentController.createInterestPayment` | `paymentService.createInterestPayment` | own lender / admin |
| `PATCH` | `/api/payments/:id` | `paymentController.updatePayment` | `paymentService.updatePayment` | own lender / admin |
| `DELETE` | `/api/payments/:id` | `paymentController.deletePayment` | `paymentService.deletePayment` | own lender / admin |

There is no generic `POST /api/payments`.

### `POST /api/payments/installment`

Body for paying an installment:

```json
{
  "loan_id": 35,
  "installment_id": 161,
  "amount": 200,
  "paid_at": "2026-02-15T10:30:00Z"
}
```

### `POST /api/payments/interest`

Body for paying the separate interest:

```json
{
  "loan_id": 35,
  "loan_interest_payment_id": 17,
  "amount": 200
}
```

- In `/installment`, the installment must belong to the given `loan_id`. If it
  already has an `InstallmentPayment` or its `status` is `paid`, it returns
  `409`.
- In `/interest`, the obligation must belong to the loan and the loan must have
  `interest_payment_mode = "separate"`. If it is already paid, it returns `409`.
- The expected amount of an installment is `amount_due`; for interest it is the
  virtual field `Loan.interest_amount` (`round(loan_amount * interest_rate / 100, 2)`).
- `recorded_by` is taken from `req.user.user_id`. The body need not send it and
  any value sent is ignored; it cannot impersonate the authenticated user.
- The response (`201`) includes `recorded_by` and `recordedBy` (`user_id`,
  `email`) along with `InstallmentPayment` and its `LoanInstallment`, or
  `LoanInterestPayment` and its `Loan`.

### `GET /api/payments`

Returns payments for loans visible to the user, sorted by `paid_at` descending
and then `payment_id` descending. The optional query param `loan_id` filters by
a loan; if the loan belongs to another lender, it returns `404`.

### `GET /api/payments/:id`

Returns a payment with the same relationships as the `POST`s, or `404` if it
does not exist, has no recognized application, or belongs to another lender.

### `PATCH /api/payments/:id`

Corrects only `paid_at` on the `loan_payments` record:

```json
{
  "paid_at": "2026-02-16T09:15:00Z"
}
```

An empty body or one without `paid_at` returns `400`. `amount`, `recorded_by`,
the loan, and the target are immutable; to correct them the payment must be
deleted and recorded again. The response (`200`) includes the same relationships
as `GET /:id`.

### `DELETE /api/payments/:id`

Reverses the payment in a single transaction and returns `204` with no body:

- Installment payment: deletes the link in `installment_payments` and leaves the
  installment at `status = "pending"`.
- Interest payment: sets `payment_id = null` and `status = "pending"` in
  `loan_interest_payments`, and deletes the record in `loan_payments`.

A nonexistent payment or one belonging to another lender returns `404`. The
reversal deletes the record in `loan_payments` in both cases, so the loan again
accepts financial changes and deletion.

## Client

The loan detail view exposes reversal as an operation independent of payment
recording. `usePayments` queries `GET /api/payments?loan_id=...`,
`paymentHistory.js` associates each `payment_id` with its installment or
interest, and `usePaymentRevert` sends `DELETE /api/payments/:id` without
sending `loan_id` or the target. `RevertPaymentDialog` confirms the action
before deleting the record. After the `204`, the view reloads the loan and the
history: `Delete` becomes available again and `Edit` switches from the reduced
form to the full form.

### Lender payments page

`/payments` is a read-only history for `lender` accounts. `RequireLender` sends
admins to `/admin/payments`, and `usePaymentsOverview` calls `GET /api/payments`
without `loan_id`, so the existing `loanScope` limits the result to loans owned
by the authenticated lender. `PaymentsHeader`, `PaymentsTable`, and `PaymentRow`
show the payment ID, linked loan, installment or interest target, amount, paid
date, recording user, and a total; the loans page links to the view. No API or
schema changes were needed.

### Admin panel

`/admin/payments` replaces the stub with `AdminPayments`, composed from
`src/components/admin/payments/` and `src/client/hooks/useAdminPayments.js`.
The hook queries `GET /api/payments` for the global `admin` history and
`GET /api/loans` to build the recording options: it only offers installments
with a `status` other than `paid` and pending separate interest without a
`payment_id`. `Record payment` uses `buildPaymentPayload` and posts to
`POST /api/payments/installment` or `POST /api/payments/interest`, with optional
`paid_at`; the amount is derived from the target and is not editable. Reversal
reuses `usePaymentRevert` and `RevertPaymentDialog` with
`DELETE /api/payments/:id`; after recording or reversing, payments and loans are
reloaded. `PATCH /api/payments/:id` was not added to the panel, nor were
endpoints under `/api/admin`.

## Permissions and ownership

`paymentService` reuses `loanScope` from `loanService`: a `lender`'s loans are
filtered by `lender_id = req.user.stakeholder_id`, while `admin` retains global
access. A `lender` user without a `stakeholder_id` returns `403`.

## Relationship with `loans`

The existence of payments blocks financial changes, replacement, and deletion
of the loan with `409` (rule implemented in `loanService`).
`PATCH /api/loans/:id` still allows only `guarantors` and `collaterals`, plus
`lender_id` for `admin`, when payments are recorded. Paying an installment
changes its `status` to `paid`; paying interest changes its `status` to `paid`
and assigns a `payment_id`, satisfying the constraint
`chk_loan_interest_payment_state`. `DELETE /api/payments/:id` reverses these
changes and restores both targets to `pending`.

## Errors

- `400` invalid data, target identifier missing on the corresponding endpoint,
  `paid_at` missing in `PATCH`, or amount different from the pending amount.
- `401` token missing or invalid (applied by `checkAuth`).
- `403` `lender` user without a linked stakeholder.
- `404` loan, installment, interest obligation, or payment that does not exist
  or belongs to another lender.
- `409` installment or interest already paid, incompatible interest mode, or
  uniqueness/foreign key conflict when persisting.
- `500` unexpected error.

## Files

- `src/server/routes/paymentRoutes.js` (mounted on `/api/payments`)
- `src/server/controllers/paymentController.js`
- `src/server/services/paymentService.js`
- `src/server/utils/validators/paymentValidation.js`
- `src/server/services/loanService.js` (shared `loanScope`)
- `src/server/models/LoanPayment.js`
- `src/server/models/InstallmentPayment.js`
- `src/server/models/LoanInterestPayment.js`
- `src/client/views/Payments.jsx`
- `src/client/hooks/usePaymentsOverview.js`
- `src/components/payments/PaymentsHeader.jsx`
- `src/components/payments/PaymentsTable.jsx`
- `src/components/payments/PaymentRow.jsx`
- `src/client/views/admin/AdminPayments.jsx`
- `src/client/hooks/useAdminPayments.js`
- `src/components/admin/payments/`
