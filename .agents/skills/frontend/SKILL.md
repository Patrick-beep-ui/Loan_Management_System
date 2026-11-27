---
name: frontend
description: React frontend with Vite: entry point, routes, UI components, styles, and path aliases.
---

# Frontend

The interface lives in `src/client/` and uses React 19 with Vite 6. Shared
primitives are in `src/components/ui/`, domain components in
`src/components/<domain>/`, client hooks in `src/client/hooks/`, and
utilities in `src/lib/` and `src/client/utils/`.
The change history for this module is in [`CHANGELOG.md`](CHANGELOG.md).

## Entry point and routes

`src/client/main.jsx` creates the router with `createBrowserRouter` and mounts
`RouterProvider` inside `React.StrictMode`. A route without `path` mounts
`AuthProvider` as the root layout; inside it, `RequireAuth` protects
`/change-password`, `/loans`, `/create-loan`, `/loans/:id`, and
`/loans/:id/edit`, while `RequireAdmin` protects `/admin` and its children.
The remaining routes are public:

| Route | View | File | Access |
| --- | --- | --- | --- |
| `/` | `App` (initial Vite demo) | `src/client/App.jsx` | public |
| `/login` | `Login` | `src/client/views/Login.jsx` | public |
| `/change-password` | `ChangePassword` | `src/client/views/ChangePassword.jsx` | protected, forced |
| `/loans` | `Loan` | `src/client/views/Loans.jsx` | protected |
| `/create-loan` | `CreateLoan` | `src/client/views/CreateLoan.jsx` | protected |
| `/loans/:id` | `LoanDetails` | `src/client/views/LoanDetails.jsx` | protected |
| `/loans/:id/edit` | `EditLoan` | `src/client/views/EditLoan.jsx` | protected |
| `/admin` | redirect | `src/client/main.jsx` | admin |
| `/admin/dashboard` | `AdminDashboard` | `src/client/views/admin/AdminDashboard.jsx` | admin |
| `/admin/users` | `AdminUsers` | `src/client/views/admin/AdminUsers.jsx` | admin |
| `/admin/stakeholders` | `AdminStakeholders` | `src/client/views/admin/AdminStakeholders.jsx` | admin |
| `/admin/stakeholders/:id` | `AdminStakeholderProfile` | `src/client/views/admin/AdminStakeholderProfile.jsx` | admin |
| `/admin/loans` | `AdminLoans` | `src/client/views/admin/AdminLoans.jsx` | admin |
| `/admin/payments` | `AdminPayments` | `src/client/views/admin/AdminPayments.jsx` | admin |
| `/test` | `Test` (test view) | `src/client/Test.jsx` | public |

`Login` consumes `/api/auth/login` through the shared service
`src/lib/axiosService.js` (`api.post`): it validates the fields, disables the button
while submitting, and shows `error.response?.data?.error` or a network message in
a `role="alert"` region with `destructive` tokens. `Login` uses
`useAuth().login(token)` to save the JWT in `localStorage`, load the
user with `/users/auth`, and navigate to the original route (`state.from`) or
`/loans`. Public signup was removed. `ChangePassword` uses
`useChangePassword` to validate current/new/confirm fields, sends
`PATCH /users/me/password`, calls `refreshUser()`, and navigates to
`state.from` or `/loans` after success.
`Loan` consumes `/api/loans` with `api.get("/loans")` and displays a table
listing with ID, lender, customer, amount, rate, mode, disbursement date, and
total to pay; it uses `useAuth().user` only to display the name and role, because the
backend already filters loans according to the JWT. It includes loading, empty,
and error states with retry, a `New loan` button that navigates to `/create-loan`, and a
`role="status"` notice when returning with `state.createdLoanId`; a global
`401` clears the session and `RequireAuth` returns to `/login`. `CreateLoan` is a functional
form: it loads `GET /api/stakeholders`, allows selecting or creating guarantors,
generates an installment preview, and sends `POST /api/loans` after approval;
it does not record payments; that action occurs from `LoanDetails`. `LoanDetails` consumes `GET /api/loans/:id` and displays
the summary, schedule, guarantors, collateral, and interest status; from
there you navigate to `/loans/:id/edit` and delete the loan with `Dialog` only if
there are no recorded payments. `EditLoan` retrieves the same loan: without payments
it fills the shared form and sends `PUT /api/loans/:id` with all the
arrays; with payments it shows a reduced form and sends `PATCH /api/loans/:id`
only with guarantors, collateral, and, for `admin`, `lender_id`.
`App.jsx` remains the example Vite counter.
The `/test` route uses `api.get("/roles")`; that server route is
currently disabled in `src/server/api.js`, so it is not part of the
authentication flow.

