---
name: loans
description: Loans CRUD with a nested installment schedule, guarantors, collateral, and included/separate ordinary-interest tracking.
---

# loans

CRUD de préstamos (`loans`) que vinculan a un prestamista (`lender_id`) y un
cliente (`customer_id`) con el monto, la tasa de interés, la fecha de desembolso
y el modo de pago del interés ordinario. Las cuentas `lender` registran y
gestionan solo los préstamos que ellas proporcionan; `admin` conserva acceso
global.

El alta y el reemplazo crean o reemplazan, en una sola transacción, el calendario
de cuotas (`loan_installments`), los fiadores (`loan_guarantors`) y las garantías
(`loan_collaterals`). Cuando el interés se cobra por separado, también se crea
una obligación pendiente en `loan_interest_payments`. Los abonos se registran en
el módulo [`payments`](../payments/SKILL.md), que actualiza los estados de cuotas
e interés y bloquea estos préstamos para cambios posteriores.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Validación

Toda la validación y normalización del payload vive en
`src/server/utils/validators/loanValidation.js`. El service no valida datos de
entrada: recibe los atributos y arreglos ya normalizados y solo ejecuta la
persistencia transaccional, los bloqueos por pagos existentes y la lista blanca
de `PATCH` cuando hay pagos. En `PATCH`, el validador recibe el préstamo
almacenado para resolver las reglas que dependen del estado actual (términos
efectivos, cambios financieros y totales de cuotas).

Cuando una petición tiene errores de entrada y además el préstamo tiene pagos,
responde el error de validación (`400`); el conflicto por pagos (`409`) se
evalúa después. Un `:id` inexistente se detecta antes que un cuerpo inválido
en `PATCH`, así que en ese caso responde `404`.

## Endpoints

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Controller | Service | Acceso |
| --- | --- | --- | --- | --- |
| `GET` | `/api/loans` | `loanController.getAllLoans` | `loanService.getAllLoans` | lender propio / admin |
| `GET` | `/api/loans/:id` | `loanController.getLoanById` | `loanService.getLoanById` | lender propio / admin |
| `POST` | `/api/loans` | `loanController.createLoan` | `loanService.createLoan` | lender / admin |
| `PUT` | `/api/loans/:id` | `loanController.replaceLoan` | `loanService.replaceLoan` | lender propio / admin |
| `PATCH` | `/api/loans/:id` | `loanController.updateLoan` | `loanService.updateLoan` | lender propio / admin |
| `DELETE` | `/api/loans/:id` | `loanController.deleteLoan` | `loanService.deleteLoan` | lender propio / admin |

## Permisos y propiedad

Los controllers pasan `req.user` (`user_id`, `role_id`, `role_name`,
`stakeholder_id`) a todos los services de préstamos.

- `admin` (`role_name = "admin"`): acceso global; `lender_id` sigue siendo
  configurable en creación, reemplazo y PATCH.
- `requireAdminForLenderChange` se aplica en `POST`, `PUT` y `PATCH` desde
  `loanRoutes.js`: rechaza con `403 Only admins can change the lender` cualquier
  `lender_id` distinto del propio `stakeholder_id` de una cuenta `lender`. Los
  services mantienen sus reglas de propiedad y validación.
- El panel `/admin/loans` reutiliza `GET /api/loans` para listar y
  `PATCH /api/loans/:id` con `{ "lender_id" }` para reasignar el prestamista; no
  hay endpoints nuevos bajo `/api/admin`. El desplegable toma sus opciones de
  `GET /api/users` filtrando cuentas con rol `lender`.
- `lender`: sus consultas y mutaciones se filtran por
  `lender_id = req.user.stakeholder_id`. Al crear, el service deriva
  `lender_id` del usuario: si el payload envía otro valor responde `403`. En
  PATCH tampoco puede cambiar `lender_id`. Si el usuario no tiene
  `stakeholder_id`, responde `403`.
- Un préstamo de otro prestamista responde `404` en cualquier ruta con `:id`,
  aunque el registro exista; así no se revela su existencia.
- `loanScope(user)` está exportado desde `loanService` y lo reutiliza el módulo
  `payments` para aplicar el mismo filtro de propiedad.
