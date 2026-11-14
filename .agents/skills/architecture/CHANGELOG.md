# Changelog — architecture

## 2026-11-13 — Router de stakeholders

- Change: Se montó `StakeholderRouter` en `/api/stakeholders`, después de
  `checkAuth`. Se agregó `NotFoundError` (`404`) a los errores tipados.
- Impact: Las rutas de stakeholders requieren Bearer token; los recursos
  inexistentes responden `404`.
- Verification: `node --check` en los archivos nuevos y modificados; CRUD
  completo probado en runtime con token.

## 2026-11-13 — Middleware de autenticación y rutas protegidas

- Change: Se documentó `middlewares/checkAuth.js` y
  `utils/generateToken.js`, y el nuevo orden de `api.js`: `/auth` público
  primero, luego `checkAuth`, después `/users` y `/roles`.
- Impact: Todo router registrado después de `checkAuth` requiere
  `Authorization: Bearer <token>`; sin token o con token inválido responde
  `401`. Se agregó `UnauthorizedError` a los errores tipados.
- Verification: `GET /api/users` y `GET /api/roles` sin token → `401`; con
  token válido → `200`; token inválido → `401`.

## 2026-11-13 — Arquitectura por capas y ruteo global

- Change: Se reorganizó la API en Models, Services, Controllers y Routes. Se
  agregó `utils/errors.js` con errores tipados y se movió todo el ruteo a
  `api.js`, que ahora solo monta los routers de los módulos.
- Impact: Las rutas inline de `api.js` se eliminaron. Cada endpoint pasa por
  un controller y un service; los services no dependen de `req`/`res`.
- Verification: `node --check` en todos los archivos; servidor iniciado y
  `GET /api/roles`, `GET /api/users` y `POST /api/auth/signup` con cuerpo
  vacío respondieron 200, 200 y 400 respectivamente.
