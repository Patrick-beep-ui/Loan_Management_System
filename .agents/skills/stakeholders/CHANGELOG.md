# Changelog — stakeholders

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