## Configuration and dependencies

- `vite.config.js`: registers the `react()` and `tailwindcss()` plugins and defines the
  alias `@` → `./src` with `fileURLToPath(new URL("./src", import.meta.url))`.
- `jsconfig.json`: `baseUrl` `.` and the path `@/*` → `./src/*` so editors and
  tools resolve the same alias.
- `components.json`: shadcn configuration with `base-nova` style, `tsx: false`,
  `rsc: false`, CSS in `src/client/index.css`, `lucide` icons, and the aliases
  `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, and `@/hooks`.
- UI dependencies: `@base-ui/react` (primitives), `class-variance-authority`
  (variants), `cn` (class concatenation), `lucide-react` (icons),
  `tailwindcss`, `@tailwindcss/vite`, and `tw-animate-css`. `react-router-dom`
  provides routing. The CLI installation also added `shadcn` and
  `install` as dependencies; the current code does not use them.
- `axios` is used only through `src/lib/axiosService.js`; `Login`,
  `ChangePassword`, `Test.jsx`, and the hooks `useChangePassword`, `useLoans`, `useLoanFormState`,
  `useCreateLoanForm`, `useLoanDetails`, `useEditLoanForm`, `useLoanPayment`,
  `usePayments`, `usePaymentRevert`, `useAdminUsers`, `useAdminStakeholders`,
  `useAdminStakeholderProfile`, `useAdminLoans`, `useAdminPayments`, and
  `useAdminDashboard` import that instance instead of creating their own
  clients.

## UI components

`src/components/ui/` contains the components generated with shadcn:

| File | Exported components | Primitive |
| --- | --- | --- |
| `button.jsx` | `Button`, `buttonVariants` | `Button` from `@base-ui/react/button` |
| `card.jsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | `div` elements |
| `dialog.jsx` | `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | `Dialog` from `@base-ui/react/dialog` |
| `input.jsx` | `Input` | `Input` from `@base-ui/react/input` |
| `label.jsx` | `Label` | `label` element |
| `select.jsx` | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` | `Select` from `@base-ui/react/select` |
| `table.jsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | HTML table tags |
| `textarea.jsx` | `Textarea` | `textarea` element |

Styled components combine `className` via `cn`. Today they import
`cn` directly from the `cn` package; `src/lib/utils.js` also re-exports it and is
the alias declared in `components.json`, but the components do not use it yet.
Keep this in mind when adding new components.

### Domain components

`src/components/admin/` brings together the admin panel UI:

| File | Responsibility |
| --- | --- |
| `AdminNav.jsx` | navigation with `NavLink`; the active one uses `variant="default"` and the others `"outline"` |
| `AdminPlaceholder.jsx` | reusable placeholder card; no longer used by the panel |
| `users/AdminUsersHeader.jsx` | title, description, `Refresh` and `New user` actions |
| `users/AdminUsersAlerts.jsx` | error and success notices for the user flow |
| `users/AdminUsersTable.jsx` | table with loading and empty states |
| `users/AdminUserRow.jsx` | row with role, status, `Password pending` badge, edit and reset actions |
| `users/AdminUserEditDialog.jsx` | single dialog with role, status, and linked stakeholder data |
| `users/AdminUserCreateDialog.jsx` | email, role and stakeholder selection; shows the one-time temporary password |
| `users/AdminUserResetPasswordDialog.jsx` | reset confirmation; shows the one-time temporary password |
| `stakeholders/AdminStakeholdersHeader.jsx` | title, description, and `Refresh` and `New stakeholder` actions |
| `stakeholders/AdminStakeholdersAlerts.jsx` | error and success notices for the stakeholder flow |
| `stakeholders/AdminStakeholdersTable.jsx` | table with loading and empty states |
| `stakeholders/AdminStakeholdersFilter.jsx` | All / Admins / Lenders / Customers tabs with counts |
| `stakeholders/AdminStakeholderRow.jsx` | row with a name that links to the profile and unchanged `Edit` and `Delete` actions |
| `stakeholders/StakeholderFormFields.jsx` | reusable person fields with per-field validation |
| `stakeholders/AdminStakeholderFormDialog.jsx` | creation and edit form that reuses `StakeholderFormFields` |
| `stakeholders/DeleteStakeholderDialog.jsx` | deletion confirmation with `Dialog` |
| `stakeholders/AdminStakeholderProfileHeader.jsx` | profile title, stakeholder ID, and back action |
| `stakeholders/AdminStakeholderPersonalInfo.jsx` | personal fields and linked access account summary |
| `stakeholders/AdminStakeholderLoanRoles.jsx` | associated-loan count and lender/customer/guarantor counts |
| `stakeholders/AdminStakeholderLoansTable.jsx` | associated loans with role badges and detail links |
| `loans/AdminLoansHeader.jsx` | title, description, and refresh button |
| `loans/AdminLoansAlerts.jsx` | error and success notices for the loan flow |
| `loans/AdminLoansTable.jsx` | table with loading and empty states |
| `loans/AdminLoanRow.jsx` | row with formatted amounts and `Reassign lender` action |
| `loans/ReassignLenderDialog.jsx` | lender selection and submission of `PATCH /api/loans/:id` |
| `payments/AdminPaymentsHeader.jsx` | title, description, and `Refresh` and `Record payment` actions |
| `payments/AdminPaymentsAlerts.jsx` | error and success notices for the payment flow |
| `payments/AdminPaymentsTable.jsx` | table with loading and empty states |
| `payments/AdminPaymentRow.jsx` | row with payment, loan, destination, and `Revert` action |
| `payments/AdminPaymentRecordDialog.jsx` | selection of a pending installment or interest and payment submission |
| `dashboard/AdminDashboardHeader.jsx` | title, description, and refresh button |
| `dashboard/AdminDashboardAlerts.jsx` | panel error notice |
| `dashboard/AdminDashboardCards.jsx` | cards of amounts, payments, and overdue installments |
| `dashboard/AdminDashboardOverdue.jsx` | sorted overdue-installment table with highlighted-detail links |
| `dashboard/AdminDashboardStakeholders.jsx` | compact stakeholder list with profile links and a manage action |
| `dashboard/AdminDashboardStatus.jsx` | status of installments, interest, and portfolio |
| `dashboard/AdminDashboardPaymentTrend.jsx` | payments grouped by month |
| `dashboard/AdminDashboardRecentPayments.jsx` | table of the most recent payments |

`src/components/loans/` gathers the loan-specific UI, separated by
purpose into `create/`, `list/`, `details/`, and `edit/`. The views import from
the corresponding folder with the `@/` alias.

#### `src/components/loans/create/`

| File | Responsibility |
| --- | --- |
| `CreateLoanForm.jsx` | complete form: data, guarantors, collateral, and preview submission |
| `LoanDetailsFields.jsx` | lender, customer, amount, rate, mode, disbursement, and installment fields |
| `GuarantorsFieldArray.jsx` | creation, deletion, and listing of guarantors |
| `GuarantorRow.jsx` | an existing or inline guarantor |
| `CollateralsFieldArray.jsx` | creation, deletion, and listing of collateral |
| `CollateralRow.jsx` | a collateral with description and estimated value |
| `InstallmentPreview.jsx` | summary, installment table, and approval actions |
| `FormField.jsx` | label and control wrapper, used by the form |
| `ErrorAlert.jsx` | error message with `role="alert"`, used by the form and the preview |

#### `src/components/loans/list/`

| File | Responsibility |
| --- | --- |
| `LoanListHeader.jsx` | title, description based on the user, and `New loan` button |
| `LoanCreatedAlert.jsx` | dismissible `role="status"` notice after creation |
| `LoanDeletedAlert.jsx` | dismissible `role="status"` notice after deletion |
| `LoanLoadErrorAlert.jsx` | load error with `Retry` action |
| `LoanTable.jsx` | listing table with loading and empty states |
| `LoanTableRow.jsx` | a row with formatted amounts, rate, mode, and date; the ID links to the detail |

#### `src/components/loans/details/`

| File | Responsibility |
| --- | --- |
| `LoanDetailsHeader.jsx` | title, `Back to loans`, `Edit`, and `Delete` actions |
| `LoanSummary.jsx` | summary of lender, customer, amounts, and terms |
| `LoanInstallmentsTable.jsx` | schedule sorted by installment number, with `Overdue` badges, optional focused-row highlight and scroll, and `Pay`/`Revert` actions |
| `LoanGuarantorsList.jsx` | guarantors and their stakeholder IDs |
| `LoanCollateralsList.jsx` | collateral with estimated value |
| `LoanInterestStatus.jsx` | ordinary interest status and its `Pay interest` and `Revert interest` actions |
| `LoanLockedAlert.jsx` | notice explaining which fields are locked when payments exist and that deletion requires reverting them |
| `LoanUpdatedAlert.jsx` | dismissible notice after returning from editing |
| `LoanDetailsError.jsx` | load error, `404`, and retry |
| `DeleteLoanDialog.jsx` | deletion confirmation with `Dialog` |

#### `src/components/loans/edit/`

| File | Responsibility |
| --- | --- |
| `EditLoanHeader.jsx` | edit title and action to return to the detail |
| `EditLoanError.jsx` | load error, `404`, and retry |
| `EditLockedAlert.jsx` | notice explaining the reduced edit when payments exist |
| `RestrictedLoanEditForm.jsx` | edit form with payments: guarantors, collateral, and lender selection only for `admin` |

### Payments and reversals

`src/components/payments/` gathers the UI for recording and reversing
payments, separate from the loan flows:

| File | Responsibility |
| --- | --- |
| `InstallmentPaymentModal.jsx` | confirms the payment of an installment against `/payments/installment` |
| `InterestPaymentModal.jsx` | confirms the payment of separate interest against `/payments/interest` |
| `PaymentModalFields.jsx` | shared locked amount and optional `paid_at` |
| `PaymentSuccessAlert.jsx` | dismissible `role="status"` notice after recording or reversing a payment |
| `RevertPaymentDialog.jsx` | reversal confirmation with `Dialog` and a destructive button |

## Styles

`src/client/index.css` imports `tailwindcss`, `tw-animate-css`, and
`shadcn/tailwind.css`; declares `@custom-variant dark`, the brand palette color
variables, and an `@theme inline` block that exposes them as utilities
(`--color-*`, `--font-heading`, `--font-sans`, `--radius-*`). The `@layer base`
block applies `border-border`, `outline-ring/50`, `bg-background`,
`text-foreground`, and `font-sans` to base elements, and `font-heading` to
the semantic headings `h1` through `h6`.

### Brand palette

The five colors are defined in `oklch` format inside `:root` and `.dark`:

| Hex | Usage | Main tokens |
| --- | --- | --- |
| `263A69` | Main application color | `--primary`, `--ring` |
| `B0C7DD` | Secondary actions related to the primary | `--secondary`, `--accent`, `--border`, `--input` |
| `E8E3DD` | Backgrounds, subtle objects, and cards | `--background`, `--card` |
| `EDECEA` | Notifications, popups, and messages | `--popover`, `--muted`, `--primary-foreground` in light theme |
| `0F0F0F` | Text | `--foreground`, `--card-foreground`, `--secondary-foreground` |

In the light theme, text on dark blue uses `EDECEA`; in `.dark` the
background is `0F0F0F`, cards and popups use `263A69`, and accents become
`B0C7DD`. `--destructive` keeps shadcn's red and the `chart-*` and
`sidebar-*` tokens keep their defaults. Legacy Vite styles
(fixed colors in `a`, `button`, and `App.css`) were removed or replaced by
palette variables.

### Typography

Fonts are loaded from Google Fonts via the `preconnect` and
`stylesheet` links in `index.html`: Montserrat (variable range `100..900`) for
text and Playfair Display (`400..900`) for headings, both with
`display=swap`. In `index.css`, `@theme inline` defines `--font-sans` as
Montserrat and `--font-heading` as Playfair Display. The `font-heading` utility
is used in `CardTitle` and `DialogTitle`, and `@layer base` also applies it to
`h1`–`h6`. No local font is installed: the
`@fontsource-variable/geist` package was removed from the project.

## HTTP service

`src/lib/axiosService.js` exports an axios instance with
`baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"`.
A request interceptor reads the JWT from `localStorage` under the key `token`
and, if present, adds `Authorization: Bearer <token>` to all requests.
That is why views call methods with paths relative to `/api`
(`api.post("/auth/login")`, `api.get("/roles")`, `api.get("/users")`,
`api.get("/stakeholders")`, `api.get("/stakeholders/:id")`,
`api.post("/stakeholders")`, `api.put("/stakeholders/:id")`,
`api.delete("/stakeholders/:id")`, `api.post("/admin/users")`,
`api.post("/admin/users/:userId/reset-password")`,
`api.patch("/admin/users/:userId")`, `api.patch("/users/me/password")`,
`api.post("/loans")`,
`api.put("/loans/:id")`, `api.patch("/loans/:id")`,
`api.post("/payments/installment")`, `api.post("/payments/interest")`,
`api.get("/payments")`, `api.delete("/payments/:id")`) and do not need to build the header or repeat the
`/api` prefix. The response interceptor removes
`token` and emits `auth:unauthorized` on a `401`, except on `/auth/login` and
`/users/me/password` so credential errors are not hidden. `AuthProvider` listens
for that event and clears the user.

