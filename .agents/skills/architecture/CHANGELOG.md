# Changelog — architecture

## 2026-11-27 — Documented authorization boundary and global reads

- Change: documented lender ownership scoping for loans/payments alongside the
  intentional authenticated global reads for users and stakeholders.
- Impact: the exception is explicit and does not weaken ownership checks for
  loans, payments, or mutations; complete read-enumeration BOLA/IDOR protection
  is not claimed without instructor approval.
- Verification: service and route implementations reviewed; reproducible
  runtime procedures are recorded in `docs/security/red-team-audit.md`.

## 2026-11-27 — Centralized API error middleware

- Change: added terminal `errorHandler` middleware and removed duplicated
  controller-local `try/catch` error translation.
- Impact: validators and services continue throwing the same typed errors, while
  Express 5 forwards rejected async controller promises to one consistent JSON
  response handler. Unexpected errors are logged and do not expose details.
- Verification: backend syntax, focused typed/unexpected error mapping, and
  `pnpm build` passed.

## 2026-11-27 — CORS, headers, and request limits

- Change: added environment-configured CORS, Helmet security headers, API-wide
  rate limiting, and a stricter login rate limit through `security.js`.
- Impact: browser credentials are only sent to exact configured origins; all API
  routes receive standard rate-limit protection and login receives additional
  brute-force protection. Dependency RFC and audit evidence are in `docs/`.
- Verification: `pnpm audit --json` found two pre-existing moderate transitive
  advisories; no new security-middleware advisory. `node --check` and
  `pnpm build` succeeded. Not tested against a running server.

## 2026-11-27 — Cookie-based JWT authentication

- Change: implemented the OpenAPI cookie-JWT contract: login sets the
  `access_token` cookie, `checkAuth` reads it, and logout clears it.
- Impact: protected API routes no longer accept browser-provided Bearer tokens;
  the cookie retains `HttpOnly`, `SameSite=Strict`, and production `Secure`
  attributes.
- Verification: `pnpm build` succeeded. Not tested in a browser or against a
  server.

## 2026-11-27 — OpenAPI contract governance

- Change: added `docs/openapi.json` as the canonical API contract and documented
  the contract-first workflow in the architecture module.
- Impact: endpoint changes must update the contract before implementation. The
  document defines the approved cookie-JWT target and planned logout endpoint;
  current Bearer authentication remains until that migration is implemented.
- Verification: JSON contract reviewed against routes, controllers, validators,
  services, README API documentation, and module contracts.

## 2026-11-26 — Admin user provisioning and forced password change

- Change: `api.js` mounts `requirePasswordChanged` after `checkAuth`;
  `AdminRouter` gained `POST /users` and `POST /users/:userId/reset-password`;
  `UserRouter` gained `PATCH /me/password`. Public signup was removed.
- Impact: accounts with `must_change_password = true` can reach only session
  hydration and password change until they set a new password. All new routes
  keep the routes → controllers → services → models layering and typed errors.
- Verification: `node --check` on modified backend files, validator smoke
  tests, and middleware path checks passed; no live API tests.

## 2026-11-25 — Admin guard on stakeholder mutations

- Change: `stakeholderRoutes.js` passes `requireAdmin` to `POST`, `PUT`, `PATCH`,
  and `DELETE`; `GET`s remain with only `checkAuth`.
- Impact: the middleware is reused outside `/api/admin` without changing the
  layer order or the services. Loan forms retain the stakeholder listing.
- Verification: `pnpm build` built successfully; no live API tests.

## 2026-11-25 — Direct route for user administration

- Change: `AdminRouter` defines `PATCH /users/:userId` with a dedicated
  controller, service, and validator. The service reuses `authUser` for the
  projection and resolves the role by name. No subrouter was created.
- Impact: the admin router now has a real route without adding a layer that
  provides no value. The listing is not duplicated: it remains at
  `GET /api/users`.
- Verification: `pnpm build` built successfully; no live API tests.

## 2026-11-25 — Database-backed authentication and admin router

- Change: `checkAuth` became asynchronous: after verifying the JWT it queries
  `users`/`Role`, rebuilds `req.user` from the database, and rejects inactive
  accounts. The `requireAdmin` and `requireAdminForLenderChange` middlewares were
  added; `api.js` mounts `AdminRouter` at `/api/admin`, which centralizes
  `requireAdmin` and does not yet define any endpoints.
