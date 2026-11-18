---
name: payments
description: Payment recording for loan installments and separate ordinary interest, with lender-scoped reads and status updates.
---

# payments

Registro de pagos aplicados a una cuota (`installment_payments`) o a la
obligación de interés ordinario cobrado por separado
(`loan_interest_payments`). Cada pago se crea en `loan_payments` con su monto,
fecha y el usuario autenticado que lo registra. La operación es transaccional y
actualiza el estado del destino en la misma transacción.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Validación

Toda la validación de entrada vive en
`src/server/utils/validators/paymentValidation.js`. El service recibe los
atributos ya normalizados y solo ejecuta la persistencia y los conflictos de
estado.

| Campo | Reglas |
| --- | --- |
| `loan_id` | Entero positivo obligatorio; el préstamo debe existir y pertenecer al prestamista autenticado (`admin` ve todos). |
| `amount` | Número finito obligatorio en `(0, 9999999999.99]`, máximo 2 decimales; debe ser exactamente igual al monto pendiente del destino. No se admiten abonos parciales. |
| `paid_at` | Opcional. ISO 8601 con hora y zona (`Z` u offset); si se omite se usa la hora actual del servidor y se responde en UTC. |
| `installment_id` | Entero positivo obligatorio en `POST /api/payments/installment`. |
| `loan_interest_payment_id` | Entero positivo obligatorio en `POST /api/payments/interest`. |

Cada endpoint exige su propio identificador de destino. El campo del otro
destino se ignora, por lo que no existe despacho ambiguo por payload. Un `amount`
distinto al pendiente responde `400`.

## Endpoints

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Controller | Service | Acceso |
| --- | --- | --- | --- | --- |
| `GET` | `/api/payments` | `paymentController.getAllPayments` | `paymentService.getAllPayments` | lender propio / admin |
| `GET` | `/api/payments/:id` | `paymentController.getPaymentById` | `paymentService.getPaymentById` | lender propio / admin |
| `POST` | `/api/payments/installment` | `paymentController.createInstallmentPayment` | `paymentService.createInstallmentPayment` | lender propio / admin |
| `POST` | `/api/payments/interest` | `paymentController.createInterestPayment` | `paymentService.createInterestPayment` | lender propio / admin |

No existe un `POST /api/payments` genérico.

### `POST /api/payments/installment`

Cuerpo para pagar una cuota:

```json
{
  "loan_id": 35,
  "installment_id": 161,
  "amount": 200,
  "paid_at": "2026-02-15T10:30:00Z"
}
```

### `POST /api/payments/interest`

Cuerpo para pagar el interés separado:

```json
{
  "loan_id": 35,
  "loan_interest_payment_id": 17,
  "amount": 200
}
```

- En `/installment`, la cuota debe pertenecer al `loan_id` indicado. Si ya tiene
  un `InstallmentPayment` o su `status` es `paid`, responde `409`.
- En `/interest`, la obligación debe pertenecer al préstamo y el préstamo debe
  tener `interest_payment_mode = "separate"`. Si ya está pagado, responde `409`.
- El monto esperado de la cuota es `amount_due`; el del interés es el campo
  virtual `Loan.interest_amount` (`round(loan_amount * interest_rate / 100, 2)`).
- `recorded_by` se toma de `req.user.user_id`. El cuerpo no necesita enviarlo y
  cualquier valor enviado se ignora; no puede suplantar al usuario autenticado.
- La respuesta (`201`) incluye `recorded_by` y `recordedBy` (`user_id`, `email`)
  junto con `InstallmentPayment` y su `LoanInstallment`, o `LoanInterestPayment`
  y su `Loan`.

### `GET /api/payments`

Devuelve los pagos de los préstamos visibles para el usuario, ordenados por
`paid_at` descendente y luego `payment_id` descendente. El query param opcional
`loan_id` filtra por un préstamo; si el préstamo es ajeno a un `lender`, responde
`404`.

### `GET /api/payments/:id`

Devuelve un pago con las mismas relaciones que los `POST`, o `404` si no existe, no
tiene una aplicación reconocida o pertenece a otro prestamista.

## Permisos y propiedad

`paymentService` reutiliza `loanScope` de `loanService`: los préstamos de un
`lender` se filtran por `lender_id = req.user.stakeholder_id`, mientras `admin`
conserva acceso global. Un usuario `lender` sin `stakeholder_id` responde `403`.

## Relación con `loans`

La existencia de pagos bloquea los cambios financieros, el reemplazo y la
eliminación del préstamo con `409` (regla implementada en `loanService`).
Pagar una cuota cambia su `status` a `paid`; pagar el interés cambia su `status`
a `paid` y asigna `payment_id`, cumpliendo la restricción
`chk_loan_interest_payment_state`.

## Errores

- `400` datos inválidos, identificador de destino ausente en el endpoint
  correspondiente, o monto distinto al pendiente.
- `401` token ausente o inválido (lo aplica `checkAuth`).
- `403` usuario `lender` sin stakeholder vinculado.
- `404` préstamo, cuota, obligación de interés o pago inexistente o ajeno.
- `409` cuota o interés ya pagado, modo de interés incompatible o conflicto de
 unicidad/foreign key al persistir.
- `500` error inesperado.

## Archivos

- `src/server/routes/paymentRoutes.js` (montado en `/api/payments`)
- `src/server/controllers/paymentController.js`
- `src/server/services/paymentService.js`
- `src/server/utils/validators/paymentValidation.js`
- `src/server/services/loanService.js` (`loanScope` compartido)
- `src/server/models/LoanPayment.js`
- `src/server/models/InstallmentPayment.js`
- `src/server/models/LoanInterestPayment.js`
