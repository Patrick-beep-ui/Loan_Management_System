---
name: architecture
description: Layered backend architecture for the API: models, services, controllers, routes, middleware, typed errors, and global routing.
---

# architecture

The backend uses four layers. Each has a single responsibility and communicates
only with the layer immediately below it.

```
Routes → Controllers → Services → Models → MySQL
```

The changelog for this module is in [`CHANGELOG.md`](CHANGELOG.md).

## Layers

- **Models** (`src/server/models/`): map MySQL tables with Sequelize. They
  declare fields, constraints, and associations. See the `models` module.
- **Services** (`src/server/services/`): business logic and operations. They know
  nothing about `req`, `res`, or HTTP; they receive data and return results or
  throw errors. They are designed for unit testing.
- **Controllers** (`src/server/controllers/`): receive `req`/`res`, pass data to
  the service, and build the response. They contain no business logic.
- **Routes** (`src/server/routes/`): define method and URL and delegate to the
  corresponding controller.

## Input validation

Validation lives in `src/server/utils/validators/`, separated by module:

- `common.js`: shared helpers for positive integers, optional strings with a
  maximum length, and finite numbers with bounds.
- `authValidation.js`, `stakeholderValidation.js`, `loanValidation.js`, and
  `paymentValidation.js`: build the validated/normalized attributes received by
  the services.

Controllers do not validate: they pass `req.body` to the service (and `req.user`
when the operation depends on permissions or ownership), and the domain
validator throws `ValidationError` (`400`) for invalid data. Validators may
receive the stored record (for example in `PATCH /api/loans/:id`) to resolve
rules that depend on the current status. Services contain no input validation:
they only persist and report status conflicts, such as existing payments, via
`ConflictError` (`409`).

## Global routes

`src/server/api.js` is the root router mounted at `/api` from `main.js`. It
imports `models/associations.js`, registers the public routers, and then applies
`checkAuth` to everything that follows:

```js
api.use("/auth", AuthRouter); // public: login

api.use(checkAuth); // protects everything registered below
api.use(requirePasswordChanged); // temporary passwords can only be changed

api.use("/admin", AdminRouter); // /api/admin (admin only)
api.use("/users", UserRouter); // /api/users
api.use("/roles", RoleRouter); // /api/roles
api.use("/stakeholders", StakeholderRouter); // /api/stakeholders
api.use("/loans", LoanRouter); // /api/loans
api.use("/payments", PaymentRouter); // /api/payments
```

Order matters: any router registered after `checkAuth` requires the
`access_token` HttpOnly cookie.

## API contract

`docs/openapi.json` is the canonical API contract. It must be updated before
adding or changing endpoints, request bodies, responses, error statuses, or
authorization behavior. It defines the approved target cookie-based JWT scheme
and planned `POST /api/auth/logout`; current code still uses Bearer tokens until
the authentication migration implements that contract.

`AdminRouter` (`src/server/routes/adminRoutes.js`) applies `requireAdmin` to
everything registered below it and directly defines `POST /users` →
`POST /api/admin/users`, `POST /users/:userId/reset-password` →
`POST /api/admin/users/:userId/reset-password`, and `PATCH /users/:userId` →
`PATCH /api/admin/users/:userId`. There are no per-resource subrouters; the
listing remains at `GET /api/users`.

## Middlewares

- `src/server/config/security.js`: parses the exact
  `CORS_ALLOWED_ORIGINS` allowlist, configures Helmet headers, and exports the
  API-wide plus login-specific rate limiters. Unknown browser origins receive no
  CORS permission, credentials are never paired with a wildcard origin, and
  same-origin requests need no CORS header. The production CSP permits only the
  application and configured Google Fonts sources; development disables CSP for
  Vite while retaining the other Helmet headers.
- `src/server/middlewares/checkAuth.js`: validates the JWT from the
  `access_token` cookie, queries `users` and `Role` in the
  database, and sets `req.user = { user_id, role_id, role_name, stakeholder_id,
  must_change_password }` with up-to-date values. Responds `401` if the token is
  missing, invalid, the user does not exist, or the account is inactive
  (`is_active = false`).
- `src/server/middlewares/requirePasswordChanged.js`: when
  `req.user.must_change_password` is true, allows only `/users/auth` and
  `/users/me/password`; every other path responds `403 Password change required`.
- `src/server/middlewares/requireAdmin.js`: responds `403` if the authenticated
  user's role is not `admin`; `api.js` applies it to the `/api/admin` router and
  `stakeholderRoutes.js` applies it to its mutations. Stakeholder `GET`s remain
  behind `checkAuth` only.
- `src/server/middlewares/requireAdminForLenderChange.js`: responds `403` when a
  non-admin sends a `lender_id` different from its own `stakeholder_id`.

Token signing lives in `src/server/utils/generateToken.js` (payload
`{ user_id, role_id, role_name, stakeholder_id }`, expiration `JWT_EXPIRES_IN` or
`1h`). Loan services use `role_name` and `stakeholder_id` to authorize and filter
by ownership; the `payments` module reuses `loanScope` from `loanService` to
apply the same filter.

## Route convention

Routers use `Router.route(path)` and chain the verbs on the following lines, one
method per line:

```js
UserRouter.route("/")
    .get(getAllUsers);

UserRouter.route("/me/password")
    .patch(changePassword);
```

## Error handling

`src/server/utils/errors.js` defines typed errors that services throw and
controllers translate into HTTP codes:

- `AppError` — base, with `statusCode` (500 by default).
- `ValidationError` — invalid input (400).
- `ConflictError` — conflict with existing data, for example duplicate email
  (409).
- `UnauthorizedError` — invalid credentials or missing/expired token (401).
- `ForbiddenError` — operation not allowed for the role or another lender's
  resource (403).
- `NotFoundError` — nonexistent resource (404).

Controllers use `try/catch`: if the error is an `AppError` they respond with
`error.statusCode` and `{ error: error.message }`; any other error is logged and
responds `500` with `{ error: "Internal Server Error" }`.

## Status codes

- `200` successful read.
- `201` resource created.
- `400` missing or invalid data.
- `401` invalid credentials or missing/expired token.
- `403` operation not allowed for the authenticated user.
- `404` nonexistent resource.
- `409` uniqueness conflict.
- `429` rate limit exceeded.
- `500` unexpected error.
