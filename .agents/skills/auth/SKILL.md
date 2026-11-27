---
name: auth
description: Authentication module: signup and login, password hashing, JWT generation, and the route-protection middleware.
---

# auth

Authentication module: signup (`signup`) and login (`login`).

The changelog is in [`CHANGELOG.md`](CHANGELOG.md). The session design with
refresh tokens, which is not yet implemented, is in
[`FUTURE_SESSIONS.md`](FUTURE_SESSIONS.md).

## Endpoints

| Method | Route | Controller | Service | Access |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | `authController.signup` | `authService.signup` | public |
| `POST` | `/api/auth/login` | `authController.login` | `authService.login` | public |

## Signup

Receives `{ email, password, stakeholder_id }`.

- Validates that all three fields are present; if any is missing, it throws
  `ValidationError` (`400`) with the list of missing fields.
- Requires `email` and `password` to be strings. The email is normalized
  (`trim` + lowercase) and must have the basic format `local@domain`; an empty
  or whitespace-only password responds `400`.
- `stakeholder_id` must be a positive integer (`"2"` is accepted and normalized
  to a number). The payload no longer receives `role_id`: the service queries
  `roles` by `role_name = "lender"` and uses that `role_id`, so all public
  accounts are lenders. If the role does not exist, it responds `500`.
- Hashes `password` with `bcryptjs` (10 rounds) and stores it in `password_hash`.
- Creates the user and responds `201`:
  `{ message: "User created successfully", user }`, where `user` includes
  `user_id`, `stakeholder_id`, `email`, `role_id`, and `role_name: "lender"`
  (never `password_hash`).
- If the email already exists, `SequelizeUniqueConstraintError` is translated to
  `ConflictError` (`409`). If `stakeholder_id` does not exist,
  `SequelizeForeignKeyConstraintError` is translated to `ConflictError` (`409`)
  with `stakeholder_id does not exist`.

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
  `stakeholder_id`, `email`, `role_id`, and `role_name` (never `password_hash`).
- `token` is a JWT signed by `generateToken` with the payload
  `{ user_id, role_id, role_name, stakeholder_id }` and expiration
  `JWT_EXPIRES_IN` or `1h` by default.

## Route protection

`checkAuth` (`src/server/middlewares/checkAuth.js`) requires the
`Authorization: Bearer <token>` header. It verifies the JWT and then queries
`users` (along with `Role`) to rebuild `req.user =
{ user_id, role_id, role_name, stakeholder_id }` from the database, so that role
changes and deactivation take effect without waiting for the token to expire.
If the token is missing, invalid, or the user no longer exists, it responds `401
Invalid or expired token`; an account with `is_active = false` responds `401
Account is inactive`. Loan services use these values to resolve permissions and
ownership. In `api.js`, `/auth` is mounted before `checkAuth`; everything
registered after it is protected.

`requireAdmin` (`src/server/middlewares/requireAdmin.js`) responds `403 Admin
access required` if `req.user.role_name` is not `admin`. It is applied in
`AdminRouter` (`src/server/routes/adminRoutes.js`), mounted at `/api/admin`
after `checkAuth`; `PATCH /api/admin/users/:userId` is defined directly in that
router, without subrouters. It is also applied to `POST`, `PUT`, `PATCH`, and
`DELETE` in `stakeholderRoutes.js`; stakeholder `GET`s are left without this
guard for loan forms.

`requireAdminForLenderChange`
(`src/server/middlewares/requireAdminForLenderChange.js`) allows sending
`lender_id` only to `admin` or when the value matches the `stakeholder_id` of
the authenticated account; any other value responds `403 Only admins can
change the lender`. It is applied to `POST`, `PUT`, and `PATCH` in `loanRoutes.js`.
The domain validators keep their usual rules.

On the client, `RequireAdmin` (`src/client/contexts/AuthContext.jsx`) uses
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
- `src/server/middlewares/requireAdmin.js`
- `src/server/middlewares/requireAdminForLenderChange.js`
- `src/server/routes/adminRoutes.js`
- `src/client/contexts/AuthContext.jsx` (`RequireAuth` and `RequireAdmin`)
