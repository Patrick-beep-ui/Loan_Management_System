# Changelog — models

## 2026-11-17 — Índice único de `national_id` declarado en `Stakeholder`

- Change: `Stakeholder.js` declara `uq_stakeholders_national_id` como índice
  único sobre `national_id`, con el mismo nombre que la restricción existente
  en MySQL.
- Impact: el modelo refleja la restricción existente. Como Sequelize informa la
  violación con el nombre del índice, el service reconoce también ese nombre
  para distinguir el conflicto de otros registros relacionados duplicados. No
  hay cambios de esquema ni de `sequelize.sync()`.
- Verification: una violación duplicada responde
  `409 A stakeholder with that national ID already exists` y la transacción se
  revierte sin dejar préstamos almacenados.

## 2026-11-16 — Modo de interés y obligación pendiente por préstamo

- Change: `Loan` agregó `interest_payment_mode` y los virtuales
  `interest_amount`/`total_to_pay`; `LoanInterestPayment` ahora tiene
  `payment_id` nullable, `loan_id` único y `status` (`pending`/`paid`).
  `associations.js` expone `guarantors`, `collaterals` e `interestPayment`
  (`hasOne`). La migración
  `database/migrations/2026-11-16-loan-interest-payment-mode.sql` aplica los
  cambios de columnas, el índice único y la restricción de estado.
- Impact: las consultas de préstamos incluyen una sola obligación de interés;
  `included` no tiene fila y `separate` usa una fila pendiente con
  `payment_id = null`. Los totales se calculan desde `loan_amount` e
  `interest_rate`, sin almacenarse.
- Verification: importación de modelos/asociaciones sin errores; préstamo de
  `1000` al 20% devolvió `interest_amount = 200` y `total_to_pay = 1200`;
  migración aplicada y verificada contra MySQL 8.4.3.

## 2026-11-13 — `date_of_birth` como `DATEONLY`

- Change: `Stakeholder.date_of_birth` pasó de `DataTypes.DATE` a
  `DataTypes.DATEONLY` para coincidir con la columna `date` de MySQL.
- Impact: Las fechas de nacimiento se leen y escriben como `YYYY-MM-DD`, sin
  componente de hora ni conversión de zona horaria.
- Verification: El CRUD de stakeholders devolvió `"1990-05-15"` tal como se
  envió.

## 2026-11-13 — Modelos de préstamos, cuotas, garantías y pagos

- Change: Se agregaron los modelos `Loan`, `LoanInstallment`, `LoanGuarantor`,
  `LoanCollateral`, `LoanPayment`, `InstallmentPayment` y `LoanInterestPayment`,
  y se registraron sus asociaciones en `associations.js` (incluyendo alias para
  las dos relaciones de `Loan` con `Stakeholder` y para la relación 1:1 de pagos).
- Impact: `associations.js` ahora carga las diez entidades del dominio; las
  consultas con `include` sobre préstamos, cuotas, garantías y pagos ya resuelven
  sus joins. No se modificaron rutas, controladores ni el esquema de la base.
- Verification: importación de `associations.js` sin errores; `Loan.findAll` con
  `lender`, `customer`, `installments`, `LoanGuarantors`, `LoanCollaterals` e
  `interestPayments`, y `LoanPayment.findAll` con `recordedBy`,
  `InstallmentPayment` y `LoanInterestPayment` ejecutaron correctamente contra
  MySQL 8.4.3.
