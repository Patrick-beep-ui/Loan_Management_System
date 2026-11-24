# Loan Management System

Aplicación web para administrar préstamos, desde el desembolso hasta el pago de la última cuota. El sistema reúne en un solo lugar quién presta el dinero, quién lo recibe, qué fiadores o bienes respaldan el préstamo y cómo se han aplicado los pagos.

El propósito es **reemplazar el control manual de préstamos** por un registro que permita consultar el saldo de cada cuota, identificar vencimientos y ver cuándo se recibió cada abono y quién lo registró.

## Alcance

- Registrar préstamos con su monto, tasa de interés ordinario, fecha de desembolso, calendario de cuotas, fiadores, garantías y modo de interés (incluido en las cuotas o cobrado por separado).
- Registrar el pago total de una cuota o de la obligación de interés ordinario cobrado por separado, con fecha y usuario que lo registró.
- Identificar cuotas pendientes, pagadas, vencidas o reprogramadas, y calcular la mora diaria por cuota.
- Consultar el historial de préstamos de una persona como cliente, prestamista o fiador.

## Entidades

| Entidad | Qué representa |
| --- | --- |
| `stakeholders` | Personas que participan en los préstamos. Una misma persona puede ser cliente en un préstamo y fiadora en otro. |
| `users` | Cuentas de acceso vinculadas a una persona. |
| `roles` | Roles de acceso al sistema: `admin` y `lender`. |
| `loans` | Préstamos que vinculan a un prestamista con un cliente y registran las condiciones del desembolso y el modo de interés (`included`/`separate`). |
| `loan_installments` | Cuotas de un préstamo. Cada una tiene su propio monto, vencimiento, estado y tasa diaria de mora. |
| `loan_guarantors` | Personas que actúan como fiadoras de un préstamo específico. |
| `loan_collaterals` | Bienes dados en garantía, con su descripción y valor estimado cuando se conoce. |
| `loan_payments` | Pagos recibidos, con su monto, fecha y usuario que los registró. |
| `installment_payments` | Vincula un pago con la cuota a la que se aplica. La API registra un pago total por cuota. |
| `loan_interest_payments` | Obligación de interés ordinario por préstamo: pendiente (`payment_id` nulo) o pagada. |

## Tecnologías

React y Vite para la interfaz, Express para la API y MySQL con Sequelize para el acceso a datos. Vite Express permite servir la interfaz y la API desde el mismo servidor.

- React 19 y Vite 6 (con `@vitejs/plugin-react`).
- React Router 7 para el enrutamiento del cliente.
- Tailwind CSS 4 (`@tailwindcss/vite`), componentes shadcn sobre primitivos de Base UI, `class-variance-authority`, `lucide-react` y las fuentes Playfair Display y Montserrat desde Google Fonts.
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

La validación y normalización de payloads vive en `src/server/utils/validators/`, organizada por módulo. Los helpers compartidos (`common.js`) se encargan de enteros positivos, strings opcionales y números finitos; cada validador de dominio construye los atributos que recibe el service. En actualizaciones parciales el validador recibe también el registro almacenado para resolver las reglas que dependen del estado actual; los services solo ejecutan la persistencia y los conflictos por pagos existentes.

Cada router se registra en `src/server/api.js`. Los services lanzan errores tipados (definidos en `src/server/utils/errors.js`) que los controllers traducen a códigos HTTP.

`/api/auth` (signup y login) es público. El middleware `checkAuth` se aplica después de ese router, así que todo lo registrado debajo (`/api/users`, `/api/roles`, `/api/stakeholders`, `/api/loans`, `/api/payments`) exige `Authorization: Bearer <token>`. El JWT incluye `user_id`, `role_id`, `role_name` y `stakeholder_id`; `checkAuth` los expone en `req.user`. El signup público solo crea cuentas `lender`. Las rutas de préstamos y pagos se restringen al stakeholder vinculado al usuario `lender`; `admin` conserva acceso global y puede elegir cualquier prestamista al crear préstamos.

## Frontend

El cliente React arranca en `src/client/main.jsx`, donde `createBrowserRouter` define las rutas y `RouterProvider` monta la aplicación. `AuthProvider` es el layout raíz y `RequireAuth` protege las rutas de préstamos. Las vistas viven en `src/client/views/`, los componentes reutilizables en `src/components/ui/` y los componentes por dominio en `src/components/<dominio>/`, agrupados por propósito cuando hay más de un flujo.

