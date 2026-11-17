# Loan Management System

Aplicación web para administrar préstamos, desde el desembolso hasta el pago de la última cuota. El sistema reúne en un solo lugar quién presta el dinero, quién lo recibe, qué fiadores o bienes respaldan el préstamo y cómo se han aplicado los pagos.

El propósito es **reemplazar el control manual de préstamos** por un registro que permita consultar el saldo de cada cuota, identificar vencimientos y ver cuándo se recibió cada abono y quién lo registró.

## Alcance

- Registrar préstamos con su monto, tasa de interés ordinario, fecha de desembolso, calendario de cuotas, fiadores, garantías y modo de interés (incluido en las cuotas o cobrado por separado).
- Registrar uno o varios abonos por cuota y llevar por separado los pagos de interés ordinario.
- Identificar cuotas pendientes, pagadas, vencidas o reprogramadas, y calcular la mora diaria por cuota.
- Consultar el historial de préstamos de una persona como cliente, prestamista o fiador.

## Entidades

| Entidad | Qué representa |
| --- | --- |
| `stakeholders` | Personas que participan en los préstamos. Una misma persona puede ser cliente en un préstamo y fiadora en otro. |
| `users` | Cuentas de acceso vinculadas a una persona. |
| `roles` | Roles de acceso al sistema, como `admin` y `operator`. |
| `loans` | Préstamos que vinculan a un prestamista con un cliente y registran las condiciones del desembolso y el modo de interés (`included`/`separate`). |
| `loan_installments` | Cuotas de un préstamo. Cada una tiene su propio monto, vencimiento, estado y tasa diaria de mora. |
| `loan_guarantors` | Personas que actúan como fiadoras de un préstamo específico. |
| `loan_collaterals` | Bienes dados en garantía, con su descripción y valor estimado cuando se conoce. |
| `loan_payments` | Pagos recibidos, con su monto, fecha y usuario que los registró. |
| `installment_payments` | Vincula un pago con la cuota a la que se aplica. Una cuota puede recibir varios abonos. |
| `loan_interest_payments` | Obligación de interés ordinario por préstamo: pendiente (`payment_id` nulo) o pagada. |

## Tecnologías

React y Vite para la interfaz, Express para la API y MySQL con Sequelize para el acceso a datos. Vite Express permite servir la interfaz y la API desde el mismo servidor.

- React 19 y Vite 6 (con `@vitejs/plugin-react`).
- Express 5 con módulos ES (`"type": "module"`).
- MySQL a través de Sequelize 6 y `mysql2`.
- Autenticación con JWT (`jsonwebtoken`) y `bcryptjs`.
- Gestor de paquetes: pnpm.

## Requisitos

- Node.js con soporte para `--env-file` (Node 20 o superior).
- pnpm.
- Servidor MySQL accesible con una base de datos creada.

## Configuración

Las credenciales se leen desde `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=...
DB_NAME=loan_management_system
JWT_SECRET=...
JWT_EXPIRES_IN=1h
```

## Comandos

```bash
pnpm install   # instala dependencias
pnpm dev       # inicia el servidor de desarrollo en http://localhost:3000
pnpm build     # compila la interfaz con Vite en dist/
pnpm start     # inicia el servidor en modo producción
```

`pnpm dev` ejecuta nodemon sobre `src/server`, cargando `.env` con `node --env-file=.env`.

## Arquitectura

La API se organiza en capas: `routes → controllers → services → models`.

- Las **routes** definen el método y la URL y delegan en el controller.
- Los **controllers** reciben `req`/`res`, pasan los datos al service y construyen la respuesta.
- Los **services** contienen la lógica de negocio y no conocen HTTP, lo que permite probarlos de forma aislada.
- Los **models** mapean las tablas MySQL con Sequelize.

La validación y normalización de payloads vive en `src/server/utils/validators/`, organizada por módulo. Los helpers compartidos (`common.js`) se encargan de enteros positivos, strings opcionales y números finitos; cada validador de dominio construye los atributos que recibe el service.

