# Changelog — payments

## 2026-11-18 — Endpoints separados para cuota e interés

- Change: Se reemplazó el `POST /api/payments` genérico por
  `POST /api/payments/installment` y `POST /api/payments/interest`. El validador
  expone un builder por destino y el service exporta dos funciones explícitas que
  comparten una única transacción; se eliminó el despacho por payload.
- Impact: La ruta declara qué se está pagando, así que no hay ambigüedad por los
  campos `installment_id`/`loan_interest_payment_id`. El campo del otro destino se
  ignora. `recorded_by` sigue derivándose del JWT y se devuelve en la respuesta.
- Verification: pendiente de ejecutar tras la refactorización.

## 2026-11-18 — Registro de pagos de cuotas e interés separado

- Change: Se agregó el módulo `payments` con validador, service transaccional,
  controller y rutas protegidas `GET /api/payments`, `GET /api/payments/:id` y
  `POST /api/payments`. El pago cubre el monto total de una cuota o de una
  obligación de interés separado, actualiza su estado y guarda `recorded_by` desde
  el JWT. `loanScope` se exportó desde `loanService` para reutilizar el filtro por
  prestamista.
- Impact: Los préstamos con pagos siguen bloqueados para cambios financieros y
  eliminación (`409`). Los listados de pagos respetan el scoping de `lender` y
  `admin` conserva acceso global.
- Verification: `node --check` en los archivos nuevos y modificados; prueba de
  servicio sobre MySQL con pago de cuota e interés, estados `paid`, vínculos
  `payment_id`, duplicados `409`, `loan_id` ajeno y bloqueo de `DELETE` (`409`),
  listados por lender/admin y detalle por id. Datos temporales eliminados; base
  en 0 préstamos y 0 pagos.
