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
| `/admin/users` | `AdminUsers` | `src/client/views/admin/AdminUsers.jsx` | stub |
| `/admin/stakeholders` | `AdminStakeholders` | `src/client/views/admin/AdminStakeholders.jsx` | stub |
| `/admin/loans` | `AdminLoans` | `src/client/views/admin/AdminLoans.jsx` | stub |
| `/admin/payments` | `AdminPayments` | `src/client/views/admin/AdminPayments.jsx` | stub |

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
- `src/client/views/admin/*.jsx`: stubs; cada fase de dominio reemplaza solo el
  contenido de su archivo.
- `src/components/loans/list/LoanListHeader.jsx`: enlace `Admin` para admins.

## Contrato de fases posteriores

- P3 users: `/admin/users` consume endpoints bajo `/api/admin/users` (todavía
  no implementados).
- P4 stakeholders: las mutaciones usan `requireAdmin`; `GET /api/stakeholders`
  sigue abierto para el formulario de préstamos.
- P5 loans: las rutas de préstamos aplican `requireAdminForLenderChange`; la
  vista admin reutiliza los componentes de `loans`.
- P6 payments: historial, registro y reversión con los endpoints existentes.
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
- `src/client/views/admin/`
- `src/components/loans/list/LoanListHeader.jsx`
