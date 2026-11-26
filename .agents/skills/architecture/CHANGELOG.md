# Changelog — architecture

## 2026-11-25 — Guard de admin en mutaciones de stakeholders

- Change: `stakeholderRoutes.js` pasa `requireAdmin` a `POST`, `PUT`, `PATCH` y
  `DELETE`; los `GET` permanecen con solo `checkAuth`.
- Impact: el middleware se reutiliza fuera de `/api/admin` sin cambiar el
  orden de capas ni los services. Los formularios de préstamos conservan el
  listado de stakeholders.
- Verification: `pnpm build` compiló correctamente; sin pruebas de API en vivo.

## 2026-11-25 — Ruta directa para administración de usuarios

- Change: `AdminRouter` define `PATCH /users/:userId` con un controller, un
  service y un validador dedicados. El service reutiliza `authUser` para la
  proyección y resuelve el rol por nombre. No se creó un subrouter.
- Impact: el router de admin pasa a tener una ruta real sin añadir una capa que
  no aporta valor. El listado no se duplica: sigue en `GET /api/users`.
- Verification: `pnpm build` compiló correctamente; sin pruebas de API en vivo.

## 2026-11-25 — Autenticación con estado en base y router de admin

- Change: `checkAuth` pasó a ser asíncrono: tras verificar el JWT consulta
  `users`/`Role`, reconstruye `req.user` desde la base y rechaza cuentas
  desactivadas. Se agregaron los middlewares `requireAdmin` y
  `requireAdminForLenderChange`; `api.js` monta `AdminRouter` en `/api/admin`,
  que centraliza `requireAdmin` y todavía no define endpoints.
- Impact: las capas y el manejo de errores tipados no cambian. Los services
  reciben `req.user` con el rol vigente en la base, no solo el claim del token.
  Las rutas `/api/admin/*` quedan detrás de `requireAdmin`.
- Verification: `pnpm build` y revisión del diff; sin pruebas de API en vivo.

## 2026-11-18 — Router de pagos

- Change: Se montó `PaymentRouter` en `/api/payments` después de `checkAuth` en
  `src/server/api.js`. Se agregó `paymentValidation.js` a la capa de validación y
  `paymentService` reutiliza `loanScope` de `loanService` para el filtro por
  prestamista.
- Impact: Nuevas rutas protegidas de lectura y registro de pagos. El patrón de
  capas y el manejo de errores tipados no cambian.
- Verification: `node --check` en los archivos nuevos y modificados; pruebas de
  servicio con pagos de cuota e interés, scoping lender/admin y conflictos `409`.
  Datos temporales eliminados.

## 2026-11-17 — Identidad del usuario y errores 403

- Change: `generateToken` incluye `role_name` y `stakeholder_id`, `checkAuth`
  los expone en `req.user`, y los controllers de préstamos pasan `req.user` a
  sus services. Se agregó `ForbiddenError` a `utils/errors.js` con código 403.
- Impact: los services pueden aplicar reglas de permisos y propiedad sin
  conocer HTTP; los tokens anteriores al cambio carecen de esas claim y expiran
  en 1 hora. `admin` mantiene acceso global a préstamos.
- Verification: `node --check` en los archivos modificados; signup/login
  devolvieron `role_name` y el JWT incluyó `stakeholder_id`; las rutas de
  préstamos respetaron el scoping por prestamista.

## 2026-11-16 — Validadores centralizados por módulo

- Change: Los validadores de auth, stakeholders y loans se movieron a `src/server/utils/validators/`, con helpers compartidos en `common.js`. Los services importan el validador de su dominio y los controllers siguen sin validar.
- Impact: La estructura de `utils/` queda `errors.js`, `generateToken.js` y `validators/`. No cambia el contrato HTTP más allá de las reglas específicas documentadas en cada módulo.
- Verification: `node --check` en todo `src/server` y pruebas de runtime de auth, stakeholders y loans con token; conteos de base restaurados.

## 2026-11-16 — Router de préstamos

- Change: Se montó `LoanRouter` en `/api/loans` después de `checkAuth` en `src/server/api.js`, siguiendo el patrón por capas (`routes → controllers → services → models`).
- Impact: Nuevas rutas protegidas bajo `/api/loans` (CRUD de préstamos). Requieren `Authorization: Bearer <token>`.
- Verification: `node --check` en `src/server/api.js`, `src/server/routes/loanRoutes.js`, `src/server/controllers/loanController.js`, `src/server/services/loanService.js` y `src/server/utils/loanValidation.js` (sin errores). No se ejecutaron pruebas funcionales de endpoints en esta sesión.

## 2026-11-13 — Router de stakeholders

- Change: Se montó `StakeholderRouter` en `/api/stakeholders`, después de
  `checkAuth`. Se agregó `NotFoundError` (`404`) a los errores tipados.
- Impact: Las rutas de stakeholders requieren Bearer token; los recursos
  inexistentes responden `404`.
- Verification: `node --check` en los archivos nuevos y modificados; CRUD
  completo probado en runtime con token.

## 2026-11-13 — Middleware de autenticación y rutas protegidas

- Change: Se documentó `middlewares/checkAuth.js` y
  `utils/generateToken.js`, y el nuevo orden de `api.js`: `/auth` público
  primero, luego `checkAuth`, después `/users` y `/roles`.
- Impact: Todo router registrado después de `checkAuth` requiere
  `Authorization: Bearer <token>`; sin token o con token inválido responde
  `401`. Se agregó `UnauthorizedError` a los errores tipados.
- Verification: `GET /api/users` y `GET /api/roles` sin token → `401`; con
  token válido → `200`; token inválido → `401`.

## 2026-11-13 — Arquitectura por capas y ruteo global

- Change: Se reorganizó la API en Models, Services, Controllers y Routes. Se
  agregó `utils/errors.js` con errores tipados y se movió todo el ruteo a
  `api.js`, que ahora solo monta los routers de los módulos.
- Impact: Las rutas inline de `api.js` se eliminaron. Cada endpoint pasa por
  un controller y un service; los services no dependen de `req`/`res`.
- Verification: `node --check` en todos los archivos; servidor iniciado y
  `GET /api/roles`, `GET /api/users` y `POST /api/auth/signup` con cuerpo
  vacío respondieron 200, 200 y 400 respectivamente.