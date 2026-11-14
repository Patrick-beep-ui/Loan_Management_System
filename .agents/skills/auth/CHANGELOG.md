# Changelog — auth

## 2026-11-13 — Módulo de autenticación con signup

- Change: El registro de usuarios se movió de `api.js` (`POST /api/signup`) a
  `authRoutes` → `authController` → `authService`, ahora en
  `POST /api/auth/signup`. La validación y el hashing viven en el service.
- Impact: `POST /api/signup` deja de existir. Signup responde `201`, `400`
  por campos faltantes y `409` por email duplicado.
- Verification: `POST /api/auth/signup` con cuerpo `{}` respondió `400`;
  `node --check` pasó en todos los archivos del módulo.
