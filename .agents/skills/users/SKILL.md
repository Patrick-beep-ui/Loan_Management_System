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
| `GET` | `/api/users/auth` | `userController.authUser` | `userService.authUser` |

## Comportamiento

- Ambas rutas requieren autenticación: `Authorization: Bearer <token>`; sin
  token o con token inválido responde `401`. Lo aplica `checkAuth` en `api.js`.
- Excluyen `password_hash` de la respuesta y ante un error inesperado responden
  `500` con `{ error: "Internal Server Error" }`.
- `GET /api/users` devuelve `200` con el arreglo de todos los usuarios, con su
  `Stakeholder` (`stakeholder_id`, `first_name`, `last_name`) y su `Role`
  (`role_id`, `role_name`).
- `GET /api/users/auth` devuelve `200` con el usuario actual, resuelto desde
  `req.user.user_id`. Incluye `Stakeholder` (`stakeholder_id`, `first_name`,
  `last_name`, `national_id`, `marital_status`, `occupation`, `date_of_birth`) y
  `Role` (`role_id`, `role_name`). Las claves de Sequelize se mantienen como
  `Stakeholder` y `Role` (inicial mayúscula). Si no hay `user_id` responde `401`;
  si el usuario no existe responde `404` con `{ error: "User not found" }`.
  Es la ruta que usa `AuthProvider` en el cliente para hidratar la sesión.

## Archivos

- `src/server/routes/userRoutes.js`
- `src/server/controllers/userController.js`
- `src/server/services/userService.js`

La creación de usuarios no vive aquí: pertenece al módulo `auth` mediante
`POST /api/auth/signup`, que siempre crea cuentas `lender` (rol resuelto desde
la base, no recibido en el payload). La lista de `/api/users` sigue siendo
global y no filtra por rol.
