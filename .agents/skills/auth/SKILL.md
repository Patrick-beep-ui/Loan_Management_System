---
name: auth
description: Authentication module: login, forced password changes, password hashing, JWT generation, and route-protection middleware.
---

# auth

Authentication module: login (`login`) and forced password changes
(`changePassword`). User creation is admin-only and documented in the `users`
module.

The changelog is in [`CHANGELOG.md`](CHANGELOG.md). The session design with
refresh tokens, which is not yet implemented, is in
[`FUTURE_SESSIONS.md`](FUTURE_SESSIONS.md).

## Endpoints

| Method | Route | Controller | Service | Access |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `authController.login` | `authService.login` | public |
| `PATCH` | `/api/users/me/password` | `userController.changePassword` | `authService.changePassword` | token |

## Password change

Receives `{ current_password, new_password }` from an authenticated account.

- Both fields are required strings and cannot be blank; validation lives in
  `authValidation.js`.
- The service uses `req.user.user_id`, compares `current_password` with
  `password_hash`, and responds `401 Current password is incorrect` when it does
  not match. A missing user responds `401 Invalid or expired token`.
- Reusing the current password as `new_password` responds `400 New password must
  be different from the current password`.
- The new password is hashed with `bcryptjs` (10 rounds) and stored in
  `password_hash`; `must_change_password` is set to `false`.
- Responds `200` with `{ message: "Password changed successfully" }`.

## Login

Receives `{ email, password }`.

- If either is missing, it throws `ValidationError` (`400`).
- Requires `email` and `password` to be strings; the email is normalized (`trim` +
  lowercase) and must have the basic format `local@domain`.
- Looks up the user by normalized email.
- A nonexistent user or incorrect password throws `UnauthorizedError` (`401`)
  with the generic message `Invalid email or password` (it does not reveal
  whether the email exists).
- If the account is inactive (`is_active = false`), it throws
  `UnauthorizedError` (`401`) with `Account is inactive`, even with the correct
  password.
- Responds `200` with `{ token, user }`; `user` includes `user_id`,
  `stakeholder_id`, `email`, `role_id`, `role_name`, and `must_change_password`
  (never `password_hash`).
- `token` is a JWT signed by `generateToken` with the payload
  `{ user_id, role_id, role_name, stakeholder_id }` and expiration
  `JWT_EXPIRES_IN` or `1h` by default.

## Route protection

`checkAuth` (`src/server/middlewares/checkAuth.js`) requires the
`Authorization: Bearer <token>` header. It verifies the JWT and then queries
`users` (along with `Role`) to rebuild `req.user = { user_id, role_id,
role_name, stakeholder_id, must_change_password }` from the database, so that
role changes, deactivation, and password resets take effect without waiting for
the token to expire. If the token is missing, invalid, or the user no longer
exists, it responds `401 Invalid or expired token`; an account with
`is_active = false` responds `401 Account is inactive`. Loan services use these
values to resolve permissions and ownership. In `api.js`, the `/auth` router is
mounted before `checkAuth`; everything registered after it is protected.

`requirePasswordChanged` (`src/server/middlewares/requirePasswordChanged.js`)
runs after `checkAuth`. When `req.user.must_change_password` is true it allows
only `GET /api/users/auth` (session hydration) and `PATCH /api/users/me/password`;
any other route responds `403 Password change required`. The flag is read from
the database on every request, so existing tokens are also blocked as soon as an
admin resets a password.

`requireAdmin` (`src/server/middlewares/requireAdmin.js`) responds `403 Admin
access required` if `req.user.role_name` is not `admin`. It is applied in
`AdminRouter` (`src/server/routes/adminRoutes.js`), mounted at `/api/admin`
after `checkAuth`; `POST /users`, `POST /users/:userId/reset-password`, and
`PATCH /users/:userId` are defined directly in that router, without subrouters.
It is also applied to `POST`, `PUT`, `PATCH`, and
`DELETE` in `stakeholderRoutes.js`; stakeholder `GET`s are left without this
guard for loan forms.

`requireAdminForLenderChange`
(`src/server/middlewares/requireAdminForLenderChange.js`) allows sending
`lender_id` only to `admin` or when the value matches the `stakeholder_id` of
the authenticated account; any other value responds `403 Only admins can
change the lender`. It is applied to `POST`, `PUT`, and `PATCH` in `loanRoutes.js`.
The domain validators keep their usual rules.

On the client, `RequireAuth` redirects accounts with `must_change_password` to
`/change-password`, where the user submits the current (temporary) password and
a new one. `RequireAdmin` (`src/client/contexts/AuthContext.jsx`) uses
`user.Role.role_name` to show the `/admin` panel only to admins; it is a UI
check, not API authorization.

## Errors

Any unexpected error is logged and responds `500` with
`{ error: "Internal Server Error" }`.

## Files

- `src/server/routes/authRoutes.js` (mounted at `/api/auth`)
- `src/server/controllers/authController.js`
- `src/server/services/authService.js`
- `src/server/utils/validators/authValidation.js`
- `src/server/utils/generateToken.js`
- `src/server/middlewares/checkAuth.js`
- `src/server/middlewares/requirePasswordChanged.js`
- `src/server/middlewares/requireAdmin.js`
- `src/server/middlewares/requireAdminForLenderChange.js`
- `src/server/routes/adminRoutes.js`
- `src/client/contexts/AuthContext.jsx` (`RequireAuth` and `RequireAdmin`)
