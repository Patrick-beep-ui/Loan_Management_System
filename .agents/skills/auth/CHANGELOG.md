# Changelog — auth

## 2026-11-27 — Login rate protection

- Change: applied the login-specific rate limiter to `POST /api/auth/login`.
- Impact: login attempts default to 5 per 15 minutes in addition to the
  API-wide limit; `LOGIN_RATE_LIMIT_MAX` can change that threshold.
- Verification: `pnpm audit --json` found no advisory for the limiter package;
  `node --check` and `pnpm build` succeeded. Not tested against a running
  server.

## 2026-11-27 — JWT transport moved to HttpOnly cookies

- Change: login now writes the JWT to the `access_token` cookie, `checkAuth`
  reads that cookie, and public `POST /api/auth/logout` clears it. The login
  body no longer returns the token.
- Impact: browser JavaScript does not receive or store JWTs. Production cookies
  are `HttpOnly`, `Secure`, and `SameSite=Strict`; local HTTP omits only
  `Secure` so browsers can use localhost.
- Verification: `pnpm build` succeeded. Not tested in a browser or against a
  server.

## 2026-11-26 — Lender route guard

- Change: added `RequireLender` to `src/client/contexts/AuthContext.jsx`. It
  keeps `/payments` for lender accounts and redirects admins to
  `/admin/payments`.
- Impact: the general payment history and the admin payment panel stay separate
  without adding a new API authorization rule.
- Verification: `pnpm build` succeeded. Not tested in a browser.

## 2026-11-26 — Admin-created users and forced password change

- Change: public `POST /api/auth/signup` was removed. `authService` now exposes
  `changePassword`, mounted at `PATCH /api/users/me/password`, and `checkAuth`
  reads `must_change_password` into `req.user`. A new `requirePasswordChanged`
  middleware limits temporary-password accounts to session hydration and the
  password-change route.
- Impact: users can only be provisioned by an admin, receive a one-time
  temporary password, and must replace it before using the rest of the API.
  `login` returns the flag so the client can redirect to `/change-password`.
- Verification: `node --check` on modified backend files, validator smoke tests,
  and middleware path checks passed; no live API tests.

## 2026-11-25 — Lender guard mounted on loans

- Change: `requireAdminForLenderChange` is applied to `POST`, `PUT`, and `PATCH`
  on `/api/loans` from `loanRoutes.js`.
- Impact: a `lender` that sends a `lender_id` different from its `stakeholder_id`
  receives `403 Only admins can change the lender`; an `admin` continues to have
  global access and the domain validators still apply.
- Verification: `pnpm build` built successfully. No live API tests.

## 2026-11-25 — `requireAdmin` on stakeholder mutations

- Change: `requireAdmin` was applied to `POST`, `PUT`, `PATCH`, and `DELETE` in
  `stakeholderRoutes.js`. The two `GET`s remain protected only by `checkAuth`.
- Impact: `lender` accounts can read stakeholders for loans, but receive
  `403 Admin access required` if they try to modify them.
- Verification: `pnpm build` built successfully. No live API tests.

## 2026-11-25 — User mutations under `/api/admin`

- Change: `AdminRouter` defines `PATCH /users/:userId` directly. `requireAdmin`
  is applied to the entire router, so `PATCH /api/admin/users/:userId` is
  restricted to the `admin` role; `checkAuth` continues to resolve the role from
  the database on every request.
- Impact: a `lender` receives `403 Admin access required`; changing a role or
  deactivating an account takes effect on the next request.
- Verification: `pnpm build` built successfully. No live API tests.

## 2026-11-25 — Admin guard on the client

- Change: `AuthContext.jsx` exports `RequireAdmin`, which waits for hydration,
  redirects to `/login` without a session, and to `/loans` if
  `user.Role.role_name` is not `admin`. `LoanListHeader` uses the same value to
  display the `Admin` link.
- Impact: the `/admin` panel is hidden for `lender` accounts; real authorization
  remains in `requireAdmin` and in `/api/admin/*`.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

## 2026-11-25 — Session validated against the database and admin middlewares

