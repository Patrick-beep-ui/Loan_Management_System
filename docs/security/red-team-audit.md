# Security Red-Team Audit

## Scope and status

Audit date: 2026-11-27.

This record distinguishes source-reviewed results from live HTTP checks. The
source-reviewed results below were confirmed against the listed files. The live
procedures are reproducible with two test lender accounts, a test admin account,
and a running application; they have not been run against a shared database in
this workspace. Do not report them as live penetration-test results until their
commands and captured output are added.

Focused module checks completed in this workspace:

- With `CORS_ALLOWED_ORIGINS=https://allowed.example`, the CORS origin callback
  returned `true` for `https://allowed.example` and `false` for
  `https://unapproved.example`.
- With `NODE_ENV=production`, `authCookieOptions()` returned `httpOnly: true`,
  `secure: true`, `sameSite: "strict"`, and `path: "/"`.

Set these values before running the live procedures:

```sh
BASE_URL=http://localhost:3000
ADMIN_COOKIE=admin.cookies
LENDER_A_COOKIE=lender-a.cookies
LENDER_B_LOAN_ID=2
LENDER_B_PAYMENT_ID=1
```

## Known authorization exception

`GET /api/users`, `GET /api/stakeholders`, and `GET /api/stakeholders/:id` are
intentional authenticated global-read exceptions. Any authenticated role can
enumerate these shared account and participant records. This supports loan and
administration workflows, but means the application does not claim complete
BOLA/IDOR protection for user or stakeholder read enumeration. The exception
does not apply to loans, payments, or mutations, and changing it requires
instructor approval.

## IDOR and BOLA writes

### Source-reviewed result

- `loanService.findLoanOrThrow` queries every loan by its ID plus `loanScope`.
  A lender scope is `{ lender_id: req.user.stakeholder_id }`; an inaccessible
  loan is reported as `404 Loan not found`.
- `paymentService.findPaymentOrThrow` resolves the payment's parent loan and
  calls the same lender-scoped loan lookup before updates or deletion.
- Stakeholder `POST`, `PUT`, `PATCH`, and `DELETE` routes apply `requireAdmin`;
  a lender mutation receives `403`.

Source evidence: `src/server/services/loanService.js`,
`src/server/services/paymentService.js`, and
`src/server/routes/stakeholderRoutes.js`.

### Live procedure

With lender A's cookie, attempt to change lender B's loan and payment:

```sh
curl -i -b "$LENDER_A_COOKIE" -X PATCH "$BASE_URL/api/loans/$LENDER_B_LOAN_ID" -H "Content-Type: application/json" --data '{"interest_rate":1}'
curl -i -b "$LENDER_A_COOKIE" -X DELETE "$BASE_URL/api/payments/$LENDER_B_PAYMENT_ID"
curl -i -b "$LENDER_A_COOKIE" -X POST "$BASE_URL/api/stakeholders" -H "Content-Type: application/json" --data '{"first_name":"Test","last_name":"Person"}'
```

Expected result: the foreign loan/payment requests return `404`, without
changing data; the stakeholder write returns `403`. Record the response status,
body, and a database verification before marking this live test complete.

## Injection resistance

### Source-reviewed result

No dynamic SQL or raw Sequelize query usage was found under `src/server`.
Services use Sequelize model APIs and structured `where` objects; IDs are parsed
as positive integers by validators before lookups. The application therefore
does not interpolate request values into SQL strings.

### Live procedure

```sh
curl -i -b "$LENDER_A_COOKIE" "$BASE_URL/api/loans/1%20OR%201=1"
curl -i -b "$ADMIN_COOKIE" -X POST "$BASE_URL/api/stakeholders" -H "Content-Type: application/json" --data '{"first_name":"Test\u0027 OR 1=1 --","last_name":"Audit"}'
```

Expected result: the malformed ID returns `400`; the string is treated as data
or rejected only by field validation, never interpreted as SQL. Verify no
additional records are returned or modified.

## CORS origins

### Source-reviewed result

`security.js` parses only `CORS_ALLOWED_ORIGINS`, permits credentials, and
returns CORS permission only when the request origin exactly matches that
allowlist. Requests without an `Origin` header are treated as same-origin or
non-browser requests. Unknown browser origins receive no CORS permission; this
is not an HTTP authorization control.

### Live procedure

```sh
curl -i -X OPTIONS "$BASE_URL/api/users" -H "Origin: https://allowed.example" -H "Access-Control-Request-Method: GET"
curl -i -X OPTIONS "$BASE_URL/api/users" -H "Origin: https://unapproved.example" -H "Access-Control-Request-Method: GET"
```

Expected result: after setting `CORS_ALLOWED_ORIGINS=https://allowed.example`,
the first response includes `Access-Control-Allow-Origin: https://allowed.example`

## Cookie flags

### Source-reviewed result

Login writes the `access_token` cookie with `HttpOnly`, `SameSite=Strict`, and
`Path=/`. It adds `Secure` only when `NODE_ENV=production`; local HTTP omits
only `Secure` because browsers reject secure cookies over `http://localhost`.

### Live procedure

```sh
curl -i -c "$LENDER_A_COOKIE" -H "Content-Type: application/json" -X POST "$BASE_URL/api/auth/login" --data '{"email":"lender-a@example.test","password":"test-password"}'
```

Expected result: inspect `Set-Cookie` for `HttpOnly`, `SameSite=Strict`, and
`Path=/`; in a production HTTPS run it must also include `Secure`. The response
body must not contain a JWT token.

## Rate limits

### Source-reviewed result

The API limiter allows 300 requests per 15 minutes by default. The login route
has an additional limiter of 5 requests per 15 minutes. Both use draft standard
rate-limit headers, omit legacy headers, and return `429` with
`{"error":"Too many requests. Please try again later."}` once exceeded.

### Live procedure

Use an isolated test IP or wait for the 15-minute window to expire before and

```sh
for i in 1 2 3 4 5 6; do curl -i -H "Content-Type: application/json" -X POST "$BASE_URL/api/auth/login" --data '{"email":"missing@example.test","password":"wrong"}'; done
```

Expected result: the sixth login attempt returns `429` with the configured JSON
message and draft rate-limit headers. Do not lower limits in production merely

## Audit boundary

These procedures are focused checks, not an exhaustive penetration test. Any
future instructor decision to scope user or stakeholder reads must update
`docs/openapi.json`, this audit, and the affected module documentation before
the implementation changes.