| Ruta | Vista | Acceso |
| --- | --- | --- |
| `/` | `App` (demo inicial de Vite) | público |
| `/login` | `Login` | público |
| `/signup` | `Signup` | público |
| `/loans` | `Loan` | protegido |
| `/create-loan` | `CreateLoan` | protegido |
| `/loans/:id` | `LoanDetails` | protegido |
| `/loans/:id/edit` | `EditLoan` | protegido |
| `/test` | `Test` (vista de prueba) | público |

`Login` y `Signup` consumen `/api/auth` mediante `src/lib/axiosService.js` (`api.post`): validan los campos, muestran estados de carga y error y usan los componentes `Card`, `Input`, `Label` y `Button`. El servicio centraliza el `baseURL` (`VITE_API_URL` o `http://localhost:3000/api`), un interceptor que envía `Authorization: Bearer <token>` leyendo `token` de `localStorage` y un interceptor de respuesta que ante un `401` limpia el token y emite `auth:unauthorized` (excepto en `/auth/login` y `/auth/signup`). `src/client/contexts/AuthContext.jsx` expone `AuthProvider`, `useAuth()` y `RequireAuth`: la sesión se hidrata con `GET /api/users/auth`, `/loans`, `/create-loan`, `/loans/:id` y `/loans/:id/edit` están protegidos y el resto de rutas son públicas. `Login` usa `useAuth().login(token)` y navega a la ruta de origen o `/loans`; `Signup` envía `email`, `password` y `stakeholder_id` y, tras el registro, navega a `/login` con un aviso de éxito. `Loan` compone el listado desde `src/components/loans/list/` con el hook `useLoans` y `api.get("/loans")` (ID, prestamista, cliente, monto, tasa, modo, fecha y total), con estados de carga, vacío y error y formatos en `src/client/utils/loanFormat.js`; usa `useAuth().user` solo para mostrar nombre y rol, porque el backend filtra por JWT. `CreateLoan` es un formulario de dos pasos compuesto desde `src/components/loans/create/`: el hook `useCreateLoanForm` carga stakeholders, administra el estado y valida con `src/client/utils/loanForm.js`, `CreateLoanForm` reúne los campos, fiadores y garantías, e `InstallmentPreview` muestra las cuotas calculadas por `src/client/utils/loanSchedule.js` antes de enviar `POST /api/loans`; `Loan` incluye el botón `New loan` y un aviso de creación correcta. `LoanDetails` compone `src/components/loans/details/` con `useLoanDetails` y `api.get("/loans/:id")`: muestra resumen, cuotas, fiadores, garantías e interés, y ofrece editar o eliminar solo cuando no hay pagos registrados; `useLoanFormState` es el estado compartido con la creación. Desde el detalle se registran pagos con `src/components/payments/` y `useLoanPayment`: la cuota o el interés se pagan con monto bloqueado y `paid_at` opcional, y un refetch actualiza estados sin recargar. `EditLoan` reutiliza el formulario y la vista previa de `create/` con `useEditLoanForm`, envía `PUT /api/loans/:id` con todos los arreglos y vuelve al detalle con `state.updatedLoanId`. `Loan` enlaza cada ID al detalle y muestra `state.deletedLoanId` tras una eliminación. `/test` usa `api.get("/roles")` del mismo servicio (ruta actualmente deshabilitada en `src/server/api.js`). Los estilos se definen en `src/client/index.css` con Tailwind 4, la paleta de marca (`263A69`, `B0C7DD`, `E8E3DD`, `EDECEA` y `0F0F0F`) en temas claro y oscuro, con Playfair Display para títulos y Montserrat para texto desde Google Fonts. `vite.config.js` y `jsconfig.json` resuelven el alias `@` a `src/`, y `components.json` guarda la configuración de shadcn (estilo `base-nova`, primitivos de Base UI e iconos `lucide`). El detalle está en la documentación del módulo [`frontend`](.agents/skills/frontend/SKILL.md).

## Estructura del proyecto