Cada router se registra en `src/server/api.js`. Los services lanzan errores tipados (definidos en `src/server/utils/errors.js`) que los controllers traducen a códigos HTTP.

`/api/auth` (signup y login) es público. El middleware `checkAuth` se aplica después de ese router, así que todo lo registrado debajo (`/api/users`, `/api/roles`, `/api/stakeholders`, `/api/loans`) exige `Authorization: Bearer <token>`.

## Estructura del proyecto

```
database/
└─ migrations/
   └─ 2026-11-16-loan-interest-payment-mode.sql

src/
├─ client/                  interfaz React (Vite)
│  ├─ main.jsx              punto de entrada de React
│  ├─ App.jsx               componente principal
│  ├─ App.css / index.css
│  └─ assets/
└─ server/                  API Express
   ├─ main.js               servidor, monta /api y escucha en el puerto 3000
   ├─ api.js                router global: monta /auth y luego checkAuth + /users, /roles, /stakeholders y /loans
   ├─ config/
   │  ├─ connection.js      conexión Sequelize a MySQL
   │  └─ passport.js        estrategias local y JWT (no usado por la API actual)
   ├─ controllers/          intermediarios entre rutas y services
   ├─ middlewares/
   │  └─ checkAuth.js       exige Authorization: Bearer <token>
   ├─ services/             lógica de negocio y operaciones
   ├─ routes/               definición de métodos y URLs
   ├─ utils/
   │  ├─ errors.js              errores tipados (AppError, ValidationError, UnauthorizedError, ConflictError, NotFoundError)
   │  ├─ generateToken.js       firma el JWT
   │  └─ validators/
   │     ├─ common.js              helpers compartidos (enteros, strings opcionales, números)
   │     ├─ authValidation.js      validación/normalización de payloads de auth
   │     ├─ loanValidation.js      validación/parseo de préstamos y sus relaciones
   │     └─ stakeholderValidation.js validación/parseo de stakeholders
   └─ models/
      ├─ Role.js               tabla roles
      ├─ User.js               tabla users
      ├─ Stakeholder.js        tabla stakeholders
      ├─ Loan.js               tabla loans
      ├─ LoanInstallment.js    tabla loan_installments
      ├─ LoanGuarantor.js      tabla loan_guarantors
      ├─ LoanCollateral.js     tabla loan_collaterals
      ├─ LoanPayment.js        tabla loan_payments
      ├─ InstallmentPayment.js tabla installment_payments
      ├─ LoanInterestPayment.js tabla loan_interest_payments
      └─ associations.js       relaciones entre modelos
```

