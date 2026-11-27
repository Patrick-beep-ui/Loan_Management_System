# Changelog — roles

## 2026-11-17 — `operator` renamed to `lender`

- Change: the migration `2026-11-17-rename-operator-role-to-lender.sql` changes
  the `role_name` from `operator` to `lender`, preserving `role_id`. Public
  signup now only creates `lender` users and resolves the role by name from
  the database.
- Impact: former operator users are now lenders; the signup payload no longer
  includes `role_id`. `GET /api/roles` returns `admin` and `lender`.
- Verification: migration applied in MySQL; `roles` returned
  `(1, admin), (2, lender)` and user 16 kept `role_id = 2`.

## 2026-11-13 — Route protected with JWT

- Change: `GET /api/roles` now passes through `checkAuth` in `api.js`.
- Impact: requires `Authorization: Bearer <token>`; without a token or with an
  invalid token it responds `401`.
- Verification: without a token → `401`; with a valid token from
  `generateToken` → `200`.

## 2026-11-13 — Layered roles module

- Change: `GET /api/roles` moved from `api.js` to `roleRoutes` →
  `roleController` → `roleService`.
- Impact: the URL does not change; the inline handler in `api.js` was removed.
- Verification: `GET /api/roles` responded `200` with the `admin` and
  `operator` roles from the database.