## Client authentication

`src/client/contexts/AuthContext.jsx` exports `AuthProvider`, `useAuth()`,
`RequireAuth`, and `RequireAdmin`:

- `AuthProvider` is the root layout: on mount it hydrates the user with
  `api.get("/users/auth")` if there is a `token`, exposes `{ user, isAuthenticated,
  loading, login, logout, refreshUser }`, and renders `<Outlet />`.
- `useAuth()` lets you read the user and session actions from any
  view; it fails if used outside the provider.
- `RequireAuth` shows "Checking session..." while hydrating and redirects to
  `/login` with `state.from` if there is no session. If
  `user.must_change_password` is true it redirects to `/change-password`
  (unless already there), passing the original path in `state.from`; otherwise
  it renders `<Outlet />`.
- `RequireAdmin` uses the same hydration state, redirects to `/login` without
  a session and to `/loans` if `user.Role.role_name` is not `admin`; if it is,
  it renders `<Outlet />`.
- `login(token)` saves the JWT, loads `/users/auth`, and updates the state;
  `refreshUser()` reloads `/users/auth` and returns the updated user;
  `logout()` clears the token and the user. All are available via `useAuth()`.
- The exposed user retains the Sequelize `Stakeholder` and `Role` keys
  (`user.Stakeholder.first_name`, `user.Role.role_name`, etc.). `CreateLoan`
  takes `lender_id` from `user.stakeholder_id` for `lender` accounts; `admin` selects
  it in the form.
