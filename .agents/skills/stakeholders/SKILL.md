---
name: stakeholders
description: Stakeholders CRUD: people who participate in loans, with field validation, unique national_id, and referral-safe deletion.
---

# stakeholders

CRUD de personas (`stakeholders`) que participan en préstamos como
prestamistas, clientes o fiadores.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Endpoints

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Controller | Service | Acceso |
| --- | --- | --- | --- | --- |
| `GET` | `/api/stakeholders` | `stakeholderController.getAllStakeholders` | `stakeholderService.getAllStakeholders` | token |
| `GET` | `/api/stakeholders/:id` | `stakeholderController.getStakeholderById` | `stakeholderService.getStakeholderById` | token |
| `POST` | `/api/stakeholders` | `stakeholderController.createStakeholder` | `stakeholderService.createStakeholder` | token |
| `PUT` | `/api/stakeholders/:id` | `stakeholderController.replaceStakeholder` | `stakeholderService.replaceStakeholder` | token |
| `PATCH` | `/api/stakeholders/:id` | `stakeholderController.updateStakeholder` | `stakeholderService.updateStakeholder` | token |
| `DELETE` | `/api/stakeholders/:id` | `stakeholderController.deleteStakeholder` | `stakeholderService.deleteStakeholder` | token |

## Campos

| Campo | Tipo | Obligatorio | Reglas |
| --- | --- | --- | --- |
| `stakeholder_id` | entero | — | PK autoincremental; en la URL debe ser entero positivo. |
| `first_name` | texto | sí | `trim`, no vacío, máximo 100 caracteres. |
| `last_name` | texto | sí | `trim`, no vacío, máximo 100 caracteres. |
| `national_id` | texto | no | `trim`, máximo 50; único; `""` se guarda como `null`. |
| `marital_status` | enum | no | `single` o `married`; `""` se guarda como `null`. |
| `occupation` | texto | no | `trim`, máximo 100; `""` se guarda como `null`. |
| `date_of_birth` | fecha | no | Formato `YYYY-MM-DD` y fecha real; `""` se guarda como `null`. |

## Comportamiento por endpoint

- `GET /`: devuelve todos los stakeholders ordenados por `last_name` y luego
  `first_name` (`200`).
- `GET /:id`: devuelve el stakeholder o `404` si no existe.
- `POST /`: crea el stakeholder (`201`) y devuelve el registro creado. Si el
  `national_id` ya existe responde `409`.
- `PUT /:id`: reemplazo completo (`200`). Exige `first_name` y `last_name`; los
  campos opcionales omitidos se guardan como `null`.
- `PATCH /:id`: actualización parcial (`200`). Solo cambia los campos enviados y
  exige al menos uno; con un cuerpo vacío responde `400`.
- `DELETE /:id`: elimina el stakeholder (`204`, sin cuerpo). Si está referenciado
  por `users`, `loans` o `loan_guarantors` responde `409` y no lo elimina.

Los campos desconocidos se ignoran. Un `:id` no numérico o menor o igual a cero
responde `400`.

`POST` y `PUT` de `/api/loans` también pueden crear stakeholders inline para
fiadores. Esos registros usan las mismas reglas de campos y `national_id` único,
pero se gestionan desde el módulo `loans` y no desde este CRUD.

## Errores

- `400` campos obligatorios, enum, fecha o longitud inválidos; `:id` inválido.
- `401` token ausente o inválido (lo aplica `checkAuth`).
- `404` stakeholder inexistente.
- `409` `national_id` duplicado o stakeholder referenciado al eliminar.
- `500` error inesperado.

## Archivos

- `src/server/routes/stakeholderRoutes.js` (montado en `/api/stakeholders`)
- `src/server/controllers/stakeholderController.js`
- `src/server/services/stakeholderService.js`
- `src/server/utils/validators/stakeholderValidation.js`
- `src/server/models/Stakeholder.js`