# Changelog — users

## 2026-11-27 — Documented global user reads as an exception

- Change: documented `GET /api/users` as an intentional authenticated
  global-read exception and corrected its cookie-based authentication wording.
- Impact: user enumeration remains available to every authenticated role; this
  must not be represented as complete BOLA/IDOR protection without instructor
  approval.
- Verification: implementation reviewed in `api.js`, `userRoutes.js`, and
  `checkAuth.js`; runtime audit steps are in `docs/security/red-team-audit.md`.

## 2026-11-26 — Admin user creation, reset, and last-admin guard

- Change: `POST /api/admin/users`, `POST /api/admin/users/:userId/reset-password`,
  and `PATCH /api/users/me/password` were added. A generated temporary password
  is hashed and returned once; `must_change_password` is cleared only after a
  successful password change. `updateAdminUser` now refuses to demote or
  deactivate the last active admin.
- Impact: users are provisioned only by admins, with `admin` or `lender` roles,
  and must change their temporary password before other API routes respond.
  Public signup no longer exists.
- Verification: `node --check` on modified backend files, validator smoke
  tests, and middleware path checks passed; no live API tests.

## 2026-11-25 — Admin editing of the linked person

- Change: the `/admin/users` dialog expanded role and `is_active` editing with
  the linked stakeholder's data. `useAdminUsers` loads
  `GET /api/stakeholders/:id`, validates locally and saves with
  `PATCH /api/admin/users/:userId` plus `PUT /api/stakeholders/:id`; it reuses
  `StakeholderFormFields` from the stakeholders panel.
- Impact: accounts with a `stakeholder_id` can edit status and personal data
  in a single dialog; without a stakeholder or if loading fails, only role and
  status are editable. No endpoint was added and the CRUD was not duplicated.
- Verification: `pnpm build` built successfully (2564 modules). It was not
  tested in a browser or against a server, at the user's request.

## 2026-11-25 — Role and account status administration

- Change: `PATCH /api/admin/users/:userId` was added directly in
  `adminRoutes`, with `adminUserController` → `adminUserService` and the
  validator `adminUserValidation`. It accepts `role_name` and `is_active`,
  resolves the role by name and returns the `authUser` projection.
- Impact: the listing remains at `GET /api/users`; only mutations live under
  `/api/admin` and sit behind `checkAuth` and `requireAdmin`. The admin client
  uses the same listing and updates the row with the response.
- Verification: `pnpm build` built successfully. It was not tested against a
  server or in a browser, at the user's request.

## 2026-11-19 — Documented `GET /api/users/auth`

- Change: the existing endpoint that returns the current user from
  `req.user.user_id`, with its `Stakeholder` and `Role` projection and its use
  from `AuthProvider` on the client, was documented.
- Impact: the backend did not change; session hydration and the difference in
  projection compared with `GET /api/users` are clarified.
- Verification: implementation reviewed in `userRoutes.js`, `userController.js`
  and `userService.js`; the client `pnpm build` built successfully.

## 2026-11-17 — Signup creates `lender` accounts

- Change: it is documented that `POST /api/auth/signup` always assigns the
  `lender` role, resolved by name from `roles`, and that the user is linked to
  the submitted `stakeholder_id`.
- Impact: `GET /api/users` may show manually provisioned `admin` accounts and
  publicly created `lender` accounts; the listing does not change.
- Verification: two temporary signups created users with `role_id: 2` and
  `role_name: "lender"`; they were deleted after the test.

## 2026-11-13 — Route protected with JWT

- Change: `GET /api/users` now passes through `checkAuth` in `api.js`.
- Impact: requires `Authorization: Bearer <token>`; without a token or with an
  invalid token it responds `401`.
- Verification: without a token → `401`; with a valid token from
  `generateToken` → `200`.

## 2026-11-13 — Layered users module

- Change: `GET /api/users` moved from `api.js` to `userRoutes` →
  `userController` → `userService`. The service imports the models directly
  and excludes `password_hash` from the response.
- Impact: the URL does not change. `POST /api/users` was removed; user creation
  now belongs to `POST /api/auth/signup`.
- Verification: `GET /api/users` responded `200` with data from the database
  and `password_hash` outside the SQL projection.
