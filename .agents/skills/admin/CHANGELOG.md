# Changelog — admin

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
