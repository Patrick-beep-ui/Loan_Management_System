# Changelog — users

## 2026-11-25 — Edición administrativa de la persona vinculada

- Change: el diálogo de `/admin/users` amplió la edición de rol e `is_active`
  con los datos del stakeholder vinculado. `useAdminUsers` carga
  `GET /api/stakeholders/:id`, valida localmente y guarda con
  `PATCH /api/admin/users/:userId` más `PUT /api/stakeholders/:id`; reutiliza
  `StakeholderFormFields` del panel de stakeholders.
- Impact: las cuentas con `stakeholder_id` pueden editar estado y datos personales
  en un solo diálogo; sin stakeholder o si la carga falla solo se editable rol y
  estado. No se añadió ningún endpoint ni se duplicó el CRUD.
- Verification: `pnpm build` compiló correctamente (2564 módulos). No se probó en
  navegador ni contra un servidor, a pedido del usuario.

## 2026-11-25 — Administración de rol y estado de cuenta

- Change: se añadió `PATCH /api/admin/users/:userId` directamente en
  `adminRoutes`, con `adminUserController` → `adminUserService` y el validador
  `adminUserValidation`. Acepta `role_name` y `is_active`, resuelve el rol por
  nombre y devuelve la proyección de `authUser`.
- Impact: el listado sigue en `GET /api/users`; solo las mutaciones viven bajo
  `/api/admin` y quedan detrás de `checkAuth` y `requireAdmin`. El cliente
  administrativo usa el mismo listado y actualiza la fila con la respuesta.
- Verification: `pnpm build` compiló correctamente. No se probó contra un
  servidor ni en navegador, a pedido del usuario.

## 2026-11-19 — Documentado `GET /api/users/auth`

- Change: se documentó el endpoint existente que devuelve el usuario actual
  desde `req.user.user_id`, con su proyección de `Stakeholder` y `Role`, y su
  uso desde `AuthProvider` en el cliente.
- Impact: no cambió el backend; se aclara la hidratación de sesión y la
  diferencia de proyección frente a `GET /api/users`.
- Verification: implementación revisada en `userRoutes.js`, `userController.js`
  y `userService.js`; `pnpm build` del cliente compiló correctamente.

## 2026-11-17 — Signup crea cuentas `lender`

- Change: se documenta que `POST /api/auth/signup` asigna siempre el rol
  `lender`, resuelto por nombre desde `roles`, y que el usuario queda vinculado
  al `stakeholder_id` enviado.
- Impact: `GET /api/users` puede mostrar cuentas `admin` aprovisionadas
  manualmente y cuentas `lender` creadas públicamente; el listado no cambia.
- Verification: dos signups temporales crearon usuarios con `role_id: 2` y
  `role_name: "lender"`; se eliminaron al finalizar la prueba.

## 2026-11-13 — Ruta protegida con JWT

- Change: `GET /api/users` ahora pasa por `checkAuth` en `api.js`.
- Impact: Requiere `Authorization: Bearer <token>`; sin token o con token
  inválido responde `401`.
- Verification: Sin token → `401`; con token válido de `generateToken` → `200`.

## 2026-11-13 — Módulo de usuarios en capas

- Change: `GET /api/users` se movió de `api.js` a `userRoutes` →
  `userController` → `userService`. El service importa los modelos
  directamente y excluye `password_hash` de la respuesta.
- Impact: La URL no cambia. Se eliminó `POST /api/users`; la creación de
  usuarios ahora corresponde a `POST /api/auth/signup`.
- Verification: `GET /api/users` respondió `200` con datos de la base y
  `password_hash` fuera de la proyección SQL.
