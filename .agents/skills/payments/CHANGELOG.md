# Changelog — payments

### 2026-11-23 — Relación con edición parcial de préstamos

- Change: se documentó que, con pagos registrados, `PATCH /api/loans/:id` sigue
  permitiendo fiadores, garantías y, para `admin`, el prestamista. La reversión
  de pagos restaura la edición financiera completa y la eliminación.
- Impact: no cambia el contrato de `/api/payments`; aclara cuándo el detalle
  muestra el formulario reducido frente al completo. El detalle está en
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-23 — Reversión expuesta en el cliente

- Change: La interfaz del detalle consume `GET /api/payments?loan_id=...` y
  `DELETE /api/payments/:id` mediante hooks propios, separados del registro de
  pagos. El borrado sigue siendo la reversión transaccional ya implementada.
- Impact: Los pagos de cuota e interés se pueden revertir desde `/loans/:id` con
   confirmación; la vista recarga el préstamo y el historial, habilita la
   eliminación y restaura la edición financiera completa. El flujo está en
   [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-18 — Corrección y reversión de pagos

- Change: Se agregaron `PATCH /api/payments/:id` (solo `paid_at`) y
  `DELETE /api/payments/:id`. El borrado revierte el pago en una transacción:
  elimina el vínculo de cuota o nulifica el de interés, restaura el destino a
  `pending` y elimina el registro en `loan_payments`.
- Impact: Los pagos siguen siendo inmutables en monto, destino y `recorded_by`;
  solo se puede corregir la fecha. Tras una reversión el préstamo vuelve a aceptar
  cambios financieros y eliminación porque ya no tiene pagos.
- Verification: prueba de servicio sobre MySQL sin `node --check`: pago de cuota e
  interés separado, `PATCH` de `paid_at` en ambos, `PATCH` sin `paid_at` → `400`,
  `DELETE` de ambos → `404` en el detalle, cuota/interés en `pending`,
  `payment_id` nulo y préstamo temporal eliminado. Datos preexistentes no
  modificados.

## 2026-11-18 — Endpoints separados para cuota e interés

- Change: Se reemplazó el `POST /api/payments` genérico por
  `POST /api/payments/installment` y `POST /api/payments/interest`. El validador
  expone un builder por destino y el service exporta dos funciones explícitas que
  comparten una única transacción; se eliminó el despacho por payload.
- Impact: La ruta declara qué se está pagando, así que no hay ambigüedad por los
  campos `installment_id`/`loan_interest_payment_id`. El campo del otro destino se
  ignora. `recorded_by` sigue derivándose del JWT y se devuelve en la respuesta.
- Verification: la misma prueba ejecutó `createInstallmentPayment` y
  `createInterestPayment` desde cero, comprobando `recorded_by: 16`, `paid_at`
  provisto y los vínculos de cuota e interés.

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
