---
name: admin
description: Client admin shell, /admin routes, RequireAdmin guard, and the contract for future admin domain phases.
---

# admin

Client admin shell. The API is the authority: `/api/admin/*`
is protected by `requireAdmin` (see the `auth` module). The client guard only
prevents showing interfaces the user cannot use.

The change history is in [`CHANGELOG.md`](CHANGELOG.md).

## Routes

`src/client/main.jsx` registers `/admin` inside `RequireAuth`, then applies
`RequireAdmin` and mounts `AdminLayout`:

| Route | View | File | Status |
| --- | --- | --- | --- |
| `/admin` | redirect | `src/client/main.jsx` | goes to `/admin/dashboard` |
| `/admin/dashboard` | `AdminDashboard` | `src/client/views/admin/AdminDashboard.jsx` | implemented |
| `/admin/users` | `AdminUsers` | `src/client/views/admin/AdminUsers.jsx` | implemented |
| `/admin/stakeholders` | `AdminStakeholders` | `src/client/views/admin/AdminStakeholders.jsx` | implemented |
| `/admin/loans` | `AdminLoans` | `src/client/views/admin/AdminLoans.jsx` | implemented |
| `/admin/payments` | `AdminPayments` | `src/client/views/admin/AdminPayments.jsx` | implemented |

## Permissions

`RequireAdmin` (`src/client/contexts/AuthContext.jsx`) waits for session
hydration, redirects to `/login` if there is no user and to `/loans` if
`user.Role.role_name` is not `admin`. It reads the user loaded by
`GET /api/users/auth`; it does not perform its own checks against the API.
`RequireAuth` first redirects accounts with `must_change_password = true` to
`/change-password`, so an admin with a temporary password cannot reach the
panel until it is replaced. `LoanListHeader` shows the `Admin` link only when
the role is `admin`. A `403` from the backend remains the last line of defense.

## Components

- `src/client/layouts/AdminLayout.jsx`: shell with a title, `AdminNav` and `Outlet`.
- `src/components/admin/AdminNav.jsx`: navigation with `NavLink`; the active item uses
  `buttonVariants` with `variant="default"` and the others with `"outline"`.
- `src/components/admin/AdminPlaceholder.jsx`: reusable placeholder card;
  no longer used by the panel views.
- `src/components/admin/users/`: users UI (`AdminUsersHeader`,
  `AdminUsersAlerts`, `AdminUsersTable`, `AdminUserRow`,
  `AdminUserEditDialog`, `AdminUserCreateDialog` and
  `AdminUserResetPasswordDialog`). The table lists from `GET /api/users` and
  marks accounts with `must_change_password` as `Password pending`. The edit
  dialog sends `PATCH /api/admin/users/:userId` for role and status and, if
  there is a linked person, `PUT /api/stakeholders/:id` for their data. The
  create dialog posts `POST /admin/users` and the reset dialog posts
  `POST /admin/users/:userId/reset-password`; both display the returned
  temporary password once with a warning.
- `src/components/admin/stakeholders/`: stakeholders UI
  (`AdminStakeholdersHeader`, `AdminStakeholdersAlerts`,
  `AdminStakeholdersTable`, `AdminStakeholderRow`,
  `StakeholderFormFields`, `AdminStakeholderFormDialog` and
  `DeleteStakeholderDialog`). It uses the existing endpoints of
  `/api/stakeholders` to create, edit and delete; `StakeholderFormFields` is
  also reused in the users dialog. The table hides people linked to accounts.
- `src/client/hooks/useAdminLoans.js` and `src/components/admin/loans/`
  (`AdminLoansHeader`, `AdminLoansAlerts`, `AdminLoansTable`, `AdminLoanRow` and
  `ReassignLenderDialog`): list loans with `GET /api/loans` and reassign the
  lender with `PATCH /api/loans/:id`. The dialog options come from
  `GET /api/users` filtered to accounts with the `lender` role; the loan's
  customer is excluded and loading, error and success statuses are shown.
- `src/client/hooks/useAdminPayments.js` and `src/components/admin/payments/`
  (`AdminPaymentsHeader`, `AdminPaymentsAlerts`, `AdminPaymentsTable`,
  `AdminPaymentRow` and `AdminPaymentRecordDialog`): list payments with
  `GET /api/payments`, record installments or pending interest with the
  existing endpoints and reuse `usePaymentRevert` with `RevertPaymentDialog`
  for reversals. The recording options come from `GET /api/loans`.
