# Loan Management System

A web application for managing loans, from disbursement through the last
installment payment. The system brings together in one place who lends the
money, who receives it, which guarantors or assets back the loan, and how
payments have been applied.

The goal is to **replace manual loan tracking** with a record that lets you
check the balance of each installment, identify due dates, and see when each
payment was received and who recorded it.

## Scope

- Register loans with their amount, ordinary interest rate, disbursement date,
  installment schedule, guarantors, collateral, and interest mode (included in
  the installments or charged separately).
- Record the full payment of an installment or of the separately charged
  ordinary interest obligation, with the date and the user who recorded it.
- Identify pending, paid, overdue, or rescheduled installments from their due
  dates and statuses.
- Query a person's loan history as a customer, lender, or guarantor.

## Entities

| Entity | What it represents |
| --- | --- |
| `stakeholders` | People involved in loans. The same person can be a customer in one loan and a guarantor in another. |
| `users` | Access accounts linked to a person, with `is_active` for deactivation and `must_change_password` for forced password changes. |
| `roles` | Access roles: `admin` and `lender`. |
| `loans` | A loan linking a lender with a customer, recording the disbursement terms and the interest mode (`included`/`separate`). |
| `loan_installments` | Loan installments. Each has its own amount, due date, and status. |
| `loan_guarantors` | People acting as guarantors for a specific loan. |
| `loan_collaterals` | Assets pledged as collateral, with a description and estimated value when known. |
| `loan_payments` | Payments received, with their amount, date, and recording user. |
| `installment_payments` | Links a payment to the installment it is applied to. The API records one full payment per installment. |
| `loan_interest_payments` | Ordinary interest obligation per loan: pending (`payment_id` is null) or paid. |

## Technologies

React and Vite for the interface, Express for the API, and MySQL with Sequelize
for data access. Vite Express serves the interface and the API from the same
server.

- React 19 and Vite 6 (with `@vitejs/plugin-react`).
- React Router 7 for client-side routing.
- Tailwind CSS 4 (`@tailwindcss/vite`), shadcn components over Base UI
  primitives, `class-variance-authority`, `lucide-react`, and the Playfair
  Display and Montserrat fonts from Google Fonts.
- Express 5 with ES modules (`"type": "module"`).
- MySQL through Sequelize 6 and `mysql2`.
- Authentication with JWT (`jsonwebtoken`) and `bcryptjs`.
- Package manager: pnpm.

## Requirements

- Node.js with `--env-file` support (Node 20 or newer).
- pnpm.
- An accessible MySQL server with an existing database.

## Configuration

Credentials are read from `.env` in the project root:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=...
DB_NAME=loan_management_system
JWT_SECRET=...
JWT_EXPIRES_IN=1h
```

The first admin is provisioned with a seed script, not a public endpoint. Add
these variables to `.env` before running it (they are only used by the seed):

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=...
ADMIN_STAKEHOLDER_ID=1
```

`ADMIN_STAKEHOLDER_ID` must be the ID of an existing stakeholder that is not
already linked to a user.

## Commands

```bash
pnpm install   # install dependencies
pnpm dev       # start the development server at http://localhost:3000
pnpm build     # build the interface with Vite into dist/
pnpm start     # start the server in production mode
pnpm seed:admin # create the first admin account
```

`pnpm dev` runs nodemon over `src/server`, loading `.env` with
`node --env-file=.env`.

### Initial setup

1. Create the database and apply the SQL files in `database/migrations/` in
   chronological order. Models never call `sequelize.sync()`.
2. Ensure the `admin` and `lender` roles exist (see the roles migration) and
   create or choose the stakeholder that will be linked to the first admin.
3. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_STAKEHOLDER_ID` in `.env` and
   run `pnpm seed:admin`. The seed refuses to run if an admin already exists.
4. Sign in with those credentials. The account is created with
   `must_change_password = true`, so the application redirects to
   `/change-password` and blocks the rest of the API until a new password is
   set.
5. From then on, admins create `admin` and `lender` accounts from
   `/admin/users`. Public signup does not exist.

## Architecture

The API is organized in layers: `routes → controllers → services → models`.

- **Routes** define the method and URL and delegate to the controller.
- **Controllers** receive `req`/`res`, pass data to the service, and build the
  response.
- **Services** contain the business logic and know nothing about HTTP, so they
  can be tested in isolation.
- **Models** map the MySQL tables with Sequelize.

Payload validation and normalization live in `src/server/utils/validators/`,
organized by module. Shared helpers (`common.js`) handle positive integers,
optional strings, and finite numbers; each domain validator builds the
attributes the service receives. For partial updates the validator also
receives the stored record so it can resolve rules that depend on the current
state; services only persist and enforce payment-related conflicts.

Each router is registered in `src/server/api.js`. Services throw typed errors
(defined in `src/server/utils/errors.js`) that controllers translate into HTTP
status codes.

`/api/auth` (login) is public. `checkAuth` is applied after that router, so
everything registered below it (`/api/admin`, `/api/users`, `/api/roles`,
`/api/stakeholders`, `/api/loans`, `/api/payments`) requires
`Authorization: Bearer <token>`. `checkAuth` verifies the JWT and queries
`users`/`Role` to rebuild `req.user` with the current role, stakeholder, and
`must_change_password` flag from the database: an account with
`is_active = false` responds `401`. The JWT itself contains `user_id`,
`role_id`, `role_name`, and `stakeholder_id`.

`requirePasswordChanged` runs after `checkAuth`. When `must_change_password` is
true it only allows `GET /api/users/auth` (session hydration) and
`PATCH /api/users/me/password`; every other route responds
`403 Password change required`. Because the flag is read from the database on
every request, an admin password reset blocks existing tokens immediately.

`/api/admin` is additionally protected by `requireAdmin` (admin only) and
provides `POST /users` (create), `POST /users/:userId/reset-password`, and
`PATCH /users/:userId` (role and status). The listing remains at
`GET /api/users`. An admin cannot demote or deactivate the last active admin.
`requireAdmin` also protects `POST`, `PUT`, `PATCH`, and `DELETE` of
`/api/stakeholders`, while its `GET`s remain available to any authenticated
account. `requireAdminForLenderChange` prevents a `lender` from assigning a
lender other than themselves in `POST`, `PUT`, and `PATCH` of `/api/loans`.
Loan and payment routes restrict data to the stakeholder linked to a `lender`
account; `admin` keeps global access and may choose any lender when creating
loans.

## Frontend

The React client starts in `src/client/main.jsx`, where `createBrowserRouter`
defines the routes and `RouterProvider` mounts the application. `AuthProvider`
is the root layout, `RequireAuth` protects loan routes and `/change-password`,
and `RequireAdmin` protects `/admin`. Views live in `src/client/views/`,
reusable primitives in `src/components/ui/`, and domain components in
`src/components/<domain>/`, grouped by purpose when there is more than one
flow.

| Route | View | Access |
| --- | --- | --- |
| `/` | `App` (initial Vite demo) | public |
| `/login` | `Login` | public |
| `/change-password` | `ChangePassword` | protected, forced |
| `/loans` | `Loan` | protected |
| `/create-loan` | `CreateLoan` | protected |
| `/loans/:id` | `LoanDetails` | protected |
| `/loans/:id/edit` | `EditLoan` | protected |
| `/admin` | redirect to `/admin/dashboard` | admin |
| `/admin/dashboard` | `AdminDashboard` | admin |
| `/admin/users` | `AdminUsers` | admin |
| `/admin/stakeholders` | `AdminStakeholders` | admin |
| `/admin/stakeholders/:id` | `AdminStakeholderProfile` | admin |
| `/admin/loans` | `AdminLoans` | admin |
| `/admin/payments` | `AdminPayments` | admin |
| `/test` | `Test` (test view) | public |

`Login` consumes `/api/auth` through `src/lib/axiosService.js` (`api.post`):
it validates the fields and shows loading and error states with `Card`,
`Input`, `Label`, and `Button`. The service centralizes `baseURL`
(`VITE_API_URL` or `http://localhost:3000/api`), a request interceptor that
sends `Authorization: Bearer <token>` from `localStorage`, and a response
interceptor that clears the token and emits `auth:unauthorized` on `401`
(except on `/auth/login` and `/users/me/password`, so credential errors are not
hidden).
`src/client/contexts/AuthContext.jsx` exposes `AuthProvider`, `useAuth()`,
`RequireAuth`, and `RequireAdmin`: the session is hydrated with
`GET /api/users/auth`; loan routes and `/change-password` are protected,
`/admin/*` requires the `admin` role, and the rest are public. `login(token)`
and `refreshUser()` return the `must_change_password` flag. `RequireAuth`
redirects a user with that flag to `/change-password` unless they are already
there. `ChangePassword` submits `{ current_password, new_password }` to
`PATCH /api/users/me/password`, refreshes the session, and navigates to the
original route or `/loans`.

