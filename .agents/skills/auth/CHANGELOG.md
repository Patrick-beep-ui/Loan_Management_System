# Changelog — auth

## 2026-11-16 — Validadores por módulo y endurecimiento de signup

- Change: `authValidation.js` se movió a `src/server/utils/validators/` y ahora devuelve los valores normalizados que usa `authService`. Se exige que `email`/`password` sean strings, email con formato básico `local@dominio`, contraseña no vacía y `role_id`/`stakeholder_id` enteros positivos. `signup` traduce `SequelizeForeignKeyConstraintError` a `409 role_id or stakeholder_id does not exist`.
- Impact: Los payloads inválidos que antes llegaban a la base y producían `500` ahora responden `400`; referencias inexistentes a rol/stakeholder responden `409`. El login normaliza el email desde el validador y mantiene `401 Invalid email or password`. También se eliminó el log del JWT en `authController.login`.
- Verification: Pruebas de runtime contra el servidor: signup `{}` → `400`; email numérico/inválido → `400`; password en blanco → `400`; `role_id` no numérico → `400`; rol/stakeholder inexistente → `409`; signup válido con email/IDs normalizados → `201`; email duplicado → `409`; login con password incorrecta → `401`; login válido → `200` y token aceptado en `/api/users`. Datos temporales eliminados.

## 2026-11-16 — Validación de auth movida a utilidades compartidas

- Change: Se extrajeron la validación de payloads de signup/login y la normalización de email de `authService` a `src/server/utils/authValidation.js`, conservando los mismos campos requeridos, normalización (`trim` + minúsculas) y mensajes de error.
- Impact: Sin cambios en el comportamiento de `POST /api/auth/signup` y `POST /api/auth/login`; la lógica de validación ahora reside en una utilidad compartida.
- Verification: `node --check` en `src/server/services/authService.js` y `src/server/utils/authValidation.js` (sin errores). No se ejecutaron pruebas funcionales de endpoints en esta sesión.

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