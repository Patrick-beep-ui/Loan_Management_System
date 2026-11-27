# Changelog — frontend

### 2026-11-25 — P7 dashboard implemented

- Change: `AdminDashboard` was no longer a stub. `useAdminDashboard`,
  `src/client/utils/adminDashboard.js`, and six components under
  `src/components/admin/dashboard/` were added to aggregate metrics on the client.
- Impact: the view summarizes amounts, overdue installments, interest, and payments
  from `GET /api/loans` and `GET /api/payments`, with loading, error, and empty states.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-25 — P6 payment administration

- Change: `AdminPayments` was no longer a stub. `useAdminPayments` and
  five components under `src/components/admin/payments/` were added to list payments,
  record pending installments or interest, and reverse payments.
- Impact: the panel uses `GET /api/payments` and `GET /api/loans`, reuses
  `buildPaymentPayload`, `PaymentModalFields`, `usePaymentRevert`, and
  `RevertPaymentDialog`, and shows loading, empty, error, and success states.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-25 — Lender options for reassignment

- Change: `useAdminLoans` builds the `Reassign lender` dropdown from
  `GET /api/users`, filtering accounts with `Role.role_name = "lender"` instead of
  using all stakeholders. Options are deduplicated by
  `stakeholder_id`, show name and email, and retain inactive accounts.
- Impact: a loan can only be reassigned to people linked to a lender
  account. If the current lender no longer has that role, the dialog does not
  preselect them and requires choosing a valid option.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-25 — P5 loan administration

- Change: `AdminLoans` was no longer a stub. `useAdminLoans` and five
  components under `src/components/admin/loans/` were added to list loans and
  reassign the lender with `PATCH /api/loans/:id`.
- Impact: the panel uses `GET /api/loans` and `GET /api/stakeholders`, reuses the
  formats from `loanFormat.js`, and shows loading, empty, error, and success states.
  The dialog excludes the current customer and validates the chosen lender.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-25 — Combined user editing and stakeholder filtering

- Change: `StakeholderFormFields` was extracted and reused in the user dialog
  and the stakeholder form. `useAdminUsers` combines
  `PATCH /api/admin/users/:userId` with `PUT /api/stakeholders/:id`;
  `useAdminStakeholders` hides people linked to accounts.
- Impact: `/admin/users` edits role, status, and personal data in a single
  dialog, without duplicating the role field; `/admin/stakeholders` no longer shows
  lenders or admins. No endpoints were added.
- Verification: `pnpm build` built successfully (2564 modules). Not tested in
  a browser or against a server, at the user's request.

### 2026-11-25 — P4 stakeholder administration

- Change: `AdminStakeholders` was no longer a stub. `useAdminStakeholders`,
  `src/client/utils/stakeholderForm.js`, and six components under
  `src/components/admin/stakeholders/` were added to list, create,
  edit, and delete people using the existing endpoints of
  `/api/stakeholders`.
- Impact: the panel uses `GET`, `POST`, `PUT`, and `DELETE` from the current CRUD, with
  local validation, loading/empty/error/success states, and deletion confirmation.
  Loan forms still read `GET /api/stakeholders`.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-25 — P3 user administration

- Change: `AdminUsers` was no longer a stub. `useAdminUsers`,
  `src/client/utils/userForm.js`, and five components under
  `src/components/admin/users/` were added to list accounts from `GET /api/users` and
  edit `role_name` and `is_active` via `PATCH /api/admin/users/:userId`.
- Impact: the panel can refresh the list, open an edit dialog, and
  see loading, empty, error, and success states without duplicating the listing endpoint.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-25 — Admin panel shell

- Change: `RequireAdmin`, `AdminLayout`, `AdminNav`, `AdminPlaceholder`, five stub
  views under `src/client/views/admin/`, and the `Admin` link in `LoanListHeader`
  were added. `main.jsx` mounts `/admin` and its children behind
  `RequireAuth` and `RequireAdmin`.
- Impact: only `admin` accounts can open the panel; non-admins return
  to `/loans`. Later domain phases replace the content of the stub
  views without touching the router. Details are in [`SKILL.md`](SKILL.md) and
  in the `admin` module.
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-23 — Reduced loan editing with payments

- Change: `Edit` is no longer disabled when the loan has payments. `useEditLoanForm`
  distinguishes that case, uses `buildRestrictedLoanPatchPayload`, and sends
  `PATCH /api/loans/:id` with guarantors, collateral, and, only for `admin`,
  `lender_id`. `RestrictedLoanEditForm` was added and the detail and edit
  notices were adjusted.
