# Changelog — models

## 2026-11-26 — `must_change_password` flag on `User`

- Change: `User.js` declares `must_change_password` as a non-null boolean with
  a default value of `false`, matching
  `database/migrations/2026-11-26-user-provisioning.sql`.
- Impact: admin-created accounts start with the flag set; `checkAuth` reads it
  from the database and the password-change flow clears it. Models still do not
  use `sequelize.sync()`.
- Verification: syntax checks and diff review; the migration was not applied in
  this session.

## 2026-11-25 — `is_active` flag on `User`

- Change: `User.js` declares `is_active` as a non-null boolean with a default
  value of `true`, reflecting the column added by
  `database/migrations/2026-11-25-admin-user-management.sql`.
- Impact: `checkAuth` and `login` can reject inactive accounts. The schema is
  applied manually; models still do not use `sequelize.sync()`.
- Verification: `pnpm build` and diff review; the migration was not applied in
  this session.

## 2026-11-17 — `admin` and `lender` roles

- Change: it is documented that `roles` contains `admin` and `lender` after
  renaming `operator` with
  `database/migrations/2026-11-17-rename-operator-role-to-lender.sql`.
- Impact: the `Role` model does not change; the change is to data and affects
  signup, which resolves the `lender` role by name.
- Verification: a query to `roles` in MySQL returned `(1, admin), (2, lender)`.

## 2026-11-17 — Unique index on `national_id` declared in `Stakeholder`

- Change: `Stakeholder.js` declares `uq_stakeholders_national_id` as a unique
  index on `national_id`, with the same name as the existing constraint in MySQL.
- Impact: the model reflects the existing constraint. Since Sequelize reports
  the violation with the index name, the service also recognizes that name to
  distinguish the conflict from other duplicate related records. There are no
  schema changes or changes to `sequelize.sync()`.
- Verification: a duplicate violation responds
  `409 A stakeholder with that national ID already exists` and the transaction
  is rolled back without leaving stored loans.

## 2026-11-16 — Interest mode and pending obligation per loan

- Change: `Loan` added `interest_payment_mode` and the virtuals
  `interest_amount`/`total_to_pay`; `LoanInterestPayment` now has nullable
  `payment_id`, unique `loan_id`, and `status` (`pending`/`paid`).
  `associations.js` exposes `guarantors`, `collaterals`, and `interestPayment`
  (`hasOne`). The migration
  `database/migrations/2026-11-16-loan-interest-payment-mode.sql` applies the
  column changes, the unique index, and the status constraint.
- Impact: loan queries include a single interest obligation; `included` has no
  row and `separate` uses a pending row with `payment_id = null`. Totals are
  calculated from `loan_amount` and `interest_rate`, without being stored.
- Verification: models/associations imported without errors; a loan of `1000` at
  20% returned `interest_amount = 200` and `total_to_pay = 1200`; migration
  applied and verified against MySQL 8.4.3.

## 2026-11-13 — `date_of_birth` as `DATEONLY`

- Change: `Stakeholder.date_of_birth` changed from `DataTypes.DATE` to
  `DataTypes.DATEONLY` to match MySQL's `date` column.
- Impact: Birth dates are read and written as `YYYY-MM-DD`, with no time
  component or timezone conversion.
- Verification: Stakeholder CRUD returned `"1990-05-15"` as sent.

## 2026-11-13 — Models for loans, installments, collateral, and payments

- Change: The models `Loan`, `LoanInstallment`, `LoanGuarantor`,
  `LoanCollateral`, `LoanPayment`, `InstallmentPayment`, and
  `LoanInterestPayment` were added, and their associations were registered in
  `associations.js` (including aliases for the two `Loan` relationships with
  `Stakeholder` and for the 1:1 payment relationship).
- Impact: `associations.js` now loads the ten domain entities; queries with
  `include` over loans, installments, collateral, and payments now resolve their
  joins. Routes, controllers, and the database schema were not modified.
- Verification: `associations.js` imported without errors; `Loan.findAll` with
  `lender`, `customer`, `installments`, `LoanGuarantors`, `LoanCollaterals`, and
  `interestPayments`, and `LoanPayment.findAll` with `recordedBy`,
  `InstallmentPayment`, and `LoanInterestPayment` ran successfully against
  MySQL 8.4.3.
