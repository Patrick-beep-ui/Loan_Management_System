---
name: roles
description: Roles module: listing access roles through the roles service, controller, and routes.
---

# roles

Module for querying access roles.

This module's change history is in [`CHANGELOG.md`](CHANGELOG.md).

## Endpoint

| Method | Route | Controller | Service |
| --- | --- | --- | --- |
| `GET` | `/api/roles` | `roleController.getAllRoles` | `roleService.getAllRoles` |

## Behavior

- Requires authentication: `Authorization: Bearer <token>`; without a token or
  with an invalid token it responds `401`. This is applied by `checkAuth` in `api.js`.
- Returns all `roles` records (`role_id`, `role_name`, dates).
- Responds `200` with the array of roles.
- On an unexpected error it responds `500` with `{ error: "Internal Server Error" }`.

## System roles

The roles are `admin` and `lender`. `lender` replaced `operator` through the
migration `2026-11-17-rename-operator-role-to-lender.sql`, which preserves
`role_id`; therefore users assigned to the old `operator` are now lenders with
no changes to their foreign keys.

Public signup was removed. `POST /api/admin/users` creates `admin` or `lender`
accounts by resolving `role_id` from `role_name` in the payload; the first
`admin` is provisioned with `pnpm seed:admin`.

## Files

- `src/server/routes/roleRoutes.js`
- `src/server/controllers/roleController.js`
- `src/server/services/roleService.js`
