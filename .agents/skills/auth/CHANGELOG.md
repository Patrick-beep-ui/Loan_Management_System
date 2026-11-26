# Changelog — auth

## 2026-11-25 — `requireAdmin` en mutaciones de stakeholders

- Change: `requireAdmin` se aplicó a `POST`, `PUT`, `PATCH` y `DELETE` en
  `stakeholderRoutes.js`. Los dos `GET` siguen protegidos solo por `checkAuth`.
- Impact: las cuentas `lender` pueden leer stakeholders para préstamos, pero
  reciben `403 Admin access required` si intentan modificarlos.
- Verification: `pnpm build` compiló correctamente. Sin pruebas de API en vivo.

## 2026-11-25 — Mutaciones de usuario bajo `/api/admin`

- Change: `AdminRouter` define `PATCH /users/:userId` directamente. `requireAdmin`
  se aplica a todo el router, por lo que `PATCH /api/admin/users/:userId` queda
  restringido al rol `admin`; `checkAuth` sigue resolviendo el rol desde la base
  en cada petición.
- Impact: un `lender` recibe `403 Admin access required`; cambiar el rol o
  desactivar una cuenta surte efecto en la siguiente solicitud.
- Verification: `pnpm build` compiló correctamente. Sin pruebas de API en vivo.

## 2026-11-25 — Guard de admin en el cliente

- Change: `AuthContext.jsx` exporta `RequireAdmin`, que espera la hidratación,
  redirige a `/login` sin sesión y a `/loans` si `user.Role.role_name` no es
  `admin`. `LoanListHeader` usa el mismo valor para mostrar el enlace `Admin`.
- Impact: el panel `/admin` queda oculto para cuentas `lender`; la autorización
  real sigue en `requireAdmin` y en `/api/admin/*`.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

## 2026-11-25 — Sesión validada contra la base y middlewares de admin

- Change: `checkAuth` consulta `users` y `Role` después de verificar el JWT,
  reconstruye `req.user` desde la base y rechaza cuentas con `is_active = false`.
  `login` también rechaza cuentas desactivadas. Se agregaron `requireAdmin` y
  `requireAdminForLenderChange`, y `api.js` monta `AdminRouter` en `/api/admin`,
  que centraliza `requireAdmin` y todavía no define endpoints.
- Impact: los cambios de rol y la desactivación surten efecto de inmediato
  aunque el token siga vigente. `/api/admin/*` queda restringido a `admin` y un
  `lender` no puede asignar un `lender_id` distinto del suyo. El signup público
  no cambia.
- Verification: `pnpm build` y revisión del diff. Sin pruebas de API en vivo ni
  migración aplicada en esta sesión, según la preferencia de verificación.

## 2026-11-17 — Signup solo para lenders e identidad en el JWT

- Change: `validateSignupPayload` ya no exige `role_id`; `authService.signup`
  resuelve el rol `lender` desde `roles` por nombre y lo asigna. `login`
  incluye `role_name` consultando la asociación con `Role`, y `generateToken`
  firma `{ user_id, role_id, role_name, stakeholder_id }`. `checkAuth` expone
  esos cuatro valores en `req.user`.
- Impact: el registro público ya no puede crear cuentas `admin`; los services
  de préstamos pueden derivar el prestamista autenticado. Los tokens emitidos
  antes del cambio no incluyen `role_name` ni `stakeholder_id` y expiran en 1 h.
- Verification: migración aplicada; signup con `role_id: 1` devolvió
  `role_id: 2, role_name: "lender"`; login devolvió `role_name: "lender"` y el
  JWT decodificado contuvo `role_name` y `stakeholder_id`. Datos temporales
  eliminados.

## 2026-11-16 — Validadores por módulo y endurecimiento de signup

- Change: `authValidation.js` se movió a `src/server/utils/validators/` y ahora devuelve los valores normalizados que usa `authService`. Se exige que `email`/`password` sean strings, email con formato básico `local@dominio`, contraseña no vacía y `role_id`/`stakeholder_id` enteros positivos. `signup` traduce `SequelizeForeignKeyConstraintError` a `409 role_id or stakeholder_id does not exist`.
- Impact: Los payloads inválidos que antes llegaban a la base y producían `500` ahora responden `400`; referencias inexistentes a rol/stakeholder responden `409`. El login normaliza el email desde el validador y mantiene `401 Invalid email or password`. También se eliminó el log del JWT en `authController.login`.
- Verification: Pruebas de runtime contra el servidor: signup `{}` → `400`; email numérico/inválido → `400`; password en blanco → `400`; `role_id` no numérico → `400`; rol/stakeholder inexistente → `409`; signup válido con email/IDs normalizados → `201`; email duplicado → `409`; login con password incorrecta → `401`; login válido → `200` y token aceptado en `/api/users`. Datos temporales eliminados.

## 2026-11-16 — Validación de auth movida a utilidades compartidas

- Change: Se extrajeron la validación de payloads de signup/login y la normalización de email de `authService` a `src/server/utils/authValidation.js`, conservando los mismos campos requeridos, normalización (`trim` + minúsculas) y mensajes de error.
- Impact: Sin cambios en el comportamiento de `POST /api/auth/signup` y `POST /api/auth/login`; la lógica de validación ahora reside en una utilidad compartida.
- Verification: `node --check` en `src/server/services/authService.js` y `src/server/utils/authValidation.js` (sin errores). No se ejecutaron pruebas funcionales de endpoints en esta sesión.

## 2026-11-13 — Login y protección con JWT

- Change: Se agregó `POST /api/auth/login` con validación, búsqueda de usuario
  y `bcrypt.compare`. La generación del token vive en
  `utils/generateToken.js` (payload `{ user_id, role_id }`, expiración de 1 h
  por defecto). Se agregó el middleware `checkAuth` para exigir un Bearer token.
- Impact: `/api/auth/signup` y `/api/auth/login` son públicos. El resto de las
  rutas montadas después de `checkAuth` en `api.js` (hoy `/api/users` y
  `/api/roles`) requiere `Authorization: Bearer <token>`; sin token o con token
  inválido responden `401`. Login responde `200`, `400` por campos faltantes y
  `401` por credenciales inválidas.
- Verification: `GET /api/users` y `GET /api/roles` sin token → `401`; con token
  válido generado por `generateToken` → `200`; token inválido → `401`;
  `POST /api/auth/login` con cuerpo vacío → `400` y con credenciales
  incorrectas → `401`. El login exitoso queda pendiente de credenciales de
  prueba.
- Nota: El diseño de sesiones con refresh tokens quedó documentado en
  `FUTURE_SESSIONS.md`; no está implementado.