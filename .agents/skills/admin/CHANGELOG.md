# Changelog — admin

## 2026-11-26 — Stakeholder profiles from the dashboard and table

- Change: added `/admin/stakeholders/:id`, `useAdminStakeholderProfile`,
  `stakeholderProfile.js`, four profile components and a compact
  `AdminDashboardStakeholders` card. Stakeholder names in the existing table
  and the dashboard card link to the profile; columns, `Edit`, and `Delete`
  remain unchanged. The filter that hid people linked to user accounts was
  removed from `useAdminStakeholders`.
- Impact: admins can open a person's personal information, linked account,
  role counts, and all associated loans with lender/customer/guarantor roles.
  `/admin/dashboard` now reads `GET /api/stakeholders` in addition to loans and
  payments. No API route or schema was added: the profile aggregates existing
  reads on the client and a single loan can show several roles.
- Verification: `pnpm build` succeeded and a Node smoke check confirmed the
  multi-role aggregation. Not tested in a browser or against a server.

## 2026-11-26 — Overdue installments in the dashboard

- Change: the dashboard now renders an overdue-installment table from the
  existing `GET /api/loans` data. `buildOverdueInstallments` and the shared
  `loanStatus.js` helper drive the card count, the sorted list and the
  `Overdue` badge in loan details. Each row links to `/loans/:id` with
  `state.focusInstallmentId` to highlight and scroll to that installment.
- Impact: admins can see and open overdue installments directly. Separate
  interest remains outside the list because it has no `due_date`; no API,
  endpoint or status-transition behavior changed.
- Verification: `pnpm build` succeeded and a Node smoke check confirmed the
  helper marks a past-due pending installment, accepts a due-today installment
  and ignores paid ones. Not tested in a browser or against a server.

## 2026-11-26 — Admin user creation and password reset UI

- Change: `/admin/users` gained a `New user` dialog and a per-row `Reset
  password` action backed by `POST /api/admin/users` and
  `POST /api/admin/users/:userId/reset-password`. `useAdminUsers` filters
  stakeholders not linked to an account and shows the one-time temporary
  password. Rows mark `must_change_password` as `Password pending`.
- Impact: admins can provision `admin` and `lender` accounts and reset
  credentials without public signup. `RequireAuth` sends accounts with a
  pending password change to `/change-password` before the panel is reachable.
- Verification: `pnpm build` succeeded and no `signup` references remain in the
  frontend; no live browser or API tests were performed.

## 2026-11-25 — P7 dashboard implemented

- Change: `/admin/dashboard` was no longer a stub. `useAdminDashboard`,
  `src/client/utils/adminDashboard.js` and six components
  under `src/components/admin/dashboard/` were added to aggregate metrics
  on the client.
- Impact: the panel summarizes loans, amounts, overdue installments, interest
  and payments using only `GET /api/loans` and `GET /api/payments`. No dashboard
  endpoint was added and no business rules were changed.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-25 — P6 payments implemented

- Change: `/admin/payments` was no longer a stub. `useAdminPayments` and
  five components under `src/components/admin/payments/` were added for
  history, recording and reversals with the existing endpoints of `/api/payments`.
- Impact: the `admin` panel sees all payments, records pending installments or
  interest from `GET /api/loans` and reuses `usePaymentRevert` with
  `RevertPaymentDialog`. No routes were created under `/api/admin`.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-25 — Reassignment limited to `lender` accounts

- Change: `useAdminLoans` no longer uses `GET /api/stakeholders` for the lender
  options and now filters `GET /api/users` by `Role.role_name = "lender"`.
- Impact: `/admin/loans` only offers lenders linked to an account with that
  role; inactive accounts are kept and results are deduplicated. The payload
  of `PATCH /api/loans/:id` is unchanged.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-25 — P5 loans implemented

- Change: `/admin/loans` was no longer a stub. `useAdminLoans` and five
  components under `src/components/admin/loans/` were added to list loans and
  open a lender reassignment dialog.
- Impact: the view uses `GET /api/loans` (global for `admin`) and
  `PATCH /api/loans/:id` with `lender_id`, without duplicating endpoints under
  `/api/admin`. The dialog excludes the current customer and validates the
  selection before sending.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-25 — Editing adjustments for users and stakeholders

- Change: `/admin/stakeholders` hides people linked to accounts and the
  `/admin/users` dialog combines role/status with the linked stakeholder's
  data, reusing `StakeholderFormFields` and the existing endpoints.
- Impact: lenders and admins no longer appear as manageable stakeholders, but
  their data is edited from their account. Saving is still a two-step process
  (`PATCH` for the user and `PUT` for the stakeholder), with an explicit
  notice if the second step fails.
- Verification: `pnpm build` built successfully (2564 modules). It was not
  tested in a browser or against a server, at the user's request.

## 2026-11-25 — P4 stakeholders implemented

- Change: `/admin/stakeholders` was no longer a stub. `useAdminStakeholders`,
  `src/client/utils/stakeholderForm.js` and six components
  under `src/components/admin/stakeholders/` were added to create, edit and
  delete with the existing endpoints of `/api/stakeholders`.
- Impact: the panel offers full CRUD without duplicating routes under
  `/api/admin`. Mutations require `admin`; the `GET`s remain open to
  authenticated accounts for the loan forms.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-25 — P3 users implemented

- Change: `/admin/users` was no longer a stub. `useAdminUsers`, helpers in
  `src/client/utils/userForm.js` and the components under
  `src/components/admin/users/` were added for listing, updating and error
  display. The listing reuses `GET /api/users`; role and status changes use
  `PATCH /api/admin/users/:userId`.
- Impact: admins can edit accounts from the panel without touching the router.
  The API remains the authority: `requireAdmin` protects the mutation.
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.

## 2026-11-25 — Admin panel shell

- Change: `RequireAdmin`, the `AdminLayout` layout, `AdminNav`,
  `AdminPlaceholder`, five stub views under `src/client/views/admin/` and the
  `Admin` link in `LoanListHeader` were added. `main.jsx` registers `/admin`
  and its children behind `RequireAuth` and `RequireAdmin`.
- Impact: only `admin` accounts can open the panel; non-admins return
  to `/loans`. Future domain phases only replace the content of the stub
  views. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. It was not tested in a browser
  or against a server, at the user's request.