La documentación por módulo vive en [`.agents/skills/`](.agents/skills/); cada módulo tiene su `SKILL.md` y `CHANGELOG.md`.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/roles` | Lista los roles registrados. Requiere token. |
| `GET` | `/api/users` | Lista los usuarios con su stakeholder y rol. Requiere token. |
| `GET` | `/api/stakeholders` | Lista los stakeholders ordenados por apellido y nombre. Requiere token. |
| `GET` | `/api/stakeholders/:id` | Devuelve un stakeholder. Requiere token. |
| `POST` | `/api/stakeholders` | Crea un stakeholder. Requiere `first_name` y `last_name`. Requiere token. |
| `PUT` | `/api/stakeholders/:id` | Reemplaza un stakeholder; los campos opcionales omitidos quedan en `null`. Requiere token. |
| `PATCH` | `/api/stakeholders/:id` | Actualiza solo los campos enviados. Requiere token. |
| `DELETE` | `/api/stakeholders/:id` | Elimina un stakeholder; responde `409` si está referenciado. Requiere token. |
| `GET` | `/api/loans` | Lista los préstamos con prestamista, cliente, cuotas, fiadores, garantías e interés. Requiere token. |
| `GET` | `/api/loans/:id` | Devuelve un préstamo con sus relaciones. Requiere token. |
| `POST` | `/api/loans` | Crea un préstamo con `installments`, `guarantors` y `collaterals` en una transacción. Requiere `lender_id`, `customer_id`, `loan_amount`, `interest_payment_mode` y `disbursed_at`; prestamista y cliente deben ser distintos. Requiere token. |
| `PUT` | `/api/loans/:id` | Reemplaza un préstamo y todas sus relaciones; exige los tres arreglos. Requiere token. |
| `PATCH` | `/api/loans/:id` | Actualiza solo los campos o arreglos enviados; los cambios financieros requieren `installments`. Requiere token. |
| `DELETE` | `/api/loans/:id` | Elimina un préstamo y sus relaciones; responde `409` si tiene pagos de cuotas o interés pagado. Requiere token. |
| `POST` | `/api/auth/signup` | Crea un usuario; valida los campos y hashea la contraseña. Recibe `email`, `password`, `role_id` y `stakeholder_id`; un rol o stakeholder inexistente responde `409`. |
| `POST` | `/api/auth/login` | Inicia sesión. Recibe `email` y `password`; responde `{ token, user }` con un JWT de 1 hora. |
| `GET` | `/hello` | Verificación simple de que el servidor responde. |

Las rutas marcadas como "Requiere token" esperan `Authorization: Bearer <token>`; sin token o con uno inválido responden `401`. El login exitoso responde `200` y las credenciales incorrectas `401`.

### Préstamos

`POST` y `PUT` reciben el préstamo junto con `installments`, `guarantors` y `collaterals`:

```json
{
  "lender_id": 1,
  "customer_id": 2,
  "loan_amount": 1000,
  "interest_rate": 20,
  "interest_payment_mode": "separate",
  "disbursed_at": "2026-01-15T10:30:00Z",
  "installments": [
    { "installment_number": 1, "amount_due": 200, "due_date": "2026-02-15" },
    { "installment_number": 2, "amount_due": 200, "due_date": "2026-03-15" },
    { "installment_number": 3, "amount_due": 200, "due_date": "2026-04-15" },
    { "installment_number": 4, "amount_due": 200, "due_date": "2026-05-15" },
    { "installment_number": 5, "amount_due": 200, "due_date": "2026-06-15" }
  ],
  "guarantors": [
    { "stakeholder_id": 3 },
    { "first_name": "Ana", "last_name": "Pérez", "national_id": "..." }
  ],
  "collaterals": [
    { "description": "Vehículo", "estimated_value": 5000 }
  ]
}
```

Las cuotas deben numerarse desde 1, tener fechas únicas y ascendentes, y montos iguales salvo la última. El interés se calcula como `round(loan_amount * interest_rate / 100, 2)` y `total_to_pay` es `loan_amount + interest_amount`. En modo `included` las cuotas suman `total_to_pay` y no hay registro de interés; en modo `separate` suman `loan_amount` y se crea una obligación pendiente en `loan_interest_payments`. `separate` exige `interest_rate > 0`.

Cada fiador puede referenciar un `stakeholder_id` existente o enviar los campos de un stakeholder nuevo, pero no ambos. Las garantías requieren `description` y aceptan `estimated_value` opcional. Las respuestas incluyen `interest_amount`, `total_to_pay`, cuotas ordenadas, fiadores, garantías e `interestPayment`.

`disbursed_at` debe incluir hora y acepta ISO 8601 (`2026-01-15T10:30:00Z`, con zona opcional) o formato MySQL (`2026-01-15 10:30:00`); sin zona se interpreta como hora local del servidor y la respuesta usa ISO UTC. `loan_amount` debe ser mayor que 0, tener máximo 2 decimales y llegar hasta `9999999999.99`; `interest_rate` va de 0 a `999.9999`.

`PATCH` reemplaza solo los arreglos enviados y exige `installments` cuando cambian `loan_amount`, `interest_rate` o `interest_payment_mode`. Los pagos de cuotas o un interés pagado bloquean los cambios y la eliminación con `409`.

Passport sigue configurado en `src/server/config/passport.js` pero la API actual no lo usa; la autenticación se resuelve con JWT.