- Requests to `/auth/login` and `/users/me/password` use `api.post`/`api.patch`
  from the shared service; the final URL resolves with the configured `baseURL`. The JWT is
  saved in `localStorage` with the key `token` and the interceptor attaches it as
  `Authorization: Bearer <token>` to all requests, even public ones
  when a session already exists. That is the mechanism required by `checkAuth`.
- Errors are read from `error.response?.data?.error`; if there is no response,
  a generic message is displayed. Both cases use a `role="alert"` region with
  `text-destructive` and `bg-destructive/10`.
- `Login` and `ChangePassword` share the same composition: `Card`, `CardHeader`,
  `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Label`, `Input`,
  and `Button`, with no fixed colors.

## Admin panel

`src/client/layouts/AdminLayout.jsx` is the shell for `/admin`: title, `AdminNav`,
and `Outlet`. The views in `src/client/views/admin/` are replaced by each
domain phase without touching the router; `/admin/users` lists accounts with
`useAdminUsers` from `GET /api/users` and `GET /api/stakeholders`, marking
accounts with `must_change_password` as `Password pending`. The edit dialog
combines role, status, and linked stakeholder data. Those data are loaded with
`GET /api/stakeholders/:id` and saved with `PATCH /api/admin/users/:userId`
plus `PUT /api/stakeholders/:id`; if there is no linked person, only
role and status are shown. The `New user` dialog creates an `admin` or `lender`
account for a stakeholder not yet linked to one through `POST /api/admin/users`
and shows the one-time `temporary_password`. Each row can reset a password with
`POST /api/admin/users/:userId/reset-password`, also showing the password once.
`/admin/stakeholders` uses `useAdminStakeholders` over
the existing CRUD of `/api/stakeholders`: listing with `GET`, creation with `POST`,
editing with `PUT`, and deletion with `DELETE`, with local validation and
confirmation before deleting. It lists everyone, including people linked to
accounts, and `GET /api/users` supplies the role used by the `All`, `Admins`,
`Lenders`, and `Customers` filters. A person with no linked account is a
customer; an admin/lender who is also a loan customer stays in their account
category and keeps that participation in the profile. Each name opens
`/admin/stakeholders/:id`, where
`useAdminStakeholderProfile` combines `GET /api/stakeholders/:id`,
`GET /api/loans` and `GET /api/users`; `stakeholderProfile.js` derives
lender/customer/guarantor roles from loan relations, including multiple roles
on one loan. The table's `Edit` and `Delete` actions are unchanged.
`/admin/loans` uses
`useAdminLoans` over `GET /api/loans` and `GET /api/users`; the
`Reassign lender` dialog takes its options from accounts with `Role.role_name =
"lender"`, excludes the loan's customer, sends `PATCH /api/loans/:id` with
`lender_id`, and reloads the listing after saving. Inactive accounts with the
`lender` role still appear. `/admin/payments` uses `useAdminPayments` over
`GET /api/payments` for the `admin` history and `GET /api/loans` to choose
pending destinations; `Record payment` posts to the installment or interest
endpoints with an amount calculated by the destination, and reversal reuses
`usePaymentRevert` with `RevertPaymentDialog`. `PATCH /api/payments/:id` is not
exposed in the panel. `/admin/dashboard` uses `useAdminDashboard` and
`src/client/utils/adminDashboard.js` to aggregate `GET /api/loans`,
`GET /api/payments` and `GET /api/stakeholders` on the client: cards of amounts,
a list of overdue installments, a compact stakeholder card with profile links,
portfolio status, monthly trend, and recent payments, with no dedicated
endpoint. `src/client/utils/loanStatus.js` defines the shared date-overdue rule
for the card, list and detail badge, while `stakeholderProfile.js` supplies the
stakeholder summaries and role labels. Each overdue row links to `/loans/:id`
with `state: { focusInstallmentId }` and separate interest is excluded because
it has no due date.
`LoanListHeader` shows the `Admin` link only when
`user.Role.role_name === "admin"`. The full contract, including
the order of later phases, lives in the `admin`
module.

