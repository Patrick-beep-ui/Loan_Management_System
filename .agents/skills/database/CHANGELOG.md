# Changelog — database

## 2026-11-25 — Columna `is_active` en `users`

- Change: nueva migración
  `database/migrations/2026-11-25-admin-user-management.sql` que agrega
  `users.is_active BOOLEAN NOT NULL DEFAULT TRUE` después de `role_id`.
- Impact: las cuentas existentes quedan activas; la desactivación es una
  actualización de esta columna y `checkAuth` la verifica en cada petición.
- Verification: migración escrita y revisada; no se aplicó en esta sesión.

## 2026-11-17 — Renombrado de `operator` a `lender`

- Change: nueva migración
  `database/migrations/2026-11-17-rename-operator-role-to-lender.sql` que
  actualiza `roles.role_name` y `updated_at` donde el nombre es `operator`.
- Impact: el `role_id` no cambia, así que los usuarios asignados siguen válidos.
  El signup resuelve el rol `lender` por nombre desde esta tabla.
- Verification: migración aplicada con `mysql2`; `roles` devolvió
  `(1, admin), (2, lender)` y el usuario 16 conservó `role_id = 2`.

## 2026-11-16 — Migración de interés incluido/separado

- Change: Se documentó que los cambios de esquema se aplican manualmente desde
  `database/migrations/` y se registró la migración
  `2026-11-16-loan-interest-payment-mode.sql`, que agrega
  `loans.interest_payment_mode`, hace nullable
  `loan_interest_payments.payment_id`, agrega `status`, el índice único de
  `loan_id` y la restricción de estado.
- Impact: La base ahora distingue interés incluido en cuotas de una obligación
  pendiente por préstamo; el esquema sigue fuera de `sequelize.sync()`.
- Verification: Migración aplicada y verificada contra MySQL 8.4.3; los conteos
  de datos de prueba se restauraron.