`Loan` composes the listing from `src/components/loans/list/` with the
`useLoans` hook and `api.get("/loans")` (ID, lender, customer, amount, rate,
mode, date, and total), with loading, empty, and error states and formats in
`src/client/utils/loanFormat.js`; it uses `useAuth().user` only for the name
and role, because the backend filters by JWT. `CreateLoan` is a two-step form
composed from `src/components/loans/create/`: the `useCreateLoanForm` hook
loads stakeholders, manages state, and validates with
`src/client/utils/loanForm.js`, `CreateLoanForm` gathers the fields,
guarantors, and collateral, and `InstallmentPreview` shows the installments
calculated by `src/client/utils/loanSchedule.js` before sending
`POST /api/loans`; `Loan` includes the `New loan` button and a success notice.
`LoanDetails` composes `src/components/loans/details/` with `useLoanDetails`
and `api.get("/loans/:id")`: it shows the summary, installments, guarantors,
collateral, and interest, allows editing always and deletion only when there
are no payments, and supports recording and reverting payments from the
components in `src/components/payments/`. `LoanInstallmentsTable` marks
date-overdue installments and, when the route state contains
`focusInstallmentId`, highlights and scrolls to that specific installment.
`EditLoan` reuses the creation form
without payments and a restricted form when payments exist (guarantors,
collateral, and, for admins, the lender), created from
`src/components/loans/edit/`.

## Admin panel

The client panel lives under `/admin` and uses `AdminLayout`
(`src/client/layouts/`), `AdminNav` (`src/components/admin/`), and views in
`src/client/views/admin/`. `RequireAdmin`, defined in `AuthContext.jsx`,
redirects non-admins to `/loans`; real authorization stays in the API, where
`/api/admin/*` is protected by `requireAdmin`. `LoanListHeader` shows the
`Admin` link only to admins.

`/admin/users` lists accounts with `useAdminUsers`. The edit dialog changes
role, status, and the linked stakeholder's data; the `New user` dialog creates
an `admin` or `lender` account with `POST /api/admin/users` after choosing an
email, role, and a stakeholder not yet linked to a user, then displays the
one-time temporary password. Each row can also reset a password with
`POST /api/admin/users/:userId/reset-password`, showing the new temporary
password once. Accounts with `must_change_password = true` are marked as
having a password pending.

