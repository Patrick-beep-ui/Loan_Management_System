---
name: database
description: Connect to the project's MySQL database to inspect schema or run queries using the credentials in .env.
---

# Database access

Use this skill when you need to inspect the database schema, check data, or
run queries. Connection settings come from `.env` in the repository root.

## Prerequisites

- `.env` contains `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Dependencies installed (`pnpm install`), so `mysql2` is available.

## Schema migrations

Schema changes are applied manually from `database/migrations/*.sql`; the models
do not use `sequelize.sync()`. The initial schema is
`2026-11-11-loan-managament-system-inital-model.sql`. Three ordered key-upgrade
migrations follow it: `2026-11-12-installment-payment-surrogate-key.sql`,
`2026-11-13-loan-guarantor-surrogate-key.sql`, and
`2026-11-14-loan-interest-payment-surrogate-key.sql`. They replace the original
join-table primary keys with the surrogate keys used by the Sequelize models
while retaining the required unique foreign-key constraints.
`2026-11-16-loan-interest-payment-mode.sql` adds
`loans.interest_payment_mode`, makes `loan_interest_payments.payment_id`
nullable, adds `status`, adds the unique key on `loan_id`, and adds
`chk_loan_interest_payment_state`.
`2026-11-17-rename-operator-role-to-lender.sql` renames the `operator` role to
`lender` in place, preserving `role_id` and therefore existing user assignments.
`2026-11-25-admin-user-management.sql` adds `users.is_active` as a non-null
boolean defaulting to `TRUE`; `checkAuth` reads it on every authenticated
request.
`2026-11-26-user-provisioning.sql` adds `users.must_change_password` as a non-null
boolean defaulting to `FALSE`; accounts created by an admin are inserted with
`TRUE` and must change their password before using the rest of the API.

## Seeding the first admin

With public signup removed, `database/seeds/createFirstAdmin.js` creates the
first `admin` account from `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
`ADMIN_STAKEHOLDER_ID`. Run it with `pnpm seed:admin` after applying the
migrations. It refuses to run when an admin already exists and marks the new
account with `must_change_password = TRUE`.

Run a migration with the same `mysql2` connection method described below, then
verify the affected columns, keys, and constraints with `information_schema`.
Keep existing data in mind: the migration that adds a `NOT NULL` column without
a default assumes the table is empty or that MySQL assigns the enum's first
value.

For a fresh database, apply every migration in chronological order. Existing
current databases must not rerun the three key-upgrade migrations; inspect the
expected schema through `information_schema` instead. The exact order and key
expectations are in [`database/migrations/README.md`](../../../database/migrations/README.md).

## Connection method

The server runs MySQL 8, which uses `caching_sha2_password`. Do **not** use
`C:\xampp\mysql\bin\mysql.exe`; that client lacks the plugin and fails with
"Plugin caching_sha2_password could not be loaded". Use the project's
`mysql2` driver instead.

### Running an ad-hoc query (PowerShell)

Pipe a here-string to `node` so PowerShell does not strip the quotes from the
inline script. Run it with the repository root as the working directory so
`.env` resolves.

```powershell
@'
const mysql = require("mysql2/promise");
(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await c.query("SELECT 1 AS ok");
  console.log(rows);
  await c.end();
})().catch((e) => { console.error("ERR", e.code, e.message); process.exit(1); });
'@ | node --env-file=.env --input-type=commonjs
```

### Schema quick-check

```sql
SHOW TABLES;
SELECT VERSION();
```

Inspect columns with `information_schema.COLUMNS` and foreign keys with
`information_schema.KEY_COLUMN_USAGE`, filtered by `TABLE_SCHEMA` =
`DB_NAME` and `TABLE_NAME` as needed. Example:

```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
ORDER BY ORDINAL_POSITION;
```

## Safety

- Default to read-only queries (`SELECT`, `SHOW`, `information_schema`).
- Confirm with the user before any `INSERT`, `UPDATE`, `DELETE`, `ALTER`,
  `DROP`, or other write, and never run destructive statements unprompted.
- Never print `DB_PASSWORD` or `JWT_SECRET`.
