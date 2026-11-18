---
name: roles
description: Roles module: listing access roles through the roles service, controller, and routes.
---

# roles

Módulo de consulta de roles de acceso.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Endpoint

| Método | Ruta | Controller | Service |
| --- | --- | --- | --- |
| `GET` | `/api/roles` | `roleController.getAllRoles` | `roleService.getAllRoles` |

## Comportamiento

- Requiere autenticación: `Authorization: Bearer <token>`; sin token o con
  token inválido responde `401`. Lo aplica `checkAuth` en `api.js`.
- Devuelve todos los registros de `roles` (`role_id`, `role_name`, fechas).
- Responde `200` con el arreglo de roles.
- Ante un error inesperado responde `500` con `{ error: "Internal Server Error" }`.

## Roles del sistema

Los roles son `admin` y `lender`. `lender` reemplaza a `operator` mediante la
migración `2026-11-17-rename-operator-role-to-lender.sql`, que conserva
`role_id`; por eso los usuarios asignados al antiguo `operator` ahora son
prestamistas sin cambios en sus foreign keys.

`POST /api/auth/signup` solo crea cuentas `lender` y resuelve el `role_id`
consultando este campo por nombre, así que no acepta un rol en el payload.
`admin` se aprovisiona manualmente en la base.

## Archivos

- `src/server/routes/roleRoutes.js`
- `src/server/controllers/roleController.js`
- `src/server/services/roleService.js`