- Impact: loans with payments still cannot be deleted or have their
  financial terms, customer, disbursement, or installments edited, but they
  can update guarantors and collateral; administrators can also change the
  lender. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-23 — Independent payment reversals

- Change: `usePayments`, `usePaymentRevert`, `paymentHistory.js`, and
  `RevertPaymentDialog` were added. Reversal consumes `GET /api/payments?loan_id=...` and
  `DELETE /api/payments/:id` by `payment_id`, without coupling to payment
  recording or loan editing.
- Impact: `/loans/:id` shows `Revert` on paid installments and `Revert interest` on
  the paid separate obligation. After confirmation, payments are deleted, the
  loan and history are reloaded, a notice is displayed, and `Edit` and `Delete` become
  available again. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-23 — Payment recording from the loan detail

- Change: `useLoanPayment`, payload helpers, and separate modals
  to pay installments and separate interest were added. The amount is locked, `paid_at` is
  optional and converted to zoned ISO. After recording a payment, the
  detail refreshes without reloading the page.
- Impact: `/loans/:id` shows `Pay` actions per pending installment and
  `Pay interest` for the pending separate obligation, with a success notice and
  updated states. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. Not tested in a browser or
  against a server, at the user's request.

### 2026-11-19 — Loan detail, editing, and deletion

- Change: The protected routes `/loans/:id` and `/loans/:id/edit`, the
  shared hook `useLoanFormState`, the helpers `loanEdit.js`, and the
  components in `details/` and `edit/` were added. Creation and editing reuse the
  same form and preview; deletion uses `Dialog`.
- Impact: The listing links each ID to the detail, shows creation and
  deletion notices, and blocks editing or deletion when payments are recorded.
  Editing sends a full `PUT` and returns to the detail with a notice. Details
  are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully (2529 modules transformed).
  Not tested in a browser or against a server; only the build was run,
  at the user's request.

### 2026-11-19 — Loan components grouped by purpose

- Change: Components were moved from `src/components/loans/` to
  `create/` and `list/` according to the flow they serve, and all imports
  were updated. No component or behavior changes.
- Impact: The `CreateLoan` and `Loan` views import from
  `src/components/loans/create/` and `src/components/loans/list/`
  respectively. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully (2483 modules transformed).
  Not tested in a browser or against a server; only the build was run,
  at the user's request.

### 2026-11-19 — Domain components for the loan listing

- Change: `Loans.jsx` was split into components in `src/components/loans/`, loading
  and actions were extracted to `useLoans`, and formatting to
  `src/client/utils/loanFormat.js`, keeping the same listing.
- Impact: The view is now a composition of the header, notices, and table;
  columns, states, messages, and behavior do not change. Details are in
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully (2483 modules transformed).
  Not tested in a browser or against a server; only the build was run,
  at the user's request.

### 2026-11-19 — Domain components for CreateLoan

- Change: `CreateLoan.jsx` was split into components in `src/components/loans/`,
  state was extracted to `useCreateLoanForm` and validation to
  `src/client/utils/loanForm.js`, keeping the same two-step flow.
- Impact: The view is now a composition of the form and the preview; no
  routes, payload, or behavior change. Details are in
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully (2476 modules transformed).
  Not tested in a browser or against a server; only the build was run,
  at the user's request.

### 2026-11-19 — Loan creation with preview

- Change: The `CreateLoan` placeholder was replaced by a form that
  loads stakeholders, supports existing or inline guarantors, requires collateral, and
  calculates installments with `src/client/utils/loanSchedule.js` before sending
  `POST /api/loans`. `Loan` adds the `New loan` button and a successful creation
  notice. The shadcn `select` and `textarea` components were installed.
