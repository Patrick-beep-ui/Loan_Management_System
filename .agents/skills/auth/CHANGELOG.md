# Changelog — auth

## 2026-11-13 — Login y protección con JWT

- Change: Se agregó `POST /api/auth/login` con validación, búsqueda de usuario
  y `bcrypt.compare`. La generación del token vive en
  `utils/generateToken.js` (payload `{ user_id, role_id }`, expiración de 1 h
  por defecto). Se agregó el middleware `checkAuth` para exigir un Bearer token.
- Impact: `/api/auth/signup` y `/api/auth/login` son públicos. El resto de las
  rutas montadas después de `checkAuth` en `api.js` (hoy `/api/users` y
  `/api/roles`) requiere `Authorization: Bearer <token>`; sin token o con token
  inválido responden `401`. Login responde `200`, `400` por campos faltantes y
  `401` por credenciales inválidas.
- Verification: `GET /api/users` y `GET /api/roles` sin token → `401`; con token
  válido generado por `generateToken` → `200`; token inválido → `401`;
  `POST /api/auth/login` con cuerpo vacío → `400` y con credenciales
  incorrectas → `401`. El login exitoso queda pendiente de credenciales de
  prueba.
- Nota: El diseño de sesiones con refresh tokens quedó documentado en
  `FUTURE_SESSIONS.md`; no está implementado.
