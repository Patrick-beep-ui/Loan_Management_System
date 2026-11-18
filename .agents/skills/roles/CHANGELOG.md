# Changelog — roles

## 2026-11-17 — `operator` renombrado a `lender`

- Change: la migración `2026-11-17-rename-operator-role-to-lender.sql` cambia
  el `role_name` de `operator` a `lender`, preservando `role_id`. El signup
  público ahora solo crea usuarios `lender` y resuelve el rol por nombre desde
  la base.
- Impact: los usuarios antes operadores ahora son prestamistas; el payload de
  signup ya no incluye `role_id`. `GET /api/roles` devuelve `admin` y `lender`.
- Verification: migración aplicada en MySQL; `roles` devolvió
  `(1, admin), (2, lender)` y el usuario 16 conservó `role_id = 2`.

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