- Change: `checkAuth` queries `users` and `Role` after verifying the JWT,
  rebuilds `req.user` from the database, and rejects accounts with
  `is_active = false`. `login` also rejects inactive accounts. `requireAdmin`
  and `requireAdminForLenderChange` were added, and `api.js` mounts `AdminRouter`
  at `/api/admin`, which centralizes `requireAdmin` and does not yet define any
  endpoints.
- Impact: role changes and deactivation take effect immediately even if the
  token is still valid. `/api/admin/*` is restricted to `admin`, and a `lender`
  cannot assign a `lender_id` other than its own. Public signup is unchanged.
- Verification: `pnpm build` and diff review. No live API tests and no migration
  applied in this session, according to the verification preference.

## 2026-11-17 — Signup for lenders only and identity in the JWT

- Change: `validateSignupPayload` no longer requires `role_id`;
  `authService.signup` resolves the `lender` role from `roles` by name and
  assigns it. `login` includes `role_name` by querying the association with
  `Role`, and `generateToken` signs
  `{ user_id, role_id, role_name, stakeholder_id }`. `checkAuth` exposes those
  four values in `req.user`.
- Impact: public signup can no longer create `admin` accounts; loan services can
  derive the authenticated lender. Tokens issued before the change do not
  include `role_name` or `stakeholder_id` and expire in 1 h.
- Verification: migration applied; signup with `role_id: 1` returned
  `role_id: 2, role_name: "lender"`; login returned `role_name: "lender"` and the
  decoded JWT contained `role_name` and `stakeholder_id`. Temporary data removed.

## 2026-11-16 — Validators by module and signup hardening

- Change: `authValidation.js` was moved to `src/server/utils/validators/` and now
  returns the normalized values used by `authService`. `email`/`password` are
  required to be strings, email with the basic format `local@domain`, a
  non-empty password, and `role_id`/`stakeholder_id` positive integers. `signup`
  translates `SequelizeForeignKeyConstraintError` to `409 role_id or stakeholder_id does not exist`.
- Impact: Invalid payloads that previously reached the database and produced
  `500` now respond `400`; nonexistent role/stakeholder references respond `409`.
  Login normalizes the email from the validator and keeps
  `401 Invalid email or password`. The JWT log in `authController.login` was also
  removed.
- Verification: Runtime tests against the server: signup `{}` → `400`; numeric or
  invalid email → `400`; blank password → `400`; non-numeric `role_id` → `400`;
  nonexistent role/stakeholder → `409`; valid signup with normalized email/IDs →
  `201`; duplicate email → `409`; login with incorrect password → `401`; valid
  login → `200` and token accepted at `/api/users`. Temporary data removed.

## 2026-11-16 — Auth validation moved to shared utilities

- Change: Signup/login payload validation and email normalization were extracted
  from `authService` to `src/server/utils/authValidation.js`, preserving the same
  required fields, normalization (`trim` + lowercase), and error messages.
- Impact: No change in the behavior of `POST /api/auth/signup` and
  `POST /api/auth/login`; the validation logic now resides in a shared utility.
- Verification: `node --check` on `src/server/services/authService.js` and
  `src/server/utils/authValidation.js` (no errors). No functional endpoint tests
  were run in this session.

## 2026-11-13 — Login and JWT protection

- Change: `POST /api/auth/login` was added with validation, user lookup, and
  `bcrypt.compare`. Token generation lives in `utils/generateToken.js` (payload
  `{ user_id, role_id }`, 1 h expiration by default). The `checkAuth` middleware
  was added to require a Bearer token.
- Impact: `/api/auth/signup` and `/api/auth/login` are public. The remaining
  routes mounted after `checkAuth` in `api.js` (currently `/api/users` and
  `/api/roles`) require `Authorization: Bearer <token>`; without a token or with
  an invalid token they respond `401`. Login responds `200`, `400` for missing
  fields, and `401` for invalid credentials.
- Verification: `GET /api/users` and `GET /api/roles` without a token → `401`;
  with a valid token generated by `generateToken` → `200`; invalid token → `401`;
  `POST /api/auth/login` with an empty body → `400` and with incorrect
  credentials → `401`. Successful login is pending test credentials.
- Note: The session design with refresh tokens was documented in
  `FUTURE_SESSIONS.md`; it is not implemented.
