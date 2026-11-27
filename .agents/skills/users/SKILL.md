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
| `PATCH` | `/api/admin/users/:userId` | `adminUserController.updateAdminUser` | `adminUserService.updateAdminUser` |

## Behavior

- Both routes require authentication: `Authorization: Bearer <token>`; without
  a token or with an invalid token they respond `401`. This is applied by
  `checkAuth` in `api.js`.
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
- `PATCH /api/admin/users/:userId` is protected by `checkAuth` and `requireAdmin`;
  a `lender` token responds `403 Admin access required`.
- The payload accepts `role_name` (`admin` or `lender`) and `is_active`
  (boolean), alone or together; any other field is ignored. Validation lives in
  `adminUserValidation`, which also requires a positive integer `user_id` and at
  least one field. An invalid `role_name` responds `400`.
- If the user does not exist it responds `404 User not found`; if the role is
  not in the database it responds `409 Role <name> does not exist`. An
  unexpected error responds `500 Internal Server Error`.
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

## Files

- `src/server/routes/userRoutes.js`
- `src/server/routes/adminRoutes.js`
- `src/server/controllers/userController.js`
- `src/server/controllers/adminUserController.js`
- `src/server/services/userService.js`
- `src/server/services/adminUserService.js`
- `src/server/utils/validators/adminUserValidation.js`

User creation does not live here: it belongs to the `auth` module via
`POST /api/auth/signup`, which always creates `lender` accounts (role resolved
from the database, not received in the payload). The `/api/users` listing
remains global and does not filter by role.
