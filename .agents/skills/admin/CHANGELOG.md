# Changelog — admin

## 2026-11-25 — Reasignación limitada a cuentas lender

- Change: `useAdminLoans` dejó de usar `GET /api/stakeholders` para las opciones
  de prestamista y ahora filtra `GET /api/users` por `Role.role_name = "lender"`.
- Impact: `/admin/loans` solo ofrece prestamistas vinculados a una cuenta con ese
  rol; se conservan las cuentas inactivas y se deduplican resultados. El payload
  de `PATCH /api/loans/:id` no cambia.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-25 — P5 préstamos implementado

- Change: `/admin/loans` dejó de ser stub. Se añadieron `useAdminLoans` y cinco
  componentes bajo `src/components/admin/loans/` para listar préstamos y abrir
  un diálogo de reasignación de prestamista.
- Impact: la vista usa `GET /api/loans` (global para `admin`) y
  `PATCH /api/loans/:id` con `lender_id`, sin duplicar endpoints bajo
  `/api/admin`. El diálogo excluye al cliente actual y valida la selección antes
  de enviar.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-25 — Ajustes de edición en users y stakeholders

- Change: `/admin/stakeholders` oculta a las personas vinculadas a cuentas y el
  diálogo de `/admin/users` combina rol/estado con los datos del stakeholder
  vinculado, reutilizando `StakeholderFormFields` y los endpoints existentes.
- Impact: los prestamistas y administradores ya no aparecen como stakeholders
  administrables, pero sus datos se editan desde su cuenta. El guardado sigue
  siendo en dos pasos (`PATCH` de usuario y `PUT` de stakeholder), con aviso
  explícito si el segundo falla.
- Verification: `pnpm build` compiló correctamente (2564 módulos). No se probó en
  navegador ni contra un servidor, a pedido del usuario.

## 2026-11-25 — P4 stakeholders implementado

- Change: `/admin/stakeholders` dejó de ser stub. Se añadió
  `useAdminStakeholders`, `src/client/utils/stakeholderForm.js` y seis componentes
  bajo `src/components/admin/stakeholders/` para crear, editar y eliminar con
  los endpoints existentes de `/api/stakeholders`.
- Impact: el panel ofrece CRUD completo sin duplicar rutas bajo `/api/admin`.
  Las mutaciones requieren `admin`; los `GET` siguen abiertos a cuentas
  autenticadas para los formularios de préstamos.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-25 — P3 usuarios implementado

- Change: `/admin/users` dejó de ser stub. Se añadió `useAdminUsers`, helpers en
  `src/client/utils/userForm.js` y los componentes bajo
  `src/components/admin/users/` para listar, actualizar y mostrar errores. El
  listado reutiliza `GET /api/users`; el cambio de rol y estado usa
  `PATCH /api/admin/users/:userId`.
- Impact: los administradores pueden editar cuentas desde el panel sin tocar el
  router. La API sigue siendo la autoridad: `requireAdmin` protege la mutación.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-25 — Shell del panel de administración

- Change: Se añadió `RequireAdmin`, el layout `AdminLayout`, `AdminNav`,
  `AdminPlaceholder`, cinco vistas stub bajo `src/client/views/admin/` y el
  enlace `Admin` en `LoanListHeader`. `main.jsx` registra `/admin` y sus hijos
  detrás de `RequireAuth` y `RequireAdmin`.
- Impact: solo las cuentas `admin` pueden abrir el panel; los no admins vuelven
  a `/loans`. Las fases de dominio posteriores solo reemplazan el contenido de
  las vistas stub. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.