```
components.json             configuración de shadcn (alias, estilo, CSS)
jsconfig.json               alias `@/*` → `./src/*`
vite.config.js              plugins de Vite y alias `@` → `./src`

database/
└─ migrations/
   ├─ 2026-11-16-loan-interest-payment-mode.sql
   └─ 2026-11-17-rename-operator-role-to-lender.sql

src/
├─ client/                  interfaz React (Vite)
│  ├─ main.jsx              entrada, rutas y `RequireAuth`
│  ├─ App.jsx               componente principal (demo de Vite)
│  ├─ App.css / index.css   estilos base y tokens de Tailwind/shadcn
│  ├─ contexts/             AuthContext: provider, hook y guard
│  ├─ hooks/                hooks: useLoans, useLoanFormState, useCreateLoanForm, useLoanDetails, useEditLoanForm, useLoanPayment
│  ├─ Test.jsx              vista de prueba (/test)
│  ├─ views/                vistas: Login, Signup, Loans, CreateLoan, LoanDetails, EditLoan
│  ├─ utils/                helpers: loanFormat, loanForm, loanSchedule, loanEdit, loanPayment
│  └─ assets/
├─ components/
│  ├─ loans/                componentes de préstamos por propósito
│  │  ├─ create/            formulario, fiadores, garantías y vista previa
│  │  ├─ list/              encabezado, avisos y tabla del listado
│  │  ├─ details/           resumen, tablas, avisos y confirmación de borrado
│  │  └─ edit/              encabezado, errores y aviso de préstamo bloqueado
│  ├─ payments/             modales de pago de cuotas e interés y aviso de éxito
│  └─ ui/                   componentes shadcn: button, card, dialog, input, label, select, table, textarea
├─ lib/
│  ├─ axiosService.js       instancia de axios con interceptor de token
│  └─ utils.js              reexporta `cn`
└─ server/                  API Express
   ├─ main.js               servidor, monta /api y escucha en el puerto 3000
   ├─ api.js                router global: monta /auth y luego checkAuth + /users, /roles, /stakeholders, /loans y /payments
   ├─ config/
   │  ├─ connection.js      conexión Sequelize a MySQL
   │  └─ passport.js        estrategias local y JWT (no usado por la API actual)
   ├─ controllers/          intermediarios entre rutas y services
   ├─ middlewares/
   │  └─ checkAuth.js       exige Authorization: Bearer <token>
   ├─ services/             lógica de negocio y operaciones
   ├─ routes/               definición de métodos y URLs
   ├─ utils/
    │  ├─ errors.js              errores tipados (AppError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, NotFoundError)
   │  ├─ generateToken.js       firma el JWT
   │  └─ validators/
   │     ├─ common.js              helpers compartidos (enteros, strings opcionales, números)
   │     ├─ authValidation.js      validación/normalización de payloads de auth
    │     ├─ loanValidation.js      validación/parseo de préstamos y sus relaciones
    │     ├─ paymentValidation.js   validación/parseo de pagos
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
| `GET` | `/api/loans` | Lista los préstamos del prestamista autenticado (todos para `admin`). Requiere token. |
| `GET` | `/api/loans/:id` | Devuelve un préstamo propio con sus relaciones, o `404` si no pertenece al prestamista. Requiere token. |
| `POST` | `/api/loans` | Crea un préstamo con `installments`, `guarantors` y `collaterals` en una transacción. Requiere `customer_id`, `loan_amount`, `interest_payment_mode` y `disbursed_at`; para `lender`, `lender_id` se deriva del usuario (otro valor responde `403`), mientras `admin` puede elegirlo. Requiere token. |
| `PUT` | `/api/loans/:id` | Reemplaza un préstamo propio y todas sus relaciones; exige los tres arreglos. Requiere token. |
| `PATCH` | `/api/loans/:id` | Actualiza solo los campos o arreglos enviados; los cambios financieros requieren `installments`. Un `lender` no puede cambiar `lender_id`. Requiere token. |
| `DELETE` | `/api/loans/:id` | Elimina un préstamo propio y sus relaciones; responde `409` si tiene pagos de cuotas o interés pagado. Requiere token. |
| `GET` | `/api/payments` | Lista los pagos visibles para el usuario, con `?loan_id` opcional. Requiere token. |
| `GET` | `/api/payments/:id` | Devuelve un pago con su cuota o interés aplicado. Requiere token. |
| `POST` | `/api/payments/installment` | Registra el pago total de una cuota. Requiere token. |
| `POST` | `/api/payments/interest` | Registra el pago del interés separado. Requiere token. |
| `PATCH` | `/api/payments/:id` | Corrige solo `paid_at` de un pago. Requiere token. |
| `DELETE` | `/api/payments/:id` | Revierte un pago, restaura la cuota o el interés a `pending` y responde `204`. Requiere token. |
| `POST` | `/api/auth/signup` | Crea una cuenta `lender`; recibe `email`, `password` y `stakeholder_id`. El rol se asigna desde la base, no desde el payload; un stakeholder inexistente responde `409`. |
| `POST` | `/api/auth/login` | Inicia sesión. Recibe `email` y `password`; responde `{ token, user }` con un JWT de 1 hora que incluye `role_name` y `stakeholder_id`. |
| `GET` | `/hello` | Verificación simple de que el servidor responde. |

Las rutas marcadas como "Requiere token" esperan `Authorization: Bearer <token>`; sin token o con uno inválido responden `401`. El login exitoso responde `200` y las credenciales incorrectas `401`.

### Préstamos

`POST` y `PUT` reciben el préstamo junto con `installments`, `guarantors` y `collaterals`:

```json
{
  "lender_id": 2,
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
    { "first_name": "Ana", "last_name": "Pérez", "national_id": "555-1234" }
  ],
  "collaterals": [
    { "description": "Vehículo", "estimated_value": 5000 }
  ]
}
```

Las cuotas deben numerarse desde 1, tener fechas únicas y ascendentes, y montos iguales salvo la última. El interés se calcula como `round(loan_amount * interest_rate / 100, 2)` y `total_to_pay` es `loan_amount + interest_amount`. En modo `included` las cuotas suman `total_to_pay` y no hay registro de interés; en modo `separate` suman `loan_amount` y se crea una obligación pendiente en `loan_interest_payments`. `separate` exige `interest_rate > 0`.

Cada fiador puede referenciar un `stakeholder_id` existente o enviar los campos de un stakeholder nuevo, pero no ambos. El `national_id` de un stakeholder inline debe ser único: repetir uno ya registrado responde `409`. Las garantías requieren `description` y aceptan `estimated_value` opcional. Las respuestas incluyen `interest_amount`, `total_to_pay`, cuotas ordenadas, fiadores, garantías e `interestPayment`.

Para cuentas `lender`, `lender_id` debe ser el stakeholder vinculado al usuario: el service lo deriva del JWT y responde `403` si se envía otro valor. Un préstamo de otro prestamista responde `404` aunque el `:id` exista. Los usuarios `admin` mantienen acceso global y pueden especificar cualquier `lender_id`.

`disbursed_at` debe incluir hora y acepta ISO 8601 (`2026-01-15T10:30:00Z`, con zona opcional) o formato MySQL (`2026-01-15 10:30:00`); sin zona se interpreta como hora local del servidor y la respuesta usa ISO UTC. `loan_amount` debe ser mayor que 0, tener máximo 2 decimales y llegar hasta `9999999999.99`; `interest_rate` va de 0 a `999.9999`.

`PATCH` reemplaza solo los arreglos enviados y exige `installments` cuando cambian `loan_amount`, `interest_rate` o `interest_payment_mode`. Los pagos de cuotas o un interés pagado bloquean los cambios y la eliminación con `409`.

### Pagos

Hay dos rutas explícitas y no existe un `POST /api/payments` genérico. Ambas reciben `loan_id` y `amount`; `paid_at` es opcional y debe ser ISO 8601 con zona; si se omite se usa la hora del servidor.

`POST /api/payments/installment`:

```json
{
  "loan_id": 35,
  "installment_id": 161,
  "amount": 200,
  "paid_at": "2026-02-15T10:30:00Z"
}
```

`POST /api/payments/interest` para un préstamo en modo `separate`:

```json
{
  "loan_id": 35,
  "loan_interest_payment_id": 17,
  "amount": 200
}
```

Cada ruta exige su propio identificador de destino; el campo de la otra ruta se ignora. El monto debe ser exactamente el pendiente (`amount_due` de la cuota o `interest_amount` del préstamo); no se aceptan abonos parciales. `recorded_by` se toma del usuario autenticado en el JWT, no del cuerpo, y se devuelve junto con `recordedBy` en la respuesta `201`. Un destino ajeno al préstamo responde `404`, un destino ya pagado responde `409` y un monto distinto responde `400`. Los listados y el detalle respetan el mismo filtro de prestamista que `/api/loans`.

`PATCH /api/payments/:id` solo corrige `paid_at` (`{ "paid_at": "2026-02-16T09:15:00Z" }`). `DELETE /api/payments/:id` revierte el pago en una transacción: elimina el vínculo de la cuota o nulifica el del interés, deja el destino en `pending`, elimina el registro en `loan_payments` y responde `204`. Después de la reversión el préstamo vuelve a aceptar cambios financieros y eliminación.

Passport sigue configurado en `src/server/config/passport.js` pero la API actual no lo usa; la autenticación se resuelve con JWT.