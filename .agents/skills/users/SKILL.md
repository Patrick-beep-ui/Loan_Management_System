---
name: users
description: User module: listing and admin-only role/active-state and linked stakeholder updates through layered routes, controllers, services, and validators.
---

# users

Module for querying users and for admin management of role and account status.

This module's change history is in [`CHANGELOG.md`](CHANGELOG.md).

## Endpoint

| Method | Route | Controller | Service |
| --- | --- | --- | --- |
| `GET` | `/api/users` | `userController.getAllUsers` | `userService.getAllUsers` |
| `GET` | `/api/users/auth` | `userController.authUser` | `userService.authUser` |
| `PATCH` | `/api/users/me/password` | `userController.changePassword` | `authService.changePassword` |
| `POST` | `/api/admin/users` | `adminUserController.createAdminUser` | `adminUserService.createAdminUser` |
| `POST` | `/api/admin/users/:userId/reset-password` | `adminUserController.resetAdminUserPassword` | `adminUserService.resetAdminUserPassword` |
| `PATCH` | `/api/admin/users/:userId` | `adminUserController.updateAdminUser` | `adminUserService.updateAdminUser` |

## Behavior

- All routes require authentication: `Authorization: Bearer <token>`; without
  a token or with an invalid token they respond `401`. This is applied by
  `checkAuth` in `api.js`. The `/api/admin` routes additionally require the
  `admin` role.
- They exclude `password_hash` from the response and, on an unexpected error,
  respond `500` with `{ error: "Internal Server Error" }`.
- `GET /api/users` returns `200` with the array of all users, with their
  `Stakeholder` (`stakeholder_id`, `first_name`, `last_name`) and their `Role`
  (`role_id`, `role_name`).
- `GET /api/users/auth` returns `200` with the current user, resolved from
  `req.user.user_id`. It includes `Stakeholder` (`stakeholder_id`, `first_name`,
  `last_name`, `national_id`, `marital_status`, `occupation`, `date_of_birth`)
  and `Role` (`role_id`, `role_name`). The Sequelize keys are kept as
  `Stakeholder` and `Role` (capitalized). If there is no `user_id` it responds
  `401`; if the user does not exist it responds `404` with
  `{ error: "User not found" }`.
  This is the route `AuthProvider` uses on the client to hydrate the session.
  Its projection also includes `must_change_password`.
- `PATCH /api/users/me/password` is authenticated and remains reachable while
  `must_change_password` is true. It takes `{ current_password, new_password }`,
  verifies the current hash, hashes the new password with `bcryptjs` (10 rounds),
  clears the flag, and responds `200` with
  `{ message: "Password changed successfully" }`. A wrong current password
  responds `401 Current password is incorrect`; reusing the same password
  responds `400`.
- `POST /api/admin/users` is protected by `checkAuth` and `requireAdmin`. It
  takes `{ email, stakeholder_id, role_name }` (`admin` or `lender`), resolves the
  role by name, checks that the stakeholder exists and is not already linked to
  another account, hashes a generated temporary password, creates the account
  with `must_change_password = true`, and responds `201` with the
  `GET /api/users/auth` projection plus `temporary_password`, shown only once.
  A duplicate email, missing role, missing stakeholder, or already-linked
  stakeholder responds `409`.
- `POST /api/admin/users/:userId/reset-password` hashes a new generated
  temporary password, sets `must_change_password = true`, and responds `200`
  with the projection plus the one-time `temporary_password`.
- `PATCH /api/admin/users/:userId` is protected by `checkAuth` and `requireAdmin`;
  a `lender` token responds `403 Admin access required`.
- The payload accepts `role_name` (`admin` or `lender`) and `is_active`
  (boolean), alone or together; any other field is ignored. Validation lives in
  `adminUserValidation`, which also requires a positive integer `user_id` and at
  least one field. An invalid `role_name` responds `400`.
- If the user does not exist it responds `404 User not found`; if the role is
  not in the database it responds `409 Role <name> does not exist`. Demoting or
  deactivating the last active admin responds `409 Cannot demote or deactivate
  the last active admin`. An unexpected error responds `500 Internal Server
  Error`.
- The response is `200` with the updated user in the same projection as
  `GET /api/users/auth`, without `password_hash` and with `Stakeholder` and `Role`.

## Admin client

- `/admin/users` lists with `GET /api/users` and opens a dialog that combines
  role, status and the data of the person linked to the user.
- If `user.stakeholder_id` exists, `useAdminUsers` loads
  `GET /api/stakeholders/:id` with `stakeholderToForm` and validates with
  `validateStakeholderForm` before saving. If it does not exist or loading
  fails, the dialog offers only role and status options.
- `saveEdit` sends `PATCH /api/admin/users/:userId` first and then
  `PUT /api/stakeholders/:stakeholder_id` when there is person data. No combined
  endpoint was created: the backend remains the authority and error messages
  from each route are shown as-is.
- If the `PATCH` finishes and the `PUT` fails, the client reloads the listing
  and explicitly notifies that the status was updated but the person's data
  was not.
- The stakeholder fields are reused from
  `src/components/admin/stakeholders/StakeholderFormFields.jsx`.
- `/admin/users` also offers a `New user` action: the create dialog collects
  email, role and a stakeholder selected from people not linked to any account,
  then displays the returned temporary password once with a warning that it will
  not be shown again.
- Each row can reset a password after confirmation. The new temporary password
  is shown once and the account returns to the forced-change state.

## Files

- `src/server/routes/userRoutes.js`
- `src/server/routes/adminRoutes.js`
- `src/server/controllers/userController.js`
- `src/server/controllers/adminUserController.js`
- `src/server/services/userService.js`
- `src/server/services/adminUserService.js`
- `src/server/utils/validators/adminUserValidation.js`
- `src/server/utils/temporaryPassword.js`

User creation no longer lives in `auth`: public signup was removed and only an
admin can create accounts through `POST /api/admin/users`. New accounts start
with `must_change_password = true`; the first admin is provisioned with
`pnpm seed:admin` (see the `database` module). The `/api/users` listing remains
global and does not filter by role.
