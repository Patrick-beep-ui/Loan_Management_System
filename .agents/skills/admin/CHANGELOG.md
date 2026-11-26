# Changelog — admin

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
