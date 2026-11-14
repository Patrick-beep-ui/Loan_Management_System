# Changelog — roles

## 2026-11-13 — Ruta protegida con JWT

- Change: `GET /api/roles` ahora pasa por `checkAuth` en `api.js`.
- Impact: Requiere `Authorization: Bearer <token>`; sin token o con token
  inválido responde `401`.
- Verification: Sin token → `401`; con token válido de `generateToken` → `200`.

## 2026-11-13 — Módulo de roles en capas

- Change: `GET /api/roles` se movió de `api.js` a `roleRoutes` →
  `roleController` → `roleService`.
- Impact: La URL no cambia; el handler inline de `api.js` se eliminó.
- Verification: `GET /api/roles` respondió `200` con los roles `admin` y
  `operator` de la base.