- Impact: `/create-loan` becomes a functional two-step flow (form
  and review) and returns to `/loans` with `state.createdLoanId` after creation.
  The backend remains the only definitive validator and no new
  endpoints were added. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` was not run and nothing was tested in a browser or against a
  server, at the user's request. That check remains pending.

### 2026-11-19 — Authentication context and protected routes

- Change: The `AuthContext.jsx` wrapper was replaced by `AuthProvider`,
  `useAuth()`, and `RequireAuth`, with hydration from `GET /api/users/auth`.
  The axios service adds a `401` interceptor that clears the token and emits
  `auth:unauthorized`. `/loans` and `/create-loan` are now behind the guard; `Login`
  uses `login(token)` and redirects to the original route; `Loan` displays name and role
  from `useAuth().user` without filtering on the client.
- Impact: Loan routes require a session and the user is available in
  any view. Loan filtering remains the backend's responsibility by JWT. Details
  are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully (220 modules transformed).
  Not tested against a server or in a browser.

### 2026-11-18 — Loan listing

- Change: The `Loan` placeholder was replaced by a table that consumes
  `GET /api/loans` via `api.get("/loans")`. It displays ID, lender,
  customer, amount, rate, mode, disbursement date, and total to pay, with formatted
  amounts and dates and loading, empty, and error states with retry. A `401`
  deletes the token and redirects to `/login`.
- Impact: `/loans` becomes a functional view using the shared axios
  service and the `Table*` components. `CreateLoan` remains a placeholder.
  Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. Not tested against a
  server or in a browser.

### 2026-11-18 — Shared axios service

- Change: `src/lib/axiosService.js` was added, an axios instance with
  `baseURL` from `VITE_API_URL` (or `http://localhost:3000/api`) and an
  interceptor that attaches `Authorization: Bearer <token>` reading `token` from
  `localStorage`. `Login`, `Signup`, and `Test.jsx` now use `api.post`/`api.get`
  with paths relative to `/api`.
- Impact: All requests go through a single client and the token is sent
  centrally; there is no need to repeat the header or the `/api` prefix.
  Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully. The flow was not tested against
  a server or in a browser; `/api/roles` is still disabled in
  `src/server/api.js`.

### 2026-11-18 — Login and signup views

- Change: The `Login` placeholder was replaced by a form connected to
  `POST /api/auth/login` and `Signup` was added, connected to
  `POST /api/auth/signup` via `axios.post`. Both use `Card`, `Input`,
  `Label`, and `Button`,
  validate fields, and show loading and error states. `Login` saves the JWT
  in `localStorage` as `token` and navigates to `/loans`; `Signup` navigates to
  `/login` with a successful registration notice.
- Impact: The client can now authenticate against the API. `Loan` and
  `CreateLoan` remain placeholders and do not yet send the token to
  protected routes. Details are in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully and `git diff --check` did
  not report errors. The flow was not tested against a server or in a browser.

### 2026-11-18 — Brand typography

- Change: Geist was replaced by Montserrat (text) and Playfair Display
  (headings), loaded from Google Fonts with `preconnect` and `display=swap`
  in `index.html`; `@theme inline` defines `--font-sans` and `--font-heading`, and
  `@layer base` applies `font-heading` to `h1`–`h6`. The
  `@fontsource-variable/geist` dependency was removed.
- Impact: Changes the typography of the entire interface; `CardTitle` and `DialogTitle`
  already used the `font-heading` utility. The fonts require a connection to
  Google Fonts at runtime. Details are in
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully, `git diff --check` did
  not report errors, the compiled HTML retains the font links and the compiled
  CSS no longer contains Geist. No visual check in a browser.

### 2026-11-18 — Brand palette

- Change: The color tokens in `src/client/index.css` were replaced by the
  palette `263A69` (primary), `B0C7DD` (secondary), `E8E3DD` (backgrounds and
  cards), `EDECEA` (notifications and popups), and `0F0F0F` (text), converted
  to `oklch`; `.dark` was recolored with the same colors and the
  legacy Vite color states in `index.css` and `App.css` were removed.
- Impact: Changes the appearance of all components using shadcn utilities.
  `--destructive` and the `chart-*`/`sidebar-*` tokens keep their
  previous values. The full mapping is in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully, `git diff --check` did
  not report errors, and the compiled CSS contains the new `oklch` values. No
  visual check in a browser.

### 2026-11-18 — Frontend scaffold

- Change: The React client base was added: a router with four routes, placeholder
  views, six UI components generated with shadcn, Tailwind 4 with
  light/dark theme tokens, the Geist font, the `@` alias, and the
  configuration files `components.json` and `jsconfig.json`.
- Impact: Defines the structure and conventions of the frontend. There is still no
  API integration or client-side authentication; `App.jsx` remains the
  Vite demo and components import `cn` from the package instead of
  `@/lib/utils`. See details in [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` built successfully (46 modules) and
  `git diff --check` did not report errors. Routes and components were not
  tested in the browser.
