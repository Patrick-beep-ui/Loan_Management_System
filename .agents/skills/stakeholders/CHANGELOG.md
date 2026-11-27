# Changelog — stakeholders

## 2026-11-25 — Hide people linked to accounts in the panel

- Change: `useAdminStakeholders` combines `GET /api/stakeholders` with
  `GET /api/users` and excludes from the panel table people whose
  `stakeholder_id` belongs to any account, active or inactive.
- Impact: the CRUD and the API `GET`s do not change; loan forms still see
  lenders. Only the admin view stops showing lenders and administrators as
  manageable stakeholders.
- Verification: `pnpm build` built successfully (2564 modules). It was not
  tested in a browser or against a server, at the user's request.

## 2026-11-25 — Mutations restricted to administrators

- Change: `stakeholderRoutes.js` applies `requireAdmin` to `POST`, `PUT`,
  `PATCH` and `DELETE`. `GET /api/stakeholders` and
  `GET /api/stakeholders/:id` remain available to any authenticated account.
- Impact: `lender` accounts can still read stakeholders to create or edit
  loans, but cannot create, modify, or delete people. The field rules and CRUD
  error codes do not change; mutations can now return
  `403 Admin access required`.
- Verification: `pnpm build` built successfully. It was not tested against a
  server or in a browser, at the user's request.

## 2026-11-16 — Validator relocated to `utils/validators`

- Change: `stakeholderValidation.js` was moved to `src/server/utils/validators/`
  and now reuses `parsePositiveInteger` and `parseOptionalString` from
  `validators/common.js`.
- Impact: No changes in behavior, rules, or messages in `/api/stakeholders`;
  only the file location and its import in `stakeholderService` changed.
- Verification: `node --check` on the validators and the service; runtime tests
  of auth/loans/stakeholders with temporary data run in the same session, with
  no regressions in stakeholder CRUD.

## 2026-11-16 — Validators moved to shared utilities

- Change: The input validators and parsers were extracted from
  `stakeholderService` (`validateField`, attribute construction for
  creation/replacement/partial update, and `parseStakeholderId`) to
  `src/server/utils/stakeholderValidation.js` to centralize and reuse them,
  keeping the same validation rules and messages.
- Impact: No changes to API behavior or routes/data; `stakeholderService` now
  imports validation from shared utilities.
- Verification: `node --check` on `src/server/services/stakeholderService.js`
  and `src/server/utils/stakeholderValidation.js` (without errors). No
  functional endpoint tests were run in this session.

## 2026-11-13 — Stakeholder CRUD

- Change: The complete `stakeholders` CRUD was added in `stakeholderRoutes` →
  `stakeholderController` → `stakeholderService`: listing, get by id, creation
  (`POST`), replacement (`PUT`), partial update (`PATCH`) and deletion
  (`DELETE`). Validation lives in the service. `NotFoundError` (`404`) was
  added to `utils/errors.js`.
- Impact: New routes protected by `checkAuth` under `/api/stakeholders`. A
  duplicate `national_id` responds `409`; deleting a stakeholder referenced by
  users, loans, or guarantors responds `409`. `PUT` requires names and clears
  omitted optional fields; `PATCH` requires at least one field.
- Verification: `node --check` on all files. Runtime tests with token:
  listing, get, `400` for id/fields/enum/date, `404`, `201`, `409` for
  duplicate `national_id`, successful `PUT` and `PATCH`, `204` on deletion,
  subsequent `404`, and `409` when trying to delete a referenced stakeholder.
  A temporary record was used and deleted at the end.
- Note: `Stakeholder.date_of_birth` changed to `DataTypes.DATEONLY` to match
  the `date` column in MySQL.
