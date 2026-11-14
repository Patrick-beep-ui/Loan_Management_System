# Session management — diseño futuro (no implementado)

Este documento describe el modelo de sesiones recomendado para cuando se
escale la autenticación. **No está implementado**: hoy solo existe un access
token JWT de 1 hora (`JWT_EXPIRES_IN`), sin refresh tokens ni estado de sesión.

## Política propuesta

| Qué se configura | Valor inicial | Qué pasa al vencer |
| --- | ---: | --- |
| Access token JWT | 15 min | La API rechaza el token; el cliente pide uno nuevo con el refresh token. |
| Inactividad de sesión | 15 min | El backend cierra la sesión y pide iniciar sesión de nuevo. |
| Duración máxima de sesión | 8 h desde el login | El usuario debe volver a iniciar sesión aunque haya estado activo. Renovar tokens no reinicia este plazo. |

## Diseño

- **Access token**: JWT `{ user_id, role_id, session_id }`, firmado con
  `JWT_SECRET`, expira en 15 min. Lo verifica `checkAuth`.
- **Refresh token**: token opaco aleatorio (64 hex), guardado **hasheado**
  (SHA-256) en la tabla `sessions`. Solo lo usa `POST /api/auth/refresh`.
- **Inactividad**: `sessions.last_activity_at` se actualiza en cada refresh
  exitoso. Si `now - last_activity_at > 15 min`, el refresh falla y la sesión
  se cierra.
- **Duración máxima**: `sessions.expires_at = login + 8 h`. El refresh falla
  después de ese instante y nunca lo extiende.
- **Refresh**: como el access token dura 15 min, el cliente refresca dentro de
  esa ventana; ese refresh es el latido de actividad.
- **Transporte**: refresh token en cookie `httpOnly`, `sameSite=lax` (y
  `secure` en producción). Requiere `cookie-parser`. El access token se
  devuelve en el JSON.
- **Logout**: `POST /api/auth/logout` revoca la sesión (`revoked_at`) y borra la
  cookie.

## Tabla propuesta

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

## Endpoints futuros

| Método | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/api/auth/refresh` | refresh token |
| `POST` | `/api/auth/logout` | refresh token |

## Variables de entorno propuestas

- `ACCESS_TOKEN_TTL=15m`
- `SESSION_IDLE_TIMEOUT=15m`
- `SESSION_MAX_DURATION=8h`

## Notas de implementación

- Requiere un modelo `Session` y la asociación `User.hasMany(Session)`.
- `checkAuth` puede seguir validando solo el JWT; la revocación inmediata en
  logout exigiría consultar `sessions` en cada request.
- La tabla no existe todavía; el proyecto no usa migraciones, así que habría
  que crear el DDL manualmente.
