---
name: admin
description: Client admin shell, /admin routes, RequireAdmin guard, and the contract for future admin domain phases.
---

# admin

Panel de administración del cliente. La autoridad es la API: `/api/admin/*`
está protegido por `requireAdmin` (ver módulo `auth`). El guard del cliente solo
evita mostrar interfaces que el usuario no puede usar.

El historial de cambios está en [`CHANGELOG.md`](CHANGELOG.md).

## Rutas

`src/client/main.jsx` registra `/admin` dentro de `RequireAuth`, después aplica
`RequireAdmin` y monta `AdminLayout`:

| Ruta | Vista | Archivo | Estado |
| --- | --- | --- | --- |
| `/admin` | redirección | `src/client/main.jsx` | va a `/admin/dashboard` |
| `/admin/dashboard` | `AdminDashboard` | `src/client/views/admin/AdminDashboard.jsx` | stub |
| `/admin/users` | `AdminUsers` | `src/client/views/admin/AdminUsers.jsx` | implementado |
| `/admin/stakeholders` | `AdminStakeholders` | `src/client/views/admin/AdminStakeholders.jsx` | implementado |
| `/admin/loans` | `AdminLoans` | `src/client/views/admin/AdminLoans.jsx` | implementado |
| `/admin/payments` | `AdminPayments` | `src/client/views/admin/AdminPayments.jsx` | implementado |

## Permisos

`RequireAdmin` (`src/client/contexts/AuthContext.jsx`) espera la hidratación de
la sesión, redirige a `/login` si no hay usuario y a `/loans` si
`user.Role.role_name` no es `admin`. Lee el usuario cargado por
`GET /api/users/auth`; no hace verificaciones propias contra la API.
`LoanListHeader` muestra el enlace `Admin` solo cuando ese mismo valor es
`admin`. Un `403` del backend sigue siendo la última línea de defensa.

## Componentes

- `src/client/layouts/AdminLayout.jsx`: shell con título, `AdminNav` y `Outlet`.
- `src/components/admin/AdminNav.jsx`: navegación con `NavLink`; el activo usa
  `buttonVariants` con `variant="default"` y los demás con `"outline"`.
- `src/components/admin/AdminPlaceholder.jsx`: tarjeta compartida por los stubs.
- `src/components/admin/users/`: UI de usuarios (`AdminUsersHeader`,
  `AdminUsersAlerts`, `AdminUsersTable`, `AdminUserRow` y
  `AdminUserEditDialog`). La tabla lista desde `GET /api/users`; el diálogo
  envía `PATCH /api/admin/users/:userId` para rol y estado y, si hay persona
  vinculada, `PUT /api/stakeholders/:id` para sus datos.
- `src/components/admin/stakeholders/`: UI de stakeholders
  (`AdminStakeholdersHeader`, `AdminStakeholdersAlerts`,
  `AdminStakeholdersTable`, `AdminStakeholderRow`,
  `StakeholderFormFields`, `AdminStakeholderFormDialog` y
  `DeleteStakeholderDialog`). Usa los endpoints existentes de
  `/api/stakeholders` para crear, editar y eliminar; `StakeholderFormFields` se
  reutiliza también en el diálogo de usuarios. La tabla oculta las personas
  vinculadas a cuentas.
- `src/client/hooks/useAdminLoans.js` y `src/components/admin/loans/`
  (`AdminLoansHeader`, `AdminLoansAlerts`, `AdminLoansTable`, `AdminLoanRow` y
  `ReassignLenderDialog`): listan préstamos con `GET /api/loans` y reasignan el
  prestamista con `PATCH /api/loans/:id`. Las opciones del diálogo vienen de
  `GET /api/users` filtrado a cuentas con rol `lender`; se excluye al cliente
  del préstamo y se muestran estados de carga, error y éxito.
- `src/client/hooks/useAdminPayments.js` y `src/components/admin/payments/`
  (`AdminPaymentsHeader`, `AdminPaymentsAlerts`, `AdminPaymentsTable`,
  `AdminPaymentRow` y `AdminPaymentRecordDialog`): listan pagos con
  `GET /api/payments`, registran cuotas o interés pendiente con los endpoints
  existentes y reutilizan `usePaymentRevert` con `RevertPaymentDialog` para la
  reversión. Las opciones de registro salen de `GET /api/loans`.
- `src/client/views/admin/*.jsx`: las fases de dominio reemplazan solo el
  contenido de su archivo; `/admin/users`, `/admin/stakeholders`,
  `/admin/loans` y `/admin/payments` ya no son stubs.
- `src/components/loans/list/LoanListHeader.jsx`: enlace `Admin` para admins.

## Contrato de fases posteriores

- P3 users: `/admin/users` reutiliza `GET /api/users` para listar y usa
  `PATCH /api/admin/users/:userId` para cambiar `role_name` e `is_active`.
  El mismo diálogo edita los datos del stakeholder vinculado con
  `GET /api/stakeholders/:id` y `PUT /api/stakeholders/:id`; si la cuenta no
  tiene persona vinculada solo se muestran rol y estado. No hay un `GET`
  duplicado bajo `/api/admin/users` ni un endpoint combinado.
- P4 stakeholders: el panel reutiliza el CRUD de `/api/stakeholders`. `POST`,
  `PUT`, `PATCH` y `DELETE` usan `requireAdmin`; ambos `GET` siguen disponibles
  para cualquier cuenta autenticada y los formularios de préstamos no cambian.
  La vista oculta las personas referenciadas por `user.stakeholder_id`, sin
  filtrar la API.
- P5 loans: `POST`, `PUT` y `PATCH` de `/api/loans` aplican
  `requireAdminForLenderChange`; la vista admin lista con `GET /api/loans` y
  reasigna prestamistas con `PATCH /api/loans/:id`, sin endpoints bajo
  `/api/admin`. El desplegable solo ofrece cuentas con rol `lender` leídas de
  `GET /api/users`; el listado y el diálogo reutilizan los helpers de formato de
  `loans` y los primitivos shadcn existentes.
- P6 payments: `/admin/payments` lista `GET /api/payments` para `admin` y usa
  `GET /api/loans` para ofrecer solo cuotas pendientes e interés separado sin
  pagar. El registro envía `POST /api/payments/installment` o
  `POST /api/payments/interest` con el monto calculado por el destino; la
  reversión reutiliza `DELETE /api/payments/:id` mediante `usePaymentRevert`.
  No hay `POST /api/payments` genérico ni endpoints duplicados bajo `/admin`.
- P7 dashboard: métricas calculadas en el cliente desde `GET /api/loans` y
  `GET /api/payments`, sin un endpoint propio.
- No se duplican funcionalidades bajo `/admin`; solo la administración de
  usuarios vive en ese prefijo.

## Archivos

- `src/client/main.jsx`
- `src/client/contexts/AuthContext.jsx`
- `src/client/layouts/AdminLayout.jsx`
- `src/components/admin/AdminNav.jsx`
- `src/components/admin/AdminPlaceholder.jsx`
- `src/components/admin/users/`
- `src/components/admin/stakeholders/`
- `src/components/admin/loans/`
- `src/components/admin/payments/`
- `src/client/hooks/useAdminUsers.js`
- `src/client/hooks/useAdminStakeholders.js`
- `src/client/hooks/useAdminLoans.js`
- `src/client/hooks/useAdminPayments.js`
- `src/client/utils/userForm.js`
- `src/client/utils/stakeholderForm.js`
- `src/client/views/admin/`
- `src/components/loans/list/LoanListHeader.jsx`
