# Changelog — loans

### 2026-11-23 — Edición parcial de préstamos con pagos

- Change: `updateLoan` ahora consulta si existen pagos y aplica una lista blanca:
  con pagos solo acepta `guarantors` y `collaterals`, y `lender_id`
  adicionalmente para `admin`. `assertNoPayments` se dividió en
  `findLoanPaymentConflicts`, `loanHasPayments` y `assertNoPayments`, por lo que
  `PUT` y `DELETE` siguen bloqueados con `409`. Cualquier otro campo en `PATCH`
  con pagos responde `409` aunque repita el valor almacenado.
- Impact: los préstamos pagados pueden actualizar fiadores, garantías y, solo
  administradores, el prestamista mediante `PATCH /api/loans/:id`. Los cambios
  financieros, de cliente, fecha de desembolso y calendario requieren revertir
  los pagos. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: no se ejecutaron pruebas de API; solo se revisó el código. El
  comportamiento en base de datos y los códigos `409`/`403` siguen sin
  verificación en tiempo de ejecución.

## 2026-11-18 — `loanScope` compartido con payments

- Change: `loanScope` se exportó desde `loanService` y los préstamos con pagos
  siguen bloqueando cambios financieros, reemplazo y eliminación con `409`. La
  documentación apunta al nuevo módulo `payments`.
- Impact: el registro de pagos actualiza estados de cuotas e interés sin duplicar
  la lógica de propiedad; el contrato de préstamos no cambia.
- Verification: pago de cuota e interés en préstamo temporal, `DELETE` posterior
  bloqueado con `409`, y limpieza manual de pagos para permitir la eliminación.

## 2026-11-17 — Préstamos restringidos al prestamista autenticado

- Change: los controllers pasan `req.user` a los seis services de préstamos.
  `loanService` filtra por `lender_id = req.user.stakeholder_id` para cuentas
  `lender`, deriva ese valor al crear y rechaza con `403` un `lender_id`
  distinto o un intento de cambiarlo en PATCH. `admin` conserva acceso global.
- Impact: un lender solo ve y modifica sus propios préstamos; un préstamo de
  otro prestamista responde `404`. Se agregó `ForbiddenError` (`403`) a los
  errores tipados. Los tokens incluyen `role_name` y `stakeholder_id`.
- Verification: dos lenders vieron solo sus préstamos (`[29]` y `[30]`), admin
  vio ambos; `lender_id` ajeno al crear → 403, préstamo ajeno al leer/borrar →
  404, cambio de `lender_id` en PATCH → 403, admin creó con `lender_id: 5`.
  Datos temporales eliminados; `node --check` sin errores.

## 2026-11-17 — Conflicto de `national_id` identificado por nombre de índice

- Change: `handleConstraintError` reúne los caminos de `error.errors` y
  `error.fields` y reconoce `national_id` o nombres de índice que lo contengan.
- Impact: un `national_id` inline duplicado responde
  `409 A stakeholder with that national ID already exists` en lugar del
  mensaje genérico `A related record already exists`, incluso si Sequelize
  informa el nombre de la restricción. El resto de unicidades conservan el
  mensaje genérico.
- Verification: creación de un préstamo con un fiador inline cuyo
  `national_id` ya existía devolvió el mensaje específico sin dejar préstamos
  almacenados; `node --check` y `git diff --check` sin errores.

## 2026-11-17 — Service simplificado y validación centralizada

- Change: `loanService.js` pasó de 24 a 10 funciones (6 operaciones y 4 helpers: `handleConstraintError`, `findLoanOrThrow`, `assertNoPayments` y `writeChildren`). Se eliminaron las funciones puente y se movieron a `loanValidation.js` el cálculo de términos efectivos, la detección de cambios financieros y todas las reglas de `PATCH` (stakeholders distintos, modo de interés y totales de cuotas). Los helpers de validación dejaron de exportarse.
- Impact: Sin cambios en rutas ni en el contrato de respuestas. Un `stakeholder_id` de fiador repetido junto con un stakeholder inline que resuelve al mismo registro responde ahora `409` por la restricción única de `loan_guarantors` (antes `400`). La validación de entrada se resuelve antes que los bloqueos por pagos, y un `:id` inexistente se detecta antes que un cuerpo inválido en `PATCH`.
- Verification: 28 comprobaciones de servicio sobre la base de datos (crear, listar, reemplazar, actualizar y eliminar; relaciones anidadas, campos virtuales, códigos 400/404/409, bloqueos por pago de cuota y sincronización de interés incluido/separado) y arranque del servidor de la API en el puerto 3000. `node --check` y `git diff --check` sin errores. Base restaurada a 0 préstamos y 6 stakeholders.

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