## Loan listing

The `src/client/views/Loans.jsx` view assembles the `Card` and composes
`LoanListHeader`, `LoanCreatedAlert`, `LoanDeletedAlert`, `LoanLoadErrorAlert`, and
`LoanTable`. The `useLoans` hook consumes `api.get("/loans")` with the shared service
and maintains loading, empty, and error states, plus the retry, notice-dismissal, and
navigation to `/create-loan` actions. It uses `useAuth().user` only to build the
description with name and role, because the backend filters loans according to
the JWT. `LoanTable` displays ID, lender, customer, amount, rate, mode,
disbursement date, and total to pay; the formats live in
`src/client/utils/loanFormat.js`: amounts with two decimals and a thousands
separator, rate with up to four decimals and `%`, `YYYY-MM-DD` date, and `—` for
missing values. When creation finishes, the view returns with
`state.createdLoanId` and `LoanCreatedAlert` displays a dismissible `role="status"`
notice. After a deletion, the view returns with `state.deletedLoanId` and
`LoanDeletedAlert` displays the corresponding notice; each row's ID links
to `/loans/:id`. On a `401`, the global interceptor clears `token` and
`RequireAuth` redirects to `/login`.

## Loan creation

The `src/client/views/CreateLoan.jsx` view only assembles the header and toggles
between `CreateLoanForm` and `InstallmentPreview`. The `useLoanFormState` hook
maintains state, loads `GET /api/stakeholders` with `api.get("/stakeholders")`,
and validates with `buildLoanPayload` from `src/client/utils/loanForm.js`;
`normalizeGuarantors` and `normalizeCollaterals` are helpers exported from the same
file and are reused in editing with payments. `useCreateLoanForm` only sends
`POST /api/loans`. The form lets you choose a customer, lender (only
`admin`), and existing guarantors; it also allows creating inline guarantors with
`first_name`, `last_name`, `national_id`, `marital_status`, `occupation`, and
`date_of_birth`. It requires at least one guarantor and one collateral with a
`description` and optional `estimated_value`.
`lender_id` is derived from `useAuth().user.stakeholder_id` for `lender` accounts.

