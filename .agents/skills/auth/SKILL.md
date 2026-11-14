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

Recibe `{ email, password, role_id, stakeholder_id }`.

- Valida que los cuatro campos estén presentes; si falta alguno lanza
  `ValidationError` (`400`) con la lista de campos faltantes.
- Normaliza el email (`trim` + minúsculas).
- Hashea `password` con `bcryptjs` (10 rondas) y lo guarda en `password_hash`.
- Crea el usuario y responde `201`:
  `{ message: "User created successfully", user }`, donde `user` solo incluye
  `user_id`, `stakeholder_id`, `email` y `role_id` (nunca `password_hash`).
- Si el email ya existe, `SequelizeUniqueConstraintError` se traduce a
  `ConflictError` (`409`).

## Login

Recibe `{ email, password }`.

- Si falta alguno lanza `ValidationError` (`400`).
- Normaliza el email y busca el usuario por email.
- Usuario inexistente o contraseña incorrecta lanzan `UnauthorizedError`
  (`401`) con el mensaje genérico `Invalid email or password` (no revela si el
  email existe).
- Responde `200` con `{ token, user }`; `user` incluye `user_id`,
  `stakeholder_id`, `email` y `role_id` (nunca `password_hash`).
- `token` es un JWT firmado por `generateToken` con el payload
  `{ user_id, role_id }` y expiración `JWT_EXPIRES_IN` o `1h` por defecto.

## Protección de rutas

`checkAuth` (`src/server/middlewares/checkAuth.js`) exige el header
`Authorization: Bearer <token>`. Si falta o es inválido responde `401`.
En `api.js`, `/auth` se monta antes de `checkAuth`; todo lo que se registre
después queda protegido.

## Errores

Cualquier error inesperado se registra y responde `500` con
`{ error: "Internal Server Error" }`.

## Archivos

- `src/server/routes/authRoutes.js` (montado en `/api/auth`)
- `src/server/controllers/authController.js`
- `src/server/services/authService.js`
- `src/server/utils/generateToken.js`
- `src/server/middlewares/checkAuth.js`