- Las rutas `/api/users`, `/api/roles` y `/api/stakeholders` no filtran por rol.

## Campos del préstamo

| Campo | Tipo | Obligatorio | Reglas |
| --- | --- | --- | --- |
| `loan_id` | entero | — | PK autoincremental; en la URL debe ser entero positivo. |
| `lender_id` | entero | sí | Entero positivo; referencia a `stakeholders.stakeholder_id`; debe ser distinto de `customer_id`. Para `lender` se deriva del JWT (403 si se envía otro); `admin` puede elegirlo. |
| `customer_id` | entero | sí | Entero positivo; referencia a `stakeholders.stakeholder_id`; debe ser distinto de `lender_id`. |
| `loan_amount` | número/decimal | sí | Número finito mayor que 0 y hasta `9999999999.99`; máximo 2 decimales; acepta strings numéricos. |
| `interest_rate` | número/decimal | no | Número finito entre 0 y `999.9999`; `""`/`null` se guarda como `null`. |
| `interest_payment_mode` | enum | sí | `included` o `separate`. |
| `disbursed_at` | datetime | sí | Debe incluir hora. Acepta ISO 8601 (`YYYY-MM-DDTHH:mm[:ss[.sss]]` con `Z` u offset opcional) o `YYYY-MM-DD HH:mm[:ss]`; la fecha debe ser real. Sin zona se interpreta en la zona local del servidor y la respuesta se normaliza a ISO UTC. |

`interest_amount` y `total_to_pay` son campos virtuales de solo lectura que la
API calcula y devuelve:

```text
interest_amount = round(loan_amount * interest_rate / 100, 2)
total_to_pay    = loan_amount + interest_amount
```

Si `interest_rate` es `null`, el interés es 0.

## Relaciones del payload

Además de los campos del préstamo, `POST` y `PUT` exigen estos arreglos no vacíos:

### `installments[]`

| Campo | Reglas |
| --- | --- |
| `installment_number` | Entero positivo, único y consecutivo desde 1; el servidor ordena por este valor. |
| `amount_due` | Número mayor que 0, hasta `9999999999.99` y máximo 2 decimales. |
| `due_date` | `YYYY-MM-DD`, fecha real, única y estrictamente ascendente según `installment_number`. |

Los montos deben ser iguales entre sí, salvo la última cuota. La suma debe
coincidir exactamente con:

- `included`: `loan_amount + interest_amount` (interés incluido en las cuotas).
- `separate`: `loan_amount` (el interés se registra aparte).

`interest_payment_mode = separate` exige `interest_rate > 0`.

### `guarantors[]`

Cada elemento debe contener **o** `stakeholder_id` **o** los campos de un
stakeholder nuevo, pero no ambos:

- `stakeholder_id`: entero positivo de un stakeholder existente.
- Inline: `first_name` y `last_name` obligatorios; `national_id`,
  `marital_status`, `occupation` y `date_of_birth` siguen las reglas del módulo
  `stakeholders`.

No se permite repetir un mismo stakeholder. Los stakeholders inline se crean
dentro de la misma transacción y permanecen en la base si luego se elimina el
préstamo. Un `national_id` duplicado responde `409`.

### `collaterals[]`

| Campo | Reglas |
| --- | --- |
| `description` | Texto obligatorio, `trim`, máximo 65535 caracteres. |
| `estimated_value` | Opcional; número mayor o igual que 0, hasta `9999999999.99` y máximo 2 decimales. |

## Comportamiento por endpoint

- `GET /`: devuelve todos los préstamos ordenados por `loan_id` descendente
  (`200`). Cada préstamo incluye `lender` y `customer` (`stakeholder_id`,
  `first_name`, `last_name`), `installments` ordenadas por
  `installment_number`, `guarantors` con su `guarantor`, `collaterals` e
  `interestPayment` (con su `payment` cuando está pagado). Si el préstamo no
  tiene interés separado, `interestPayment` es `null`.
- `GET /:id`: devuelve el préstamo con las mismas relaciones o `404` si no existe.
- `POST /`: crea el préstamo, sus cuotas, fiadores, garantías y la obligación de
  interés pendiente cuando corresponde (`201`). Devuelve el préstamo con todas
  sus relaciones. `lender_id` se toma del usuario autenticado para cuentas
  `lender`; enviar otro valor responde `403`. Si `customer_id` no existe, si un
  `guarantor.stakeholder_id` no existe o si un `national_id` inline ya existe,
  responde `409`. Si prestamista y cliente son la misma persona responde `400`.
- `PUT /:id`: reemplazo completo (`200`). Exige los campos del préstamo y los
  arreglos `installments`, `guarantors` y `collaterals`; reemplaza todas las
  relaciones. Si el préstamo tiene algún pago de cuota o interés pagado responde
  `409` y no modifica nada.
- `PATCH /:id`: actualización parcial (`200`). Solo cambia los campos y arreglos
  enviados; con un cuerpo vacío responde `400`. Los arreglos enviados reemplazan
  su relación completa. Si cambia `loan_amount`, `interest_rate` o
  `interest_payment_mode`, exige `installments` para recalcular y validar el
  calendario. Si el préstamo tiene pagos de cuotas o interés pagado, solo se
  permiten `guarantors` y `collaterals` para cualquier usuario, y `lender_id`
  adicionalmente para `admin`; cualquier otro campo o arreglo (incluidos
  `customer_id`, `disbursed_at`, campos financieros, `installments` y
  `lender_id` de un `lender`) responde `409` con
  `A loan with payments can only update ...`. Los campos no permitidos se
  rechazan incluso si se envían con el mismo valor almacenado.
- `DELETE /:id`: elimina el préstamo (`204`, sin cuerpo). Si tiene pagos de
  cuotas o interés pagado responde `409`. En caso contrario elimina primero la
  obligación de interés pendiente, los vínculos de fiadores, las garantías, las
  cuotas y finalmente el préstamo. Los stakeholders inline no se eliminan.

### Interés incluido y separado

- `included`: las cuotas suman capital + interés y no existe fila en
  `loan_interest_payments`.
- `separate`: las cuotas suman capital y existe exactamente una fila en
  `loan_interest_payments` con `payment_id = null` y `status = "pending"`.
- Al cambiar de `separate` a `included`, se elimina la obligación pendiente. Al
  cambiar de `included` a `separate`, se crea una nueva obligación pendiente.
- Una obligación con `status = "paid"` bloquea los cambios financieros y la
  eliminación del préstamo; la edición parcial de fiadores, garantías y, para
  `admin`, prestamista continúa disponible según la regla de `PATCH`.

Los campos desconocidos se ignoran. Un `:id` no numérico o menor o igual a cero
responde `400`.

## Errores

- `400` campos obligatorios, formato/valor inválido, cuotas inconsistentes,
  prestamista igual al cliente o `:id` inválido.
- `401` token ausente o inválido (lo aplica `checkAuth`).
- `403` prestamista no vinculado, `lender_id` distinto al del usuario `lender`
  en cualquier mutación (`Only admins can change the lender` cuando lo detecta
  el guard) o intento de cambiarlo en PATCH.
- `404` préstamo inexistente o perteneciente a otro prestamista.
- `409` referencia inválida, `national_id` inline duplicado (mensaje `A stakeholder with that national ID already exists`), fiador duplicado
  (un `stakeholder_id` y un stakeholder inline que resuelve al mismo registro),
  pagos de cuotas, interés pagado, campo no permitido en `PATCH` con pagos o
  conflicto de unicidad al crear/reemplazar.
- `500` error inesperado.

## Archivos

- `src/server/routes/loanRoutes.js` (montado en `/api/loans`)
- `src/server/middlewares/requireAdminForLenderChange.js`
- `src/server/controllers/loanController.js`
- `src/server/services/loanService.js`
- `src/server/utils/validators/loanValidation.js`
- `src/server/utils/validators/stakeholderValidation.js` (fiadores inline)
- `src/server/models/Loan.js`
- `src/server/models/LoanInstallment.js`
- `src/server/models/LoanGuarantor.js`
- `src/server/models/LoanCollateral.js`
- `src/server/models/LoanInterestPayment.js`
- `database/migrations/2026-11-16-loan-interest-payment-mode.sql`
- `database/migrations/2026-11-17-rename-operator-role-to-lender.sql`
