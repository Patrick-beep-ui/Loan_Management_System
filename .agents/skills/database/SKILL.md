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
do not use `sequelize.sync()`. The current migration,
`2026-11-16-loan-interest-payment-mode.sql`, adds `loans.interest_payment_mode`,
makes `loan_interest_payments.payment_id` nullable, adds `status`, adds the
unique key on `loan_id`, and adds `chk_loan_interest_payment_state`.

Run a migration with the same `mysql2` connection method described below, then
verify the affected columns, keys, and constraints with `information_schema`.
Keep existing data in mind: the migration that adds a `NOT NULL` column without
a default assumes the table is empty or that MySQL assigns the enum's first
value.

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
