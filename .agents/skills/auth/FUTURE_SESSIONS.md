# Session management — future design (not implemented)

This document describes the recommended session model for when authentication is
scaled up. **It is not implemented**: currently there is only a 1-hour JWT access
token (`JWT_EXPIRES_IN`), with no refresh tokens or session state.

## Proposed policy

| What is configured | Initial value | What happens on expiration |
| --- | ---: | --- |
| Access token JWT | 15 min | The API rejects the token; the client requests a new one with the refresh token. |
| Session inactivity | 15 min | The backend closes the session and asks the user to log in again. |
| Maximum session duration | 8 h from login | The user must log in again even if they have been active. Refreshing tokens does not reset this period. |

## Design

- **Access token**: JWT `{ user_id, role_id, session_id }`, signed with
  `JWT_SECRET`, expires in 15 min. Verified by `checkAuth`.
- **Refresh token**: random opaque token (64 hex), stored **hashed** (SHA-256) in
  the `sessions` table. Used only by `POST /api/auth/refresh`.
- **Inactivity**: `sessions.last_activity_at` is updated on every successful
  refresh. If `now - last_activity_at > 15 min`, the refresh fails and the
  session is closed.
- **Maximum duration**: `sessions.expires_at = login + 8 h`. Refresh fails after
  that point and never extends it.
- **Refresh**: since the access token lasts 15 min, the client refreshes within
  that window; that refresh is the activity heartbeat.
- **Transport**: refresh token in an `httpOnly` cookie, `sameSite=lax` (and
  `secure` in production). Requires `cookie-parser`. The access token is returned
  in the JSON.
- **Logout**: `POST /api/auth/logout` revokes the session (`revoked_at`) and
  clears the cookie.

## Proposed table

```sql
sessions(
  session_id CHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  last_activity_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id)
)
```

## Future endpoints

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/refresh` | refresh token |
| `POST` | `/api/auth/logout` | refresh token |

## Proposed environment variables

- `ACCESS_TOKEN_TTL=15m`
- `SESSION_IDLE_TIMEOUT=15m`
- `SESSION_MAX_DURATION=8h`

## Implementation notes

- Requires a `Session` model and the `User.hasMany(Session)` association.
- `checkAuth` can continue validating only the JWT; immediate revocation on
  logout would require querying `sessions` on every request.
- The table does not exist yet; the project does not use migrations, so the DDL
  would have to be created manually.
