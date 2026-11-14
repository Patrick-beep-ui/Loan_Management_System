# Changelog — users

## 2026-11-13 — Módulo de usuarios en capas

- Change: `GET /api/users` se movió de `api.js` a `userRoutes` →
  `userController` → `userService`. El service importa los modelos
  directamente y excluye `password_hash` de la respuesta.
- Impact: La URL no cambia. Se eliminó `POST /api/users`; la creación de
  usuarios ahora corresponde a `POST /api/auth/signup`.
- Verification: `GET /api/users` respondió `200` con datos de la base y
  `password_hash` fuera de la proyección SQL.