`/admin/stakeholders` uses `useAdminStakeholders` for the existing
`/api/stakeholders` CRUD and lists every person, including stakeholders linked
to accounts. The table design and its `Edit` and `Delete` actions are
unchanged; each name links to `/admin/stakeholders/:id`. That profile uses
`useAdminStakeholderProfile` and `src/client/utils/stakeholderProfile.js` to
combine `GET /api/stakeholders/:id`, `GET /api/loans`, and `GET /api/users` on
the client: it shows personal information, the linked account, counts by role,
and one row per associated loan with all applicable lender, customer, and
guarantor roles. A loan can give the same stakeholder more than one role.
Collateral remains an asset with no stakeholder link in the schema.
`/admin/loans` uses `useAdminLoans` to list all loans and reassign the lender
with `PATCH /api/loans/:id`, with options from `GET /api/users` filtered to
`lender` accounts. `/admin/payments` uses `useAdminPayments` for the global
history from `GET /api/payments`, records pending installments or interest from
`GET /api/loans`, and reverts payments with `usePaymentRevert` and
`RevertPaymentDialog`. `/admin/dashboard` uses `useAdminDashboard` and
`src/client/utils/adminDashboard.js` to aggregate loan, installment, interest,
payment, and stakeholder metrics from `GET /api/loans`, `GET /api/payments`,
and `GET /api/stakeholders`, with no dedicated endpoint. The same data produces
a list of overdue installments sorted by due date; each item links to
`/loans/:id` with `state.focusInstallmentId` so the specific installment is
highlighted on the detail page. A compact stakeholder card links names to
their profiles and offers a `Manage stakeholders` action.
`src/client/utils/loanStatus.js` is the shared date-overdue rule for the card,
the list, and the detail badge; `stakeholderProfile.js` supplies the stakeholder
summaries.

| Route | View | Status |
| --- | --- | --- |
| `/admin` | redirect to `/admin/dashboard` | shell |
| `/admin/dashboard` | `AdminDashboard` | implemented |
| `/admin/users` | `AdminUsers` | implemented |
| `/admin/stakeholders` | `AdminStakeholders` | implemented |
| `/admin/stakeholders/:id` | `AdminStakeholderProfile` | implemented |
| `/admin/loans` | `AdminLoans` | implemented |
| `/admin/payments` | `AdminPayments` | implemented |

No functionality is duplicated under `/admin`; only user administration lives
under that prefix. The detailed contract is in
[`.agents/skills/admin/SKILL.md`](.agents/skills/admin/SKILL.md).

## Project structure

