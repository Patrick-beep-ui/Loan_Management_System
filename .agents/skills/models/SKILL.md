---
name: models
description: Documentation for the data models module: Sequelize entities, associations, constraints, and related business rules.
---

# models

Sequelize models that map the MySQL tables of the loan domain. They all reside
in `src/server/models/`, connect via `src/server/config/connection.js`, and
declare their relationships in `src/server/models/associations.js`.

The changelog for this module is in [`CHANGELOG.md`](CHANGELOG.md).

## Models

| File | Table | Purpose |
| --- | --- | --- |
| `Stakeholder.js` | `stakeholders` | People involved in loans. |
| `User.js` | `users` | Access accounts linked to a stakeholder and a role. |
| `Role.js` | `roles` | Access roles (`admin`, `lender`). |
| `Loan.js` | `loans` | Loan with lender, customer, amount, rate, interest mode, and disbursement date. |
| `LoanInstallment.js` | `loan_installments` | Loan installments with amount, due date, rate, and status. |
| `LoanGuarantor.js` | `loan_guarantors` | Guarantors associated with a loan. |
| `LoanCollateral.js` | `loan_collaterals` | Collateral for a loan. |
| `LoanPayment.js` | `loan_payments` | Payments received and the user who recorded them. |
| `InstallmentPayment.js` | `installment_payments` | Application of a payment to an installment. |
| `LoanInterestPayment.js` | `loan_interest_payments` | Ordinary interest obligation per loan, pending or paid. |

## Associations

- `User` belongs to `Stakeholder` and `Role`; both have many `User`s.
- `Loan` belongs to `Stakeholder` twice, with aliases `lender` and `customer`;
  `Stakeholder` exposes `loansAsLender` and `loansAsCustomer`.
- `Loan` has many `LoanInstallment`s (alias `installments`), `LoanGuarantor`s
  (alias `guarantors`), and `LoanCollateral`s (alias `collaterals`); it has one
  `LoanInterestPayment` (alias `interestPayment`).
- `LoanGuarantor` belongs to `Stakeholder` with alias `guarantor`; `Stakeholder`
  exposes `guarantorLinks`.
- `LoanPayment` belongs to `User` with alias `recordedBy`; `User` exposes
  `payments`.
- `LoanPayment` has one `InstallmentPayment` and one `LoanInterestPayment` (1:1
  relationship, because `payment_id` is unique in both tables).
- `LoanInstallment` has many `InstallmentPayment`s.

## Rules and constraints

- `Loan.interest_payment_mode` is a required enum `included`/`separate`.
- `Loan.interest_amount` and `Loan.total_to_pay` are calculated virtual fields:
  `interest_amount = round(loan_amount * interest_rate / 100, 2)` and
  `total_to_pay = loan_amount + interest_amount`. They are not stored.
- `payment_id` is unique in `installment_payments` and `loan_interest_payments`:
  each payment is applied to at most one installment or one interest, which is
  why it is modeled with `hasOne`.
- `loan_interest_payments` has a unique index on `loan_id`: each loan has at most
  one interest obligation. `payment_id` is nullable and `status` is the enum
  `pending`/`paid` with a default value of `pending`.
- The constraint `chk_loan_interest_payment_state` requires
  `(status = 'pending' AND payment_id IS NULL)` or
  `(status = 'paid' AND payment_id IS NOT NULL)`.
- The database does not enforce exclusivity between the two application tables;
  ensuring that a payment is not applied to both an installment and an interest
  at the same time must be validated in the business layer.
- `loan_installments` has a unique index `(loan_id, installment_number)`.
- `loan_guarantors` has a unique index `(loan_id, guarantor_stakeholder_id)`.
- `stakeholders.national_id` has the unique index `uq_stakeholders_national_id`
  in MySQL and `Stakeholder.js` declares it with that name to reflect the
  constraint. Sequelize reports the violation with the index name, so the
  service recognizes both the field and the index name to respond `409` with a
  specific message.
- `Stakeholder.date_of_birth` uses `DataTypes.DATEONLY` to match MySQL's `date`
  column and avoid timezone shifts.
- `Loan.disbursed_at` uses `DataTypes.DATE` to match the `datetime` column; the
  API serializes it as UTC ISO.
- `users.is_active` is a non-null boolean with a default value of `true`.
  `checkAuth` checks it on every request, so deactivating an account invalidates
  its existing tokens without depending on JWT expiration.
- Models neither create nor alter the schema and do not use `sequelize.sync()`.
  Schema changes are applied manually from `database/migrations/`.