The `Preview installments` button validates the data with `buildLoanPayload` and uses
`src/client/utils/loanSchedule.js` to generate the schedule before sending
anything. The helper works in cents: it computes
`interest = round(loan_amount * interest_rate / 100)`, splits the total into
equal installments with the remainder in the last one, and produces monthly dates from
the first due date, adjusting to the last day of the month. The sum of the
installments is principal + interest in `included` mode and principal only in `separate`;
in that mode interest is displayed as a separate obligation. Due dates are
`YYYY-MM-DD` and the first due date cannot be earlier than the disbursement.

The review stage displays a summary and a `Table` with the number, due date, and
amount of each installment. `Back to edit` preserves the data; `Approve & create`
sends `api.post("/loans", payload)` with all normalized fields and arrays
and, after `201`, returns to `/loans` with `state.createdLoanId`. Validation and
API errors are shown in a `role="alert"` region with
`destructive` tokens.

## Loan detail and editing

The `src/client/views/LoanDetails.jsx` view composes the components in
`src/components/loans/details/` around the `useLoanDetails` hook, which consumes
`api.get("/loans/:id")` and maintains loading, error, `404`, update-notice, and
deletion-confirmation states. It displays the loan data, the
installments, guarantors, collateral, and the interest obligation.
`loanHasPayments` from `src/client/utils/loanEdit.js` detects paid installments or
paid interest: `Delete` becomes disabled and `Edit` opens the reduced form. The backend
remains the authority and responds `409` to direct attempts.
`DeleteLoanDialog` uses `Dialog` and, after
`api.delete("/loans/:id")`, returns to `/loans` with `state.deletedLoanId`.
`useLoanDetails` also reads `state.focusInstallmentId`: `LoanInstallmentsTable`
uses it to highlight and scroll to the requested installment and marks any
date-overdue installment with an `Overdue` badge.

