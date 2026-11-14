---
name: auth
description: Authentication module: user signup with validation and password hashing via the auth service, controller, and routes.
---

# auth

Módulo de autenticación. Por ahora implementa el registro de usuarios.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Endpoint

| Método | Ruta | Controller | Service |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | `authController.signup` | `authService.signup` |

## Comportamiento

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
- Cualquier otro error se registra y responde `500` con
  `{ error: "Internal Server Error" }`.

## Archivos

- `src/server/routes/authRoutes.js` (montado en `/api/auth`)
- `src/server/controllers/authController.js`
- `src/server/services/authService.js`
