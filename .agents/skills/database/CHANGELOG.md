# Changelog — database

## 2026-11-14 — Canonical join-table key migrations

- Change: preserved the 2026-11-11 initial schema and added three ordered MySQL
  8 key-upgrade migrations for `installment_payments`, `loan_guarantors`, and
  `loan_interest_payments` before the interest-mode migration.
- Impact: a fresh database can reproduce the surrogate keys and unique
  constraints expected by the Sequelize models. Existing current databases must
  verify their keys through `information_schema` instead of rerunning them.
- Verification: migration SQL reviewed against the current MySQL schema and
  Sequelize models; not applied in this change.

## 2026-11-26 — Forced password change flag

- Change: new migration `database/migrations/2026-11-26-user-provisioning.sql`
  adds `users.must_change_password BOOLEAN NOT NULL DEFAULT FALSE` after
  `is_active`.
- Impact: existing accounts are unaffected; admin-created accounts are inserted
  with `TRUE` and `requirePasswordChanged` allows only `/api/users/auth` and
  `PATCH /api/users/me/password` until the password is changed.
- Verification: migration written and reviewed; not applied in this session.

## 2026-11-25 — Column `is_active` on `users`

- Change: new migration
  `database/migrations/2026-11-25-admin-user-management.sql` that adds
  `users.is_active BOOLEAN NOT NULL DEFAULT TRUE` after `role_id`.
- Impact: existing accounts remain active; deactivation is an update of this
  column and `checkAuth` verifies it on every request.
- Verification: migration written and reviewed; not applied in this session.

## 2026-11-17 — Renaming `operator` to `lender`

- Change: new migration
  `database/migrations/2026-11-17-rename-operator-role-to-lender.sql` that
  updates `roles.role_name` and `updated_at` where the name is `operator`.
- Impact: `role_id` does not change, so assigned users remain valid. Signup
  resolves the `lender` role by name from this table.
- Verification: migration applied with `mysql2`; `roles` returned
  `(1, admin), (2, lender)` and user 16 retained `role_id = 2`.

## 2026-11-16 — Included/separate interest migration

- Change: It was documented that schema changes are applied manually from
  `database/migrations/`, and the migration
  `2026-11-16-loan-interest-payment-mode.sql` was recorded; it adds
  `loans.interest_payment_mode`, makes `loan_interest_payments.payment_id`
  nullable, and adds `status`, the unique index on `loan_id`, and the status
  constraint.
- Impact: The database now distinguishes interest included in installments from
  a pending obligation per loan; the schema remains outside `sequelize.sync()`.
- Verification: Migration applied and verified against MySQL 8.4.3; the test
  data counts were restored.