```text
components.json             shadcn configuration (aliases, style, CSS)
jsconfig.json               alias `@/*` → `./src/*`
vite.config.js              Vite plugins and alias `@` → `./src`

database/
├─ migrations/
│  ├─ 2026-11-16-loan-interest-payment-mode.sql
│  ├─ 2026-11-17-rename-operator-role-to-lender.sql
│  ├─ 2026-11-25-admin-user-management.sql
│  └─ 2026-11-26-user-provisioning.sql
└─ seeds/
   └─ createFirstAdmin.js   provisions the first admin from ADMIN_* variables

src/
├─ client/                  React interface (Vite)
│  ├─ main.jsx              entry, routes, `RequireAuth` and `RequireAdmin`
│  ├─ App.jsx               main component (Vite demo)
│  ├─ App.css / index.css   base styles and Tailwind/shadcn tokens
│  ├─ contexts/             AuthContext: provider, hook, and guards
│  ├─ hooks/                useLoans, useLoanFormState, useCreateLoanForm, useLoanDetails,
│  │                       useEditLoanForm, useLoanPayment, usePayments, usePaymentRevert,
│  │                       useChangePassword, useAdminUsers, useAdminStakeholders,
│  │                       useAdminStakeholderProfile, useAdminLoans,
│  │                       useAdminPayments, useAdminDashboard
│  ├─ layouts/              `AdminLayout` shell
│  ├─ Test.jsx              test view (/test)
│  ├─ views/                Login, ChangePassword, Loans, CreateLoan, LoanDetails, EditLoan
│  │  └─ admin/             panel views: Dashboard, Users, Stakeholders,
│  │                        Stakeholder profile, Loans, Payments
│  ├─ utils/                loanFormat, loanStatus, loanForm, loanSchedule, loanEdit,
│  │                       loanPayment, paymentHistory, userForm, stakeholderForm,
│  │                       adminDashboard, stakeholderProfile
│  └─ assets/
├─ components/
│  ├─ admin/                AdminNav, AdminPlaceholder, users/, stakeholders/, loans/,
│  │                       payments/, and dashboard/ (tables, shared fields, forms,
│  │                       reassignment, recording, metrics, confirmations)
│  ├─ loans/                loan components grouped by purpose
│  │  ├─ create/            form, guarantors, collateral, and preview
│  │  ├─ list/              header, notices, and listing table
│  │  ├─ details/           summary, tables, notices, and delete confirmation
│  │  └─ edit/              header, errors, notice, and restricted form with payments
│  ├─ payments/             payment modals, history, reversal, and notices
│  └─ ui/                   shadcn components: button, card, dialog, input, label,
│                           select, table, textarea
├─ lib/
│  ├─ axiosService.js       axios instance with token interceptor
│  └─ utils.js              re-exports `cn`
└─ server/                  Express API
   ├─ main.js               server, mounts /api and listens on port 3000
   ├─ api.js                global router: /auth, then checkAuth +
   │                        requirePasswordChanged + /admin, /users, /roles,
   │                        /stakeholders, /loans, /payments
   ├─ config/
   │  ├─ connection.js      Sequelize connection to MySQL
   │  └─ passport.js        local and JWT strategies (unused by the current API)
   ├─ controllers/          intermediaries between routes and services
   ├─ middlewares/
   │  ├─ checkAuth.js       requires a token and validates the account in the database
   │  ├─ requirePasswordChanged.js blocks routes while a password change is pending
   │  ├─ requireAdmin.js    requires the admin role
   │  └─ requireAdminForLenderChange.js
   ├─ services/             business logic and operations
   ├─ routes/               method and URL definitions
   ├─ utils/
   │  ├─ errors.js              typed errors (AppError, ValidationError, UnauthorizedError,
   │  │                        ForbiddenError, ConflictError, NotFoundError)
   │  ├─ generateToken.js       signs the JWT
   │  ├─ temporaryPassword.js   generates one-time temporary passwords
   │  └─ validators/
   │     ├─ common.js              shared helpers (integers, optional strings, numbers)
   │     ├─ authValidation.js      auth payload validation/normalization
   │     ├─ adminUserValidation.js user creation and administration validation
   │     ├─ loanValidation.js      loan and relation validation/parsing
   │     ├─ paymentValidation.js   payment validation/parsing
   │     └─ stakeholderValidation.js stakeholder validation/parsing
   └─ models/
      ├─ Role.js               roles table
      ├─ User.js               users table
      ├─ Stakeholder.js        stakeholders table
      ├─ Loan.js               loans table
      ├─ LoanInstallment.js    loan_installments table
      ├─ LoanGuarantor.js      loan_guarantors table
      ├─ LoanCollateral.js     loan_collaterals table
      ├─ LoanPayment.js        loan_payments table
      ├─ InstallmentPayment.js installment_payments table
      ├─ LoanInterestPayment.js loan_interest_payments table
      └─ associations.js       model relationships
```

Module documentation lives in [`.agents/skills/`](.agents/skills/); each module
has a `SKILL.md` and a `CHANGELOG.md`.

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/roles` | Lists registered roles. Requires token. |
| `GET` | `/api/users` | Lists users with their stakeholder and role. Requires token. |
| `GET` | `/api/users/auth` | Returns the authenticated user, including `must_change_password`. Requires token. |
| `PATCH` | `/api/users/me/password` | Changes the authenticated user's password and clears `must_change_password`. Requires token. |
| `POST` | `/api/admin/users` | Creates an `admin` or `lender` account with a one-time temporary password. Admin only. |
| `POST` | `/api/admin/users/:userId/reset-password` | Generates a new one-time temporary password. Admin only. |
| `PATCH` | `/api/admin/users/:userId` | Changes a user's `role_name` and `is_active`. Admin only. |
| `GET` | `/api/stakeholders` | Lists stakeholders ordered by last and first name. Requires token. |
| `GET` | `/api/stakeholders/:id` | Returns a stakeholder. Requires token. |
| `POST` | `/api/stakeholders` | Creates a stakeholder; requires `first_name` and `last_name`. Requires token. |
| `PUT` | `/api/stakeholders/:id` | Replaces a stakeholder; omitted optional fields become `null`. Requires token. |
| `PATCH` | `/api/stakeholders/:id` | Updates only the sent fields. Requires token. |
| `DELETE` | `/api/stakeholders/:id` | Deletes a stakeholder; responds `409` if referenced. Requires token. |
| `GET` | `/api/loans` | Lists the authenticated lender's loans (all for `admin`). Requires token. |
| `GET` | `/api/loans/:id` | Returns an own loan with its relations, or `404` if it belongs to another lender. Requires token. |
| `POST` | `/api/loans` | Creates a loan with `installments`, `guarantors`, and `collaterals` in a transaction. Requires `customer_id`, `loan_amount`, `interest_payment_mode`, and `disbursed_at`; `lender_id` is derived for a `lender` (another value responds `403`) and selectable by `admin`. Requires token. |
| `PUT` | `/api/loans/:id` | Replaces an own loan and all its relations; requires the three arrays. Requires token. |
| `PATCH` | `/api/loans/:id` | Updates only the sent fields or arrays; financial changes require `installments`. A `lender` cannot change `lender_id`. With payments only `guarantors` and `collaterals`, plus `lender_id` for `admin`, are allowed. Requires token. |
| `DELETE` | `/api/loans/:id` | Deletes an own loan and its relations; responds `409` if it has payments. Requires token. |
| `GET` | `/api/payments` | Lists payments visible to the user, with optional `?loan_id`. Requires token. |
| `GET` | `/api/payments/:id` | Returns a payment with its applied installment or interest. Requires token. |
| `POST` | `/api/payments/installment` | Records the full payment of an installment. Requires token. |
| `POST` | `/api/payments/interest` | Records payment of separate interest. Requires token. |
| `PATCH` | `/api/payments/:id` | Corrects only `paid_at` of a payment. Requires token. |
| `DELETE` | `/api/payments/:id` | Reverts a payment, restores the installment or interest to `pending`, and responds `204`. Requires token. |
| `POST` | `/api/auth/login` | Signs in with `email` and `password`; responds `{ token, user }` with a 1-hour JWT including `role_name`, `stakeholder_id`, and `must_change_password`. |
| `GET` | `/hello` | Simple server health check. |

Public signup has been removed: accounts can only be created by an admin, or
by `pnpm seed:admin` for the very first admin. Routes marked "Requires token"
expect `Authorization: Bearer <token>`; without a token or with an invalid one
they respond `401`. Successful login responds `200` and bad credentials `401`.
While `must_change_password` is true, only session hydration and the password
change route respond; everything else responds `403 Password change required`.

### Creating users

`POST /api/admin/users` receives `{ email, stakeholder_id, role_name }`, where
`role_name` is `admin` or `lender`. The stakeholder must exist and must not be
linked to another account. The response is `201` with the created user
projection plus a one-time `temporary_password`:

```json
{
  "user_id": 12,
  "email": "lender@example.com",
  "role_id": 2,
  "role_name": "lender",
  "is_active": true,
  "must_change_password": true,
  "stakeholder_id": 9,
  "temporary_password": "AbCdEfGhIjKlMnOpQrStUvWx"
}
```

`POST /api/admin/users/:userId/reset-password` takes no body and responds `200`
with the same projection and a new temporary password. In both cases the
password is hashed with bcrypt (10 rounds) and shown only once; the account
must change it through `PATCH /api/users/me/password` before other API routes
become available. A duplicate email, unknown role or stakeholder, or an
already-linked stakeholder responds `409`. Demoting or deactivating the last
active admin responds `409 Cannot demote or deactivate the last active admin`.

### Loans

`POST` and `PUT` receive the loan together with `installments`, `guarantors`,
and `collaterals`:

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
    { "description": "Vehicle", "estimated_value": 5000 }
  ]
}
```

Installments must be numbered from 1, have unique ascending dates, and equal
amounts except for the last one. Interest is calculated as
`round(loan_amount * interest_rate / 100, 2)` and `total_to_pay` is
`loan_amount + interest_amount`. In `included` mode the installments add up to
`total_to_pay` and no interest record is created; in `separate` mode they add
up to `loan_amount` and a pending obligation is created in
`loan_interest_payments`. `separate` requires `interest_rate > 0`.

Each guarantor can reference an existing `stakeholder_id` or send the fields
of a new stakeholder, but not both. The `national_id` of an inline stakeholder
must be unique: repeating a registered one responds `409`. Collateral requires
a `description` and accepts an optional `estimated_value`. Responses include
`interest_amount`, `total_to_pay`, sorted installments, guarantors, collateral,
and `interestPayment`.

For a `lender` account, `lender_id` must be the stakeholder linked to the
user: the service derives it from the JWT and responds `403` if another value
is sent. A loan belonging to another lender responds `404` even if the `:id`
exists. `admin` users keep global access and may specify any `lender_id`. In
`POST`, `PUT`, and `PATCH`, a `lender` sending another lender receives
`403 Only admins can change the lender`.

`disbursed_at` must include a time and accepts ISO 8601
(`2026-01-15T10:30:00Z`, with optional zone) or MySQL format
(`2026-01-15 10:30:00`); without a zone it is interpreted as server local time
and the response uses UTC ISO. `loan_amount` must be greater than 0, have at
most 2 decimals, and be no larger than `9999999999.99`; `interest_rate` ranges
from 0 to `999.9999`.

`PATCH` replaces only the arrays sent and requires `installments` when
`loan_amount`, `interest_rate`, or `interest_payment_mode` change. With paid
installments or paid interest, `PATCH` only accepts `guarantors` and
`collaterals`, plus `lender_id` for `admin`; any other field responds `409`.
`PUT` and `DELETE` stay blocked with `409` while payments exist.

### Payments

There are two explicit routes and no generic `POST /api/payments`. Both receive
`loan_id` and `amount`; `paid_at` is optional and must be ISO 8601 with a zone;
if omitted the server time is used.

`POST /api/payments/installment`:

```json
{
  "loan_id": 35,
  "installment_id": 161,
  "amount": 200,
  "paid_at": "2026-02-15T10:30:00Z"
}
```

`POST /api/payments/interest` for a loan in `separate` mode:

```json
{
  "loan_id": 35,
  "loan_interest_payment_id": 17,
  "amount": 200
}
```

Each route requires its own destination ID; the other route's field is
ignored. The amount must match exactly the pending amount (`amount_due` of the
installment or `interest_amount` of the loan); partial payments are not
accepted. `recorded_by` comes from the authenticated user in the JWT, not from
the body, and is returned along with `recordedBy` in the `201` response. A
destination outside the loan responds `404`, an already-paid destination
responds `409`, and a wrong amount responds `400`. Listings and details respect
the same lender filter as `/api/loans`.

`PATCH /api/payments/:id` only corrects `paid_at`
(`{ "paid_at": "2026-02-16T09:15:00Z" }`). `DELETE /api/payments/:id` reverts
the payment in a transaction: it removes the installment link or clears the
interest link, sets the destination back to `pending`, deletes the
`loan_payments` record, and responds `204`. After a reversal the loan accepts
financial changes and deletion again; before reversing, the client allows
updating guarantors, collateral, and, for admins, the lender through `PATCH`.
The client exposes this reversal from `/loans/:id` and `/admin/payments`, in
both cases with a flow separate from payment recording.

Passport remains configured in `src/server/config/passport.js` but the current
API does not use it; authentication is resolved with JWT.
