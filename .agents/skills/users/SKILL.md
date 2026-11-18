---
name: users
description: User module: listing users through the users service, controller, and routes.
---

# users

Módulo de consulta de usuarios.

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Endpoint

| Método | Ruta | Controller | Service |
| --- | --- | --- | --- |
| `GET` | `/api/users` | `userController.getAllUsers` | `userService.getAllUsers` |

## Comportamiento

- Requiere autenticación: `Authorization: Bearer <token>`; sin token o con
  token inválido responde `401`. Lo aplica `checkAuth` en `api.js`.
- Devuelve todos los usuarios con su `Stakeholder` (`stakeholder_id`,
  `first_name`, `last_name`) y su `Role` (`role_id`, `role_name`).
- Excluye `password_hash` de la respuesta.
- Responde `200` con el arreglo de usuarios.
- Ante un error inesperado responde `500` con `{ error: "Internal Server Error" }`.

## Archivos

- `src/server/routes/userRoutes.js`
- `src/server/controllers/userController.js`
- `src/server/services/userService.js`

La creación de usuarios no vive aquí: pertenece al módulo `auth` mediante
`POST /api/auth/signup`, que siempre crea cuentas `lender` (rol resuelto desde
la base, no recibido en el payload). La lista de `/api/users` sigue siendo
global y no filtra por rol.
