# Changelog — models

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
