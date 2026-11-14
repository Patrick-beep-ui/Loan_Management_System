---
name: architecture
description: Layered backend architecture for the API: models, services, controllers, routes, middleware, typed errors, and global routing.
---

# arquitectura

El backend usa cuatro capas. Cada una tiene una única responsabilidad y solo
se comunica con la capa inmediatamente inferior.

```
Routes → Controllers → Services → Models → MySQL
```

El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Capas

- **Models** (`src/server/models/`): mapean las tablas MySQL con Sequelize.
  Declaran campos, restricciones y asociaciones. Ver el módulo `models`.
- **Services** (`src/server/services/`): lógica de negocio y operaciones.
  No conocen `req`, `res` ni HTTP; reciben datos y devuelven resultados o
  lanzan errores. Están pensados para pruebas unitarias.
- **Controllers** (`src/server/controllers/`): reciben `req`/`res`, pasan los
  datos al service y construyen la respuesta. No contienen lógica de negocio.
- **Routes** (`src/server/routes/`): definen método y URL y delegan en el
  controller correspondiente.

## Rutas globales

`src/server/api.js` es el router raíz montado en `/api` desde `main.js`.
Importa `models/associations.js`, registra los routers públicos y luego aplica
`checkAuth` a todo lo que sigue:

```js
api.use("/auth", AuthRouter); // público: /api/auth

api.use(checkAuth); // protege todo lo registrado debajo

api.use("/users", UserRouter); // /api/users
api.use("/roles", RoleRouter); // /api/roles
api.use("/stakeholders", StakeholderRouter); // /api/stakeholders
```

El orden importa: cualquier router registrado después de `checkAuth` exige
`Authorization: Bearer <token>`.

## Middlewares

- `src/server/middlewares/checkAuth.js`: valida el JWT del header
  `Authorization: Bearer <token>`, deja `req.user = { user_id, role_id }` y
  responde `401` si falta o es inválido. No consulta la base de datos.

La firma de tokens vive en `src/server/utils/generateToken.js` (payload
`{ user_id, role_id }`, expiración `JWT_EXPIRES_IN` o `1h`).

## Convención de rutas

Los routers usan `Router.route(path)` y encadenan los verbos en las líneas
siguientes, un método por línea:

```js
UserRouter.route("/")
    .get(getAllUsers);

AuthRouter.route("/signup")
    .post(signup);
```

## Manejo de errores

`src/server/utils/errors.js` define errores tipados que los services lanzan y
los controllers traducen a códigos HTTP:

- `AppError` — base, con `statusCode` (por defecto 500).
- `ValidationError` — entrada inválida (400).
- `ConflictError` — conflicto con datos existentes, por ejemplo email
  duplicado (409).
- `UnauthorizedError` — credenciales inválidas o token ausente/expirado (401).
- `NotFoundError` — recurso inexistente (404).

Los controllers usan `try/catch`: si el error es `AppError` responden con
`error.statusCode` y `{ error: error.message }`; cualquier otro error se
registra y responde `500` con `{ error: "Internal Server Error" }`.

## Códigos de estado

- `200` lectura correcta.
- `201` recurso creado.
- `400` datos faltantes o inválidos.
- `401` credenciales inválidas o token ausente/expirado.
- `404` recurso inexistente.
- `409` conflicto de unicidad.
- `500` error inesperado.