- `src/client/hooks/useAdminDashboard.js`, `src/client/utils/adminDashboard.js`
  and `src/components/admin/dashboard/` (`AdminDashboardHeader`,
  `AdminDashboardAlerts`, `AdminDashboardCards`, `AdminDashboardStatus`,
  `AdminDashboardPaymentTrend` and `AdminDashboardRecentPayments`): calculate
  loan, installment, interest and payment metrics on the client from
  `GET /api/loans` and `GET /api/payments`.
- `src/client/views/admin/*.jsx`: domain phases replace only the content of
  their own file; no panel view is still a stub.
- `src/components/loans/list/LoanListHeader.jsx`: `Admin` link for admins.

## Contract for future phases

- P3 users: `/admin/users` reuses `GET /api/users` for listing and uses
  `PATCH /api/admin/users/:userId` to change `role_name` and `is_active`.
  The same dialog edits the linked stakeholder's data with
  `GET /api/stakeholders/:id` and `PUT /api/stakeholders/:id`; if the account
  has no linked person, only role and status are shown. Creation uses
  `POST /api/admin/users` with `{ email, stakeholder_id, role_name }` and
  password reset uses `POST /api/admin/users/:userId/reset-password`; both
  return a one-time `temporary_password`. There is no duplicate `GET` under
  `/api/admin/users` and no combined endpoint. Public signup does not exist.
- P4 stakeholders: the panel reuses the `/api/stakeholders` CRUD. `POST`,
  `PUT`, `PATCH` and `DELETE` use `requireAdmin`; both `GET`s remain available
  to any authenticated account and the loan forms are unchanged.
  The view hides people referenced by `user.stakeholder_id`, without
  filtering the API.
- P5 loans: `POST`, `PUT` and `PATCH` of `/api/loans` apply
  `requireAdminForLenderChange`; the admin view lists with `GET /api/loans` and
  reassigns lenders with `PATCH /api/loans/:id`, with no endpoints under
  `/api/admin`. The dropdown only offers accounts with the `lender` role read
  from `GET /api/users`; the listing and the dialog reuse the formatting
  helpers from `loans` and the existing shadcn primitives.
- P6 payments: `/admin/payments` lists `GET /api/payments` for `admin` and uses
  `GET /api/loans` to offer only pending installments and `separate`, unpaid
  interest. Recording sends `POST /api/payments/installment` or
  `POST /api/payments/interest` with the amount calculated by the destination;
  the reversal reuses `DELETE /api/payments/:id` via `usePaymentRevert`.
  There is no generic `POST /api/payments` and no duplicate endpoints under `/admin`.
- P7 dashboard: `/admin/dashboard` calculates metrics on the client from
  `GET /api/loans` and `GET /api/payments`, with no dedicated endpoint.
  `adminDashboard.js` summarizes loans, paid/pending/overdue installments,
  `included` or `separate` interest and payments by month; the view shows
  cards, portfolio status, payment trend and the most recent payments.
- No functionality is duplicated under `/admin`; user administration
  (create, reset, role and status) lives under that prefix.

## Files

- `src/client/main.jsx`
- `src/client/contexts/AuthContext.jsx`
- `src/client/views/ChangePassword.jsx`
- `src/client/hooks/useChangePassword.js`
- `src/client/layouts/AdminLayout.jsx`
- `src/components/admin/AdminNav.jsx`
- `src/components/admin/AdminPlaceholder.jsx`
- `src/components/admin/users/`
- `src/components/admin/stakeholders/`
- `src/components/admin/loans/`
- `src/components/admin/payments/`
- `src/components/admin/dashboard/`
- `src/client/hooks/useAdminUsers.js`
- `src/client/hooks/useAdminStakeholders.js`
- `src/client/hooks/useAdminLoans.js`
- `src/client/hooks/useAdminPayments.js`
- `src/client/hooks/useAdminDashboard.js`
- `src/client/utils/userForm.js`
- `src/client/utils/stakeholderForm.js`
- `src/client/utils/adminDashboard.js`
- `src/client/views/admin/`
- `src/components/loans/list/LoanListHeader.jsx`
