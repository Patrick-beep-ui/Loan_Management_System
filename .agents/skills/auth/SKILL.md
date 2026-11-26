---
name: auth
description: Authentication module: signup and login, password hashing, JWT generation, and the route-protection middleware.
---

# auth

Módulo de autenticación: registro (`signup`) e inicio de sesión (`login`).

El historial de cambios está en [`CHANGELOG.md`](CHANGELOG.md). El diseño de
sesiones con refresh tokens, todavía no implementado, está en
[`FUTURE_SESSIONS.md`](FUTURE_SESSIONS.md).

## Endpoints

| Método | Ruta | Controller | Service | Acceso |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | `authController.signup` | `authService.signup` | público |
| `POST` | `/api/auth/login` | `authController.login` | `authService.login` | público |

## Signup

Recibe `{ email, password, stakeholder_id }`.

- Valida que los tres campos estén presentes; si falta alguno lanza
  `ValidationError` (`400`) con la lista de campos faltantes.
- Exige que `email` y `password` sean strings. El email se normaliza
  (`trim` + minúsculas) y debe tener formato básico `local@dominio`; una
  contraseña vacía o solo con espacios responde `400`.
- `stakeholder_id` debe ser entero positivo (`"2"` se acepta y se normaliza a
  número). El payload ya no recibe `role_id`: el service consulta `roles` por
  `role_name = "lender"` y usa ese `role_id`, así que todas las cuentas
  públicas son prestamistas. Si el rol no existe responde `500`.
- Hashea `password` con `bcryptjs` (10 rondas) y lo guarda en `password_hash`.
- Crea el usuario y responde `201`:
  `{ message: "User created successfully", user }`, donde `user` incluye
  `user_id`, `stakeholder_id`, `email`, `role_id` y `role_name: "lender"`
  (nunca `password_hash`).
- Si el email ya existe, `SequelizeUniqueConstraintError` se traduce a
  `ConflictError` (`409`). Si `stakeholder_id` no existe,
  `SequelizeForeignKeyConstraintError` se traduce a `ConflictError` (`409`)
  con `stakeholder_id does not exist`.

## Login

Recibe `{ email, password }`.

- Si falta alguno lanza `ValidationError` (`400`).
- Exige `email` y `password` strings; el email se normaliza (`trim` +
  minúsculas) y debe tener formato básico `local@dominio`.
- Busca el usuario por email normalizado.
- Usuario inexistente o contraseña incorrecta lanzan `UnauthorizedError`
  (`401`) con el mensaje genérico `Invalid email or password` (no revela si el
  email existe).
- Si la cuenta está desactivada (`is_active = false`), lanza
  `UnauthorizedError` (`401`) con `Account is inactive`, incluso con la
  contraseña correcta.
- Responde `200` con `{ token, user }`; `user` incluye `user_id`,
  `stakeholder_id`, `email`, `role_id` y `role_name` (nunca `password_hash`).
- `token` es un JWT firmado por `generateToken` con el payload
  `{ user_id, role_id, role_name, stakeholder_id }` y expiración
  `JWT_EXPIRES_IN` o `1h` por defecto.

## Protección de rutas

`checkAuth` (`src/server/middlewares/checkAuth.js`) exige el header
`Authorization: Bearer <token>`. Verifica el JWT y después consulta `users`
(junto con `Role`) para reconstruir `req.user =
{ user_id, role_id, role_name, stakeholder_id }` desde la base, de modo que los
cambios de rol y la desactivación surtan efecto sin esperar a que venza el
token. Si falta el token, es inválido o el usuario ya no existe responde `401
Invalid or expired token`; una cuenta con `is_active = false` responde `401
Account is inactive`. Los services de préstamos usan esos valores para
resolver permisos y propiedad. En `api.js`, `/auth` se monta antes de
`checkAuth`; todo lo que se registre después queda protegido.

`requireAdmin` (`src/server/middlewares/requireAdmin.js`) responde `403 Admin
access required` si `req.user.role_name` no es `admin`. Se aplica en
`AdminRouter` (`src/server/routes/adminRoutes.js`), montado en `/api/admin`
después de `checkAuth`; las rutas de admin se definen directamente allí.

`requireAdminForLenderChange`
(`src/server/middlewares/requireAdminForLenderChange.js`) permite enviar
`lender_id` solo a `admin` o cuando el valor coincide con el `stakeholder_id`
de la cuenta autenticada; cualquier otro valor responde `403 Only admins can
change the lender`. Los validadores de dominio mantienen sus reglas habituales.

## Errores

Cualquier error inesperado se registra y responde `500` con
`{ error: "Internal Server Error" }`.

## Archivos

- `src/server/routes/authRoutes.js` (montado en `/api/auth`)
- `src/server/controllers/authController.js`
- `src/server/services/authService.js`
- `src/server/utils/validators/authValidation.js`
- `src/server/utils/generateToken.js`
- `src/server/middlewares/checkAuth.js`
- `src/server/middlewares/requireAdmin.js`
- `src/server/middlewares/requireAdminForLenderChange.js`
- `src/server/routes/adminRoutes.js`