# Changelog — loans

## 2026-11-16 — Préstamos con cuotas, fiadores, garantías e interés incluido/separado

- Change: `loanValidation.js` y `loanService.js` se rediseñaron para que `POST` y
  `PUT` reciban `installments`, `guarantors` y `collaterals` anidados y los
  persistan en una transacción. Se agregó `interest_payment_mode`
  (`included`/`separate`), el cálculo virtual de `interest_amount` y
  `total_to_pay`, y una obligación pendiente en `loan_interest_payments` para el
  interés separado. Se agregó la migración
  `database/migrations/2026-11-16-loan-interest-payment-mode.sql`.
- Impact: `POST`/`PUT` exigen los tres arreglos y validan numeración, fechas,
  montos iguales salvo la última cuota y totales. `PATCH` reemplaza solo los
  arreglos enviados y exige `installments` cuando cambian campos financieros.
  Las respuestas incluyen cuotas ordenadas, fiadores, garantías, interés y los
  campos calculados. Los pagos de cuotas o el interés pagado bloquean cambios y
  eliminación con `409`. `DELETE` elimina las relaciones del préstamo, pero
  conserva los stakeholders creados inline.
- Verification: casos de validación inválidos y redondeo de cuotas; prueba de
  servicio con creación/lectura/reemplazo/actualización/eliminación y bloqueos
  `409`; rollback por `national_id` duplicado; prueba HTTP de `POST`, `GET`,
  `PATCH` y `DELETE`; modelo con `interest_amount = 200` y `total_to_pay = 1200`
  para `1000` al 20%. Conteos de la base restaurados.

## 2026-11-16 — Validación estricta de fecha, montos y prestatario/cliente

- Change: `loanValidation.js` se movió a `src/server/utils/validators/`. `disbursed_at` ahora exige hora y acepta ISO 8601 (con `Z`/offset opcional) o formato MySQL; sin zona se interpreta en la hora local del servidor, se valida que la fecha exista y se normaliza a ISO UTC. `loan_amount` queda en `(0, 9999999999.99]` e `interest_rate` en `[0, 999.9999]`, aceptando strings numéricos. Se agregó `assertDistinctStakeholders`, aplicado en creación, reemplazo y actualización parcial (considerando los valores ya guardados).
- Impact: `POST /api/loans` y `PUT /api/loans/:id` responden `400` si `lender_id === customer_id`; `PATCH` hace lo mismo cuando el cambio produce esa igualdad. Fechas sin hora o imposibles y montos/tasas fuera de rango responden `400`. `disbursed_at` sigue siendo `DataTypes.DATE` y se responde en ISO UTC.
- Verification: Pruebas de runtime con token: fecha ausente/solo fecha/imposible/no-string → `400`; ISO `Z`, MySQL y offset `+02:00` → `201` con instantes correctos; monto `0`, sobre el máximo, no numérico y booleano → `400`; tasa fuera de rango/no numérica → `400`; misma persona en POST/PUT/PATCH → `400`; referencia inexistente → `409`; `PUT`/`PATCH`/listado/detalle/`404`/id inválido/`DELETE` verificados. Datos temporales eliminados y conteos restaurados.

## 2026-11-16 — CRUD inicial de préstamos

- Change: Se agregó el CRUD de `loans` en `loanRoutes` → `loanController` → `loanService`, con validación y parseo de entrada en `src/server/utils/loanValidation.js`. Incluye listado/detalle con `lender` y `customer`, creación, reemplazo (`PUT`), actualización parcial (`PATCH`) y eliminación (`DELETE`).
- Impact: Nuevas rutas protegidas por `checkAuth` bajo `/api/loans`. Validaciones de entrada responden `400`; préstamos inexistentes `404`; referencias inválidas o registros referenciados al eliminar responden `409`.
- Verification: `node --check` en `src/server/api.js`, `src/server/routes/loanRoutes.js`, `src/server/controllers/loanController.js`, `src/server/services/loanService.js` y `src/server/utils/loanValidation.js` (sin errores). No se ejecutaron pruebas funcionales de endpoints en esta sesión.