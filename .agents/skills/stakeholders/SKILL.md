---
name: stakeholders
description: Stakeholders CRUD: people who participate in loans, with field validation, unique national_id, and referral-safe deletion.
---

# stakeholders

CRUD for people (`stakeholders`) who participate in loans as lenders, customers,
or guarantors.

The change history of this module is in [`CHANGELOG.md`](CHANGELOG.md).

## Endpoints

All routes require `Authorization: Bearer <token>`. Mutations additionally
require the `admin` role.

| Method | Route | Controller | Service | Access |
| --- | --- | --- | --- | --- |
| `GET` | `/api/stakeholders` | `stakeholderController.getAllStakeholders` | `stakeholderService.getAllStakeholders` | token |
| `GET` | `/api/stakeholders/:id` | `stakeholderController.getStakeholderById` | `stakeholderService.getStakeholderById` | token |
| `POST` | `/api/stakeholders` | `stakeholderController.createStakeholder` | `stakeholderService.createStakeholder` | admin |
| `PUT` | `/api/stakeholders/:id` | `stakeholderController.replaceStakeholder` | `stakeholderService.replaceStakeholder` | admin |
| `PATCH` | `/api/stakeholders/:id` | `stakeholderController.updateStakeholder` | `stakeholderService.updateStakeholder` | admin |
| `DELETE` | `/api/stakeholders/:id` | `stakeholderController.deleteStakeholder` | `stakeholderService.deleteStakeholder` | admin |

## Fields

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `stakeholder_id` | integer | — | Auto-incrementing PK; in the URL it must be a positive integer. |
| `first_name` | text | yes | `trim`, non-empty, max 100 characters. |
| `last_name` | text | yes | `trim`, non-empty, max 100 characters. |
| `national_id` | text | no | `trim`, max 50; unique; `""` is stored as `null`. |
| `marital_status` | enum | no | `single` or `married`; `""` is stored as `null`. |
| `occupation` | text | no | `trim`, max 100; `""` is stored as `null`. |
| `date_of_birth` | date | no | Format `YYYY-MM-DD` and a valid date; `""` is stored as `null`. |

## Endpoint behavior

- `GET /`: returns all stakeholders sorted by `last_name` and then `first_name`
  (`200`).
- `GET /:id`: returns the stakeholder or `404` if it does not exist.
- `GET /` and `GET /:id` remain available to any authenticated account; the
  loan form depends on `GET /` to choose lenders, customers, and guarantors.
- `GET /` does not filter by account: the API returns all stakeholders. The
  `/admin/stakeholders` view also lists all of them, including people linked to
  an account; account data is still managed from `/admin/users`.
- `POST`, `PUT`, `PATCH` and `DELETE` pass through `requireAdmin` in
  `stakeholderRoutes.js`. A `lender` receives `403 Admin access required`.
- `POST /`: creates the stakeholder (`201`) and returns the created record. If
  the `national_id` already exists it returns `409`.
- `PUT /:id`: full replacement (`200`). Requires `first_name` and `last_name`;
  omitted optional fields are stored as `null`.
- `PATCH /:id`: partial update (`200`). Changes only the fields sent and
  requires at least one; an empty body returns `400`.
- `DELETE /:id`: deletes the stakeholder (`204`, no body). If referenced by
  `users`, `loans` or `loan_guarantors`, it returns `409` and does not delete
  it.

Unknown fields are ignored. A non-numeric `:id` or one less than or equal to
zero returns `400`.

`POST` and `PUT` of `/api/loans` can also create inline stakeholders for
guarantors. Those records use the same field rules and unique `national_id`,
but are managed from the `loans` module and not from this CRUD.

## Admin stakeholder profile

`/admin/stakeholders/:id` is a client-only view; it adds no API route. It reads
the person with `GET /api/stakeholders/:id`, the loan list with `GET /api/loans`
(global for an admin) and the account list with `GET /api/users`.
`src/client/utils/stakeholderProfile.js` associates a stakeholder with a loan
when they are its `lender_id`, its `customer_id`, or a
`guarantors[].guarantor_stakeholder_id`. One loan can produce several roles.
The profile displays personal information, linked account data, counts by role,
and one row per associated loan with links to `/loans/:id`. The dashboard uses
the same helper for its compact stakeholder card.

Collateral remains an asset with a description and estimated value; it has no
stakeholder link in the schema. People who back a loan are represented as
guarantors and appear with the `guarantor` role in the profile.

The stakeholder name in the existing admin table links to the profile. Columns,
styling, `Edit`, and `Delete` are unchanged, and all stakeholders are listed,
including those linked to accounts.

## Errors

- `400` required fields, invalid enum, date, or length; invalid `:id`.
- `401` token missing or invalid (applied by `checkAuth`).
- `403` mutation attempted by an account that is not `admin`.
- `404` stakeholder nonexistent.
- `409` duplicate `national_id` or stakeholder referenced on deletion.
- `500` unexpected error.

## Files

- `src/server/routes/stakeholderRoutes.js` (mounted on `/api/stakeholders`)
- `src/server/controllers/stakeholderController.js`
- `src/server/services/stakeholderService.js`
- `src/server/utils/validators/stakeholderValidation.js`
- `src/server/models/Stakeholder.js`
- `src/client/utils/stakeholderProfile.js`
- `src/client/hooks/useAdminStakeholderProfile.js`
- `src/client/views/admin/AdminStakeholderProfile.jsx`
- `src/components/admin/stakeholders/` (profile sections and linked table name)
- `src/components/admin/dashboard/AdminDashboardStakeholders.jsx`
