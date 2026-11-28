# Migration Order

Schema migrations are applied manually with MySQL 8. Models never call
`sequelize.sync()`.

## Fresh database

Apply every `.sql` migration in chronological order:

1. `2026-11-11-loan-managament-system-inital-model.sql`
2. `2026-11-12-installment-payment-surrogate-key.sql`
3. `2026-11-13-loan-guarantor-surrogate-key.sql`
4. `2026-11-14-loan-interest-payment-surrogate-key.sql`
5. `2026-11-16-loan-interest-payment-mode.sql`
6. `2026-11-17-rename-operator-role-to-lender.sql`
7. `2026-11-25-admin-user-management.sql`
8. `2026-11-26-user-provisioning.sql`

The 2026-11-12 through 2026-11-14 migrations each use one MySQL 8 `ALTER
TABLE` statement. They upgrade the original join-table keys to the surrogate
keys used by the Sequelize models. The 2026-11-14 migration must run before
the 2026-11-16 migration, which makes `loan_interest_payments.payment_id`
nullable.

## Existing current database

Do not rerun the three key-upgrade migrations on a database that already has
the current schema. Verify the expected keys through `information_schema`
instead:

```sql
SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE,
       GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns_in_index
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'installment_payments',
    'loan_guarantors',
    'loan_interest_payments'
  )
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;
```

The current schema requires:

- `installment_payments.installment_payment_id` as the primary key and unique
  `payment_id`.
- `loan_guarantors.loan_guarantor_id` as the primary key and unique
  `(loan_id, guarantor_stakeholder_id)`.
- `loan_interest_payments.loan_interest_payment_id` as the primary key, unique
  `payment_id`, unique `loan_id`, and nullable `payment_id` for pending
  separate-interest obligations.
