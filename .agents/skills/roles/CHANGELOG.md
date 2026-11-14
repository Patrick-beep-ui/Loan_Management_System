# Changelog — roles

## 2026-11-13 — Módulo de roles en capas

- Change: `GET /api/roles` se movió de `api.js` a `roleRoutes` →
  `roleController` → `roleService`.
- Impact: La URL no cambia; el handler inline de `api.js` se eliminó.
- Verification: `GET /api/roles` respondió `200` con los roles `admin` y
  `operator` de la base.