- Impact: the layers and typed error handling do not change. Services receive
  `req.user` with the role currently in the database, not just the token claim.
  The `/api/admin/*` routes are behind `requireAdmin`.
- Verification: `pnpm build` and diff review; no live API tests.

## 2026-11-18 — Payments router

- Change: `PaymentRouter` was mounted at `/api/payments` after `checkAuth` in
  `src/server/api.js`. `paymentValidation.js` was added to the validation layer
  and `paymentService` reuses `loanScope` from `loanService` for lender
  filtering.
- Impact: New protected routes for reading and recording payments. The layer
  pattern and typed error handling do not change.
- Verification: `node --check` on the new and modified files; service tests with
  installment and interest payments, lender/admin scoping, and `409` conflicts.
  Temporary data removed.

## 2026-11-17 — User identity and 403 errors

- Change: `generateToken` includes `role_name` and `stakeholder_id`, `checkAuth`
  exposes them in `req.user`, and loan controllers pass `req.user` to their
  services. `ForbiddenError` was added to `utils/errors.js` with code 403.
- Impact: services can apply permission and ownership rules without knowing
  HTTP; tokens issued before the change lack those claims and expire in 1 hour.
  `admin` retains global access to loans.
- Verification: `node --check` on the modified files; signup/login returned
  `role_name` and the JWT included `stakeholder_id`; loan routes respected
  lender scoping.

## 2026-11-16 — Validators centralized by module

- Change: The auth, stakeholder, and loan validators were moved to
  `src/server/utils/validators/`, with shared helpers in `common.js`. Services
  import their domain validator and controllers still do not validate.
- Impact: The `utils/` structure is now `errors.js`, `generateToken.js`, and
  `validators/`. The HTTP contract does not change beyond the specific rules
  documented in each module.
- Verification: `node --check` across all of `src/server` and runtime tests of
  auth, stakeholders, and loans with a token; database counts restored.

## 2026-11-16 — Loan router

- Change: `LoanRouter` was mounted at `/api/loans` after `checkAuth` in
  `src/server/api.js`, following the layered pattern
  (`routes → controllers → services → models`).
- Impact: New protected routes under `/api/loans` (loan CRUD). They require
  `Authorization: Bearer <token>`.
- Verification: `node --check` on `src/server/api.js`,
  `src/server/routes/loanRoutes.js`, `src/server/controllers/loanController.js`,
  `src/server/services/loanService.js`, and
  `src/server/utils/loanValidation.js` (no errors). No functional endpoint tests
  were run in this session.

## 2026-11-13 — Stakeholder router

- Change: `StakeholderRouter` was mounted at `/api/stakeholders`, after
  `checkAuth`. `NotFoundError` (`404`) was added to the typed errors.
- Impact: Stakeholder routes require a Bearer token; nonexistent resources
  respond `404`.
- Verification: `node --check` on the new and modified files; full CRUD tested at
  runtime with a token.

## 2026-11-13 — Authentication middleware and protected routes

- Change: `middlewares/checkAuth.js` and `utils/generateToken.js` were
  documented, along with the new order in `api.js`: public `/auth` first, then
  `checkAuth`, then `/users` and `/roles`.
- Impact: Every router registered after `checkAuth` requires
  `Authorization: Bearer <token>`; without a token or with an invalid token it
  responds `401`. `UnauthorizedError` was added to the typed errors.
- Verification: `GET /api/users` and `GET /api/roles` without a token → `401`;
  with a valid token → `200`; invalid token → `401`.

## 2026-11-13 — Layered architecture and global routing

- Change: The API was reorganized into Models, Services, Controllers, and Routes.
  `utils/errors.js` was added with typed errors and all routing was moved to
  `api.js`, which now only mounts the module routers.
- Impact: The inline routes in `api.js` were removed. Every endpoint goes through
  a controller and a service; services do not depend on `req`/`res`.
- Verification: `node --check` on all files; server started and `GET /api/roles`,
  `GET /api/users`, and `POST /api/auth/signup` with an empty body responded 200,
  200, and 400 respectively.