Payment recording opens from the `Pay` actions on each pending installment and
`Pay interest` on the pending separate obligation. `useLoanPayment` manages
the destination, the optional date, and submission; `src/components/payments/` contains
`InstallmentPaymentModal`, `InterestPaymentModal`, `PaymentModalFields`, and
`PaymentSuccessAlert`. The amount appears locked with the exact value required
by the backend. If `paid_at` is left empty it is omitted from the payload and the
server uses the current time; if filled, `buildPaymentPayload` converts it to zoned ISO
before sending. After `201` the modal closes, `refreshLoan()` is called, and a
`role="status"` notice is displayed; that is why the detail
distinguishes initial `loading` from subsequent `refreshing`.

Reversal is independent of payment recording: `usePayments` loads
`/api/payments?loan_id=...`, `paymentHistory.js` associates each payment with its
installment or interest, and `usePaymentRevert` sends `DELETE /api/payments/:id` using only the
`payment_id`. `RevertPaymentDialog` asks for confirmation; after `204` the
loan and history are reloaded, a notice is displayed, `Delete` becomes
available again, and `Edit` switches to the full form.

Editing lives in `src/client/views/EditLoan.jsx`. The `useEditLoanForm` hook
loads the loan, converts the response to form state with
`loanToFormState`, and reuses `useLoanFormState`, so it shares
validation, stakeholder loading, and preview generation with creation.
Without payments, the view reuses `CreateLoanForm` and `InstallmentPreview` with
optional labels (`Preview changes`, `Save changes`, `Saving...`) and
`handleApprove` sends `api.put("/loans/:id", payload)` with all the arrays;
the backend recreates installments, guarantors, and collateral and no child
relation IDs are sent. With payments, `EditLockedAlert` explains the restrictions and
`RestrictedLoanEditForm` shows only guarantors, collateral, and, for `admin`, the
lender. `buildRestrictedLoanPatchPayload` reuses `normalizeGuarantors` and
`normalizeCollaterals` from `loanForm.js`, validates that lender and customer differ
when applicable, and omits `lender_id` for `lender` accounts. `handleApprove`
sends `api.patch("/loans/:id", payload)` and returns to the detail with
`state.updatedLoanId`.

## Conventions

- New views go in `src/client/views/` and are registered in
  `src/client/main.jsx`.
- Panel views go in `src/client/views/admin/` and the shell in
  `src/client/layouts/`.
- Reusable primitives go in `src/components/ui/` and domain-composed components
  in `src/components/<domain>/`, grouped by purpose when there is more than one
  flow (for example, `loans/create/` and `loans/list/`).
- View hooks go in `src/client/hooks/` (for example `useChangePassword` and
  `useAdminUsers`); use the `@/` alias to import from `src/`.
- Session state lives in `src/client/contexts/`; consume it with
  `useAuth()` from any view.
- Pure domain helpers go in `src/client/utils/`, such as
  `loanSchedule.js`, `loanForm.js`, `loanFormat.js`, `loanStatus.js`,
  `loanEdit.js`, `loanPayment.js`, `paymentHistory.js`, `userForm.js`,
  `stakeholderForm.js`, `stakeholderCategory.js`, `adminDashboard.js`, and
  `stakeholderProfile.js`.
- Color tokens are defined in `index.css`; avoid fixed colors in
  UI components.
- Every frontend behavior change is documented here and in
  `CHANGELOG.md`, following the `documentation` skill; if it affects the panel,
  the `admin` module is also updated.
