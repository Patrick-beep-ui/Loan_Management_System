# Changelog — database

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
