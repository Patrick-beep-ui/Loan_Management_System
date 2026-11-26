# Changelog — stakeholders

## 2026-11-25 — Ocultar personas vinculadas a cuentas en el panel

- Change: `useAdminStakeholders` combina `GET /api/stakeholders` con
  `GET /api/users` y excluye de la tabla del panel las personas cuyo
  `stakeholder_id` pertenece a cualquier cuenta, activa o inactiva.
- Impact: el CRUD y los `GET` de la API no cambian; los formularios de préstamos
  siguen viendo a los prestamistas. Solo la vista administrativa deja de mostrar
  prestamistas y administradores como stakeholders administrables.
- Verification: `pnpm build` compiló correctamente (2564 módulos). No se probó en
  navegador ni contra un servidor, a pedido del usuario.

## 2026-11-25 — Mutaciones restringidas a administradores

- Change: `stakeholderRoutes.js` aplica `requireAdmin` a `POST`, `PUT`, `PATCH`
  y `DELETE`. `GET /api/stakeholders` y `GET /api/stakeholders/:id` siguen
  disponibles para cualquier cuenta autenticada.
- Impact: las cuentas `lender` pueden seguir leyendo stakeholders para crear o
  editar préstamos, pero no pueden crear, modificar ni eliminar personas. Las
  reglas de campos y los códigos de error del CRUD no cambian; las mutaciones
  ahora pueden responder `403 Admin access required`.
- Verification: `pnpm build` compiló correctamente. No se probó contra un
  servidor ni en navegador, a pedido del usuario.

## 2026-11-16 — Validador reubicado en `utils/validators`

- Change: `stakeholderValidation.js` se movió a `src/server/utils/validators/` y pasó a reutilizar `parsePositiveInteger` y `parseOptionalString` de `validators/common.js`.
- Impact: Sin cambios de comportamiento, reglas ni mensajes en `/api/stakeholders`; solo cambia la ubicación del archivo y su import en `stakeholderService`.
- Verification: `node --check` en los validadores y el service; pruebas de runtime de auth/loans/stakeholders con datos temporales ejecutadas en la misma sesión, sin regresiones en el CRUD de stakeholders.

## 2026-11-16 — Validadores movidos a utilidades compartidas

- Change: Se extrajeron los validadores y parseadores de entrada de `stakeholderService` (`validateField`, construcción de atributos para creación/reemplazo/actualización parcial y `parseStakeholderId`) a `src/server/utils/stakeholderValidation.js` para centralizarlos y reutilizarlos, manteniendo las mismas reglas y mensajes de validación.
- Impact: Sin cambios en el comportamiento de la API ni en las rutas/datos; `stakeholderService` ahora importa la validación desde utilidades compartidas.
- Verification: `node --check` en `src/server/services/stakeholderService.js` y `src/server/utils/stakeholderValidation.js` (sin errores). No se ejecutaron pruebas funcionales de endpoints en esta sesión.

## 2026-11-13 — CRUD de stakeholders

- Change: Se agregó el CRUD completo de `stakeholders` en
  `stakeholderRoutes` → `stakeholderController` → `stakeholderService`:
  listar, obtener por id, crear (`POST`), reemplazar (`PUT`), actualizar
  parcialmente (`PATCH`) y eliminar (`DELETE`). La validación vive en el
  service. Se agregó `NotFoundError` (`404`) a `utils/errors.js`.
- Impact: Nuevas rutas protegidas por `checkAuth` bajo `/api/stakeholders`.
  `national_id` duplicado responde `409`; eliminar un stakeholder referenciado
  por usuarios, préstamos o fiadores responde `409`. `PUT` exige nombres y
  limpia los opcionales omitidos; `PATCH` exige al menos un campo.
- Verification: `node --check` en todos los archivos. Pruebas de runtime con
  token: listar, obtener, `400` por id/campos/enum/fecha, `404`, `201`, `409`
  por `national_id` duplicado, `PUT` y `PATCH` correctos, `204` al eliminar,
  `404` posterior y `409` al intentar eliminar un stakeholder referenciado. Se
  usó un registro temporal y se eliminó al final.
- Nota: `Stakeholder.date_of_birth` pasó a `DataTypes.DATEONLY` para coincidir
  con la columna `date` de MySQL.