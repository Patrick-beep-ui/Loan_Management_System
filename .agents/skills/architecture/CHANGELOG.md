# Changelog — architecture

## 2026-11-13 — Arquitectura por capas y ruteo global

- Change: Se reorganizó la API en Models, Services, Controllers y Routes. Se
  agregó `utils/errors.js` con errores tipados y se movió todo el ruteo a
  `api.js`, que ahora solo monta los routers de los módulos.
- Impact: Las rutas inline de `api.js` se eliminaron. Cada endpoint pasa por
  un controller y un service; los services no dependen de `req`/`res`.
- Verification: `node --check` en todos los archivos; servidor iniciado y
  `GET /api/roles`, `GET /api/users` y `POST /api/auth/signup` con cuerpo
  vacío respondieron 200, 200 y 400 respectivamente.
