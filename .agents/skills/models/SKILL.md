---
name: models
description: Documentation for the data models module: Sequelize entities, associations, constraints, and related business rules.
---

# models

Modelos Sequelize que mapean las tablas MySQL del dominio de préstamos. Todos
residen en `src/server/models/`, se conectan mediante `src/server/config/connection.js`
y declaran sus relaciones en `src/server/models/associations.js`.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Modelos

| Archivo | Tabla | Propósito |
| --- | --- | --- |
| `Stakeholder.js` | `stakeholders` | Personas que participan en préstamos. |
| `User.js` | `users` | Cuentas de acceso vinculadas a un stakeholder y un rol. |
| `Role.js` | `roles` | Roles de acceso (`admin`, `operator`). |
| `Loan.js` | `loans` | Préstamo con prestamista, cliente, monto, tasa y fecha de desembolso. |
| `LoanInstallment.js` | `loan_installments` | Cuotas del préstamo con monto, vencimiento, tasa y estado. |
| `LoanGuarantor.js` | `loan_guarantors` | Fiadores asociados a un préstamo. |
| `LoanCollateral.js` | `loan_collaterals` | Bienes en garantía de un préstamo. |
| `LoanPayment.js` | `loan_payments` | Pagos recibidos y usuario que los registró. |
| `InstallmentPayment.js` | `installment_payments` | Aplicación de un pago a una cuota. |
| `LoanInterestPayment.js` | `loan_interest_payments` | Aplicación de un pago al interés ordinario del préstamo. |

## Asociaciones

- `User` pertenece a `Stakeholder` y a `Role`; ambos tienen muchos `User`.
- `Loan` pertenece a `Stakeholder` dos veces, con alias `lender` y `customer`;
  `Stakeholder` expone `loansAsLender` y `loansAsCustomer`.
- `Loan` tiene muchas `LoanInstallment` (alias `installments`), `LoanGuarantor`,
  `LoanCollateral` y `LoanInterestPayment` (alias `interestPayments`).
- `LoanGuarantor` pertenece a `Stakeholder` con alias `guarantor`; `Stakeholder`
  expone `guarantorLinks`.
- `LoanPayment` pertenece a `User` con alias `recordedBy`; `User` expone `payments`.
- `LoanPayment` tiene una `InstallmentPayment` y una `LoanInterestPayment`
  (relación 1:1, porque `payment_id` es único en ambas tablas).
- `LoanInstallment` tiene muchas `InstallmentPayment`.

## Reglas y restricciones

- `payment_id` es único en `installment_payments` y en `loan_interest_payments`:
  cada pago se aplica a lo sumo a una cuota o a un interés, por eso se modela con
  `hasOne`.
- La base no impone exclusividad entre las dos tablas de aplicación; que un pago
  no se aplique a la vez a una cuota y a un interés debe validarse en la capa de
  negocio.
- `loan_installments` tiene índice único `(loan_id, installment_number)`.
- `loan_guarantors` tiene índice único `(loan_id, guarantor_stakeholder_id)`.
- `Stakeholder.date_of_birth` usa `DataTypes.DATEONLY` para coincidir con la
  columna `date` de MySQL y evitar desplazamientos de zona horaria.
- Los modelos no crean ni alteran el esquema: las tablas ya existen en MySQL y no
  se usa `sequelize.sync()` ni migraciones.
