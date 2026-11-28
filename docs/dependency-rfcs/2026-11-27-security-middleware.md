# Dependency RFC: Security Middleware

**Status:** Accepted

## Decision

Add the following runtime dependencies:

| Package | Version | Purpose |
| --- | --- | --- |
| `cors` | `^2.8.6` | Enforce an exact, environment-configured browser-origin allowlist. |
| `helmet` | `^8.3.0` | Set standard security headers and the production content-security policy. |
| `express-rate-limit` | `^8.7.5` | Enforce API-wide and login-specific request limits. |

## Why dependencies instead of custom middleware

- CORS has browser-specific preflight and credential semantics. `cors` prevents
  accidental wildcard credentials or incomplete preflight handling.
- Security headers need current, coordinated defaults. `helmet` maintains those
  defaults while allowing this project to configure the required Google Fonts
  sources in production CSP.
- Rate limiting requires correct IP identity, standard rate-limit response
  headers, and edge-case handling. `express-rate-limit` supplies those behavior
  guarantees without a custom in-memory implementation.

## Configuration

- `CORS_ALLOWED_ORIGINS` is a comma-separated allowlist. An absent or unknown
  browser `Origin` never receives CORS permission; same-origin and non-browser
  requests do not need CORS headers.
- `API_RATE_LIMIT_MAX` defaults to `300` requests per 15 minutes.
- `LOGIN_RATE_LIMIT_MAX` defaults to `5` requests per 15 minutes and is applied
  in addition to the API-wide limit.

## CVE audit

`pnpm audit --json` was run after installation. The raw result is preserved in
[`pnpm-audit-2026-11-27.json`](pnpm-audit-2026-11-27.json).

The audit reported two pre-existing moderate transitive advisories:

- `uuid@8.3.2` through `sequelize` (`GHSA-w5hq-g745-h8pq`).
- `minimatch@10.2.6` through `shadcn` and `nodemon`
  (`GHSA-g3hv-75wg-m249`).

No advisory was reported for `cors`, `helmet`, or `express-rate-limit`.
These existing advisories must be reassessed when their parent dependencies can
be upgraded without breaking the project.
