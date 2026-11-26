# Changelog — frontend

### 2026-11-25 — Opciones de prestamista para reasignación

- Change: `useAdminLoans` construye el desplegable de `Reassign lender` desde
  `GET /api/users`, filtrando cuentas con `Role.role_name = "lender"` en lugar de
  usar todos los stakeholders. Las opciones se deduplican por
  `stakeholder_id`, muestran nombre y email y conservan las cuentas inactivas.
- Impact: solo se puede reasignar un préstamo a personas vinculadas a una cuenta
  de prestamista. Si el prestamista actual ya no tiene ese rol, el diálogo no lo
  preselecciona y exige elegir una opción válida.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-25 — P5 administración de préstamos

- Change: `AdminLoans` dejó de ser stub. Se añadieron `useAdminLoans` y cinco
  componentes bajo `src/components/admin/loans/` para listar préstamos y
  reasignar el prestamista con `PATCH /api/loans/:id`.
- Impact: el panel usa `GET /api/loans` y `GET /api/stakeholders`, reutiliza los
  formatos de `loanFormat.js` y muestra estados de carga, vacío, error y éxito.
  El diálogo excluye al cliente actual y valida el prestamista elegido.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-25 — Edición conjunta de usuarios y filtro de stakeholders

- Change: se extrajo `StakeholderFormFields` y se reutilizó en el diálogo de
  usuarios y en el formulario de stakeholders. `useAdminUsers` combina
  `PATCH /api/admin/users/:userId` con `PUT /api/stakeholders/:id`; el
  `useAdminStakeholders` oculta las personas vinculadas a cuentas.
- Impact: `/admin/users` edita rol, estado y datos personales en un solo
  diálogo, sin duplicar el campo de rol; `/admin/stakeholders` ya no muestra
  prestamistas ni administradores. No se añadieron endpoints.
- Verification: `pnpm build` compiló correctamente (2564 módulos). No se probó
  en navegador ni contra un servidor, a pedido del usuario.

### 2026-11-25 — P4 administración de stakeholders

- Change: `AdminStakeholders` dejó de ser stub. Se añadieron
  `useAdminStakeholders`, `src/client/utils/stakeholderForm.js` y seis
  componentes bajo `src/components/admin/stakeholders/` para listar, crear,
  editar y eliminar personas con los endpoints existentes de
  `/api/stakeholders`.
- Impact: el panel usa `GET`, `POST`, `PUT` y `DELETE` del CRUD actual, con
  validación local, estados de carga/vacío/error/éxito y confirmación de borrado.
  Los formularios de préstamos siguen leyendo `GET /api/stakeholders`.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-25 — P3 administración de usuarios

- Change: `AdminUsers` dejó de ser stub. Se añadieron `useAdminUsers`,
  `src/client/utils/userForm.js` y cinco componentes bajo
  `src/components/admin/users/` para listar cuentas desde `GET /api/users` y
  editar `role_name` e `is_active` mediante `PATCH /api/admin/users/:userId`.
- Impact: el panel permite refrescar la lista, abrir un diálogo de edición y
  ver estados de carga, vacío, error y éxito sin duplicar el endpoint de listado.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-25 — Shell del panel de administración

- Change: Se añadió `RequireAdmin`, `AdminLayout`, `AdminNav`,
  `AdminPlaceholder`, cinco vistas stub bajo `src/client/views/admin/` y el
  enlace `Admin` en `LoanListHeader`. `main.jsx` monta `/admin` y sus hijos
  detrás de `RequireAuth` y `RequireAdmin`.
- Impact: solo las cuentas `admin` pueden abrir el panel; los no admins vuelven
  a `/loans`. Las fases de dominio posteriores reemplazan el contenido de las
  vistas stub sin tocar el router. El detalle está en [`SKILL.md`](SKILL.md) y
  en el módulo `admin`.
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-23 — Edición reducida de préstamos con pagos

- Change: `Edit` ya no se desactiva cuando el préstamo tiene pagos. `useEditLoanForm`
  distingue ese caso, usa `buildRestrictedLoanPatchPayload` y envía
  `PATCH /api/loans/:id` con fiadores, garantías y, solo para `admin`,
  `lender_id`. Se añadió `RestrictedLoanEditForm` y se ajustaron los avisos de
  detalle y edición.
- Impact: los préstamos pagados siguen sin poder eliminarse ni editar términos
  financieros, cliente, desembolso o cuotas, pero sí actualizan fiadores y
  garantías; los administradores también pueden cambiar el prestamista. El
  detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-23 — Reversión independiente de pagos

- Change: Se añadieron `usePayments`, `usePaymentRevert`, `paymentHistory.js` y
  `RevertPaymentDialog`. La reversión consume `GET /api/payments?loan_id=...` y
  `DELETE /api/payments/:id` por `payment_id`, sin acoplarse al registro de
  pagos ni a la edición del préstamo.
- Impact: `/loans/:id` muestra `Revert` en cuotas pagadas y `Revert interest` en
  la obligación separada pagada. Tras confirmar se eliminan los pagos, se
  recargan el préstamo y el historial, se muestra un aviso y vuelven a estar
  disponibles `Edit` y `Delete`. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-23 — Registro de pagos desde el detalle del préstamo

- Change: Se añadieron `useLoanPayment`, helpers de payload y modales separados
  para pagar cuotas e interés separado. El monto queda bloqueado, `paid_at` es
  opcional y se convierte a ISO con zona. Tras registrar un pago se refresca el
  detalle sin recargar la página.
- Impact: `/loans/:id` muestra acciones `Pay` por cuota pendiente y
  `Pay interest` para la obligación separada pendiente, con aviso de éxito y
  estados actualizados. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó en navegador ni
  contra un servidor, a pedido del usuario.

### 2026-11-19 — Detalle, edición y eliminación de préstamos

- Change: Se añadieron las rutas protegidas `/loans/:id` y `/loans/:id/edit`, el
  hook compartido `useLoanFormState`, los helpers `loanEdit.js` y los
  componentes de `details/` y `edit/`. La creación y la edición reutilizan el
  mismo formulario y vista previa; la eliminación usa `Dialog`.
- Impact: El listado enlaza cada ID al detalle, muestra avisos de creación y
  eliminación, y bloquea editar o eliminar cuando hay pagos registrados. La
  edición envía un `PUT` completo y vuelve al detalle con un aviso. El detalle
  está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente (2529 modules transformed).
  No se probó en navegador ni contra un servidor; solo se ejecutó la
  compilación, a pedido del usuario.

### 2026-11-19 — Componentes de préstamos agrupados por propósito

- Change: Se movieron los componentes de `src/components/loans/` a
  `create/` y `list/` según el flujo que atienden y se actualizaron todas las
  importaciones. No cambia ningún componente ni su comportamiento.
- Impact: Las vistas `CreateLoan` y `Loan` importan desde
  `src/components/loans/create/` y `src/components/loans/list/`
  respectivamente. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente (2483 modules transformed).
  No se probó en navegador ni contra un servidor; solo se ejecutó la
  compilación, a pedido del usuario.

### 2026-11-19 — Componentes por dominio para el listado de préstamos

- Change: Se dividió `Loans.jsx` en componentes de `src/components/loans/`, se
  extrajo la carga y las acciones a `useLoans` y el formato a
  `src/client/utils/loanFormat.js`, manteniendo el mismo listado.
- Impact: La vista queda como composición del encabezado, los avisos y la tabla;
  no cambian columnas, estados, mensajes ni comportamiento. El detalle está en
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente (2483 modules transformed).
  No se probó en navegador ni contra un servidor; solo se ejecutó la
  compilación, a pedido del usuario.

### 2026-11-19 — Componentes por dominio para CreateLoan

- Change: Se dividió `CreateLoan.jsx` en componentes de `src/components/loans/`,
  se extrajo el estado a `useCreateLoanForm` y la validación a
  `src/client/utils/loanForm.js`, manteniendo el mismo flujo de dos pasos.
- Impact: La vista queda como composición del formulario y la vista previa; no
  cambian rutas, payload ni comportamiento. El detalle está en
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente (2476 modules transformed).
  No se probó en navegador ni contra un servidor; solo se ejecutó la
  compilación, a pedido del usuario.

### 2026-11-19 — Creación de préstamos con vista previa

- Change: Se reemplazó el placeholder de `CreateLoan` por un formulario que
  carga stakeholders, admite fiadores existentes o inline, exige garantías y
  calcula las cuotas con `src/client/utils/loanSchedule.js` antes de enviar
  `POST /api/loans`. `Loan` añade el botón `New loan` y un aviso de créación
  correcta. Se instalaron los componentes shadcn `select` y `textarea`.
- Impact: `/create-loan` pasa a ser un flujo funcional de dos pasos (formulario
  y revisión) y vuelve a `/loans` con `state.createdLoanId` tras la creación.
  El backend sigue siendo el único validador definitivo y no se añadió ningún
  endpoint nuevo. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: no se ejecutó `pnpm build` ni se probó en navegador o contra un
  servidor, a pedido del usuario. Queda pendiente esa comprobación.

### 2026-11-19 — Contexto de autenticación y rutas protegidas

- Change: Se reemplazó el wrapper de `AuthContext.jsx` por `AuthProvider`,
  `useAuth()` y `RequireAuth`, con hidratación desde `GET /api/users/auth`.
  El servicio axios añade un interceptor de `401` que limpia el token y emite
  `auth:unauthorized`. `/loans` y `/create-loan` quedan tras el guard; `Login`
  usa `login(token)` y redirige a la ruta de origen; `Loan` muestra nombre y rol
  desde `useAuth().user` sin filtrar en cliente.
- Impact: Las rutas de préstamos exigen sesión y el usuario está disponible en
  cualquier vista. El filtrado de préstamos sigue siendo responsabilidad del
  backend por JWT. El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente (220 modules transformed).
  No se probó contra un servidor ni en navegador.

### 2026-11-18 — Listado de préstamos

- Change: Se reemplazó el placeholder de `Loan` por una tabla que consume
  `GET /api/loans` mediante `api.get("/loans")`. Muestra ID, prestamista,
  cliente, monto, tasa, modo, fecha de desembolso y total a pagar, con importes
  y fechas formateados y estados de carga, vacío y error con reintento. Un `401`
  elimina el token y redirige a `/login`.
- Impact: `/loans` pasa a ser una vista funcional que usa el servicio axios
  compartido y los componentes `Table*`. `CreateLoan` sigue siendo placeholder.
  El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó contra un
  servidor ni en navegador.

### 2026-11-18 — Servicio axios compartido

- Change: Se añadió `src/lib/axiosService.js`, una instancia de axios con
  `baseURL` desde `VITE_API_URL` (o `http://localhost:3000/api`) y un
  interceptor que adjunta `Authorization: Bearer <token>` leyendo `token` de
  `localStorage`. `Login`, `Signup` y `Test.jsx` ahora usan `api.post`/`api.get`
  con rutas relativas a `/api`.
- Impact: Todas las peticiones pasan por un único cliente y el token se envía
  de forma centralizada; no hay que repetir el header ni el prefijo `/api`.
  El detalle está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente. No se probó el flujo contra
  un servidor ni en navegador; `/api/roles` sigue deshabilitado en
  `src/server/api.js`.

### 2026-11-18 — Vistas de login y signup

- Change: Se reemplazó el placeholder de `Login` por un formulario conectado a
  `POST /api/auth/login` y se añadió `Signup`, conectado a
  `POST /api/auth/signup` mediante `axios.post`. Ambos usan `Card`, `Input`,
  `Label` y `Button`,
  validan los campos y muestran estados de carga y error. `Login` guarda el JWT
  en `localStorage` como `token` y navega a `/loans`; `Signup` navega a
  `/login` con un aviso de registro correcto.
- Impact: El cliente ya puede autenticarse contra la API. `Loan` y
  `CreateLoan` siguen siendo placeholders y todavía no envían el token a las
  rutas protegidas. Los detalles están en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente y `git diff --check` no
  reportó errores. No se probó el flujo contra un servidor ni en navegador.

### 2026-11-18 — Tipografía de marca

- Change: Se reemplazó Geist por Montserrat (texto) y Playfair Display
  (encabezados), cargadas desde Google Fonts con `preconnect` y `display=swap`
  en `index.html`; `@theme inline` define `--font-sans` y `--font-heading`, y
  `@layer base` aplica `font-heading` a `h1`–`h6`. Se eliminó la dependencia
  `@fontsource-variable/geist`.
- Impact: Cambia la tipografía de toda la interfaz; `CardTitle` y `DialogTitle`
  ya usaban la utilidad `font-heading`. Las fuentes requieren conexión a
  Google Fonts en tiempo de ejecución. El detalle está en
  [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente, `git diff --check` no
  reportó errores, el HTML compilado conserva los enlaces de fuentes y el CSS
  compilado ya no contiene Geist. Sin comprobación visual en navegador.

### 2026-11-18 — Paleta de marca

- Change: Se reemplazaron los tokens de color de `src/client/index.css` por la
  paleta `263A69` (principal), `B0C7DD` (secundaria), `E8E3DD` (fondos y
  tarjetas), `EDECEA` (notificaciones y popups) y `0F0F0F` (texto), convertida
  a `oklch`; se recoloreó `.dark` con los mismos colores y se eliminaron los
  estados de color heredados de Vite en `index.css` y `App.css`.
- Impact: Cambia la apariencia de todos los componentes que usan utilidades
  shadcn. `--destructive` y los tokens `chart-*`/`sidebar-*` conservan sus
  valores anteriores. El mapeo completo está en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente, `git diff --check` no
  reportó errores y el CSS compilado contiene los nuevos valores `oklch`. Sin
  comprobación visual en navegador.

### 2026-11-18 — Scaffold del frontend

- Change: Se añadió la base del cliente React: router con cuatro rutas, vistas
  placeholder, seis componentes de UI generados con shadcn, Tailwind 4 con
  tokens de tema claro/oscuro, fuente Geist, alias `@` y los archivos de
  configuración `components.json` y `jsconfig.json`.
- Impact: Define la estructura y las convenciones del frontend. Todavía no hay
  integración con la API ni autenticación en el cliente; `App.jsx` sigue siendo
  la demo de Vite y los componentes importan `cn` del paquete en lugar de
  `@/lib/utils`. Ver los detalles en [`SKILL.md`](SKILL.md).
- Verification: `pnpm build` compiló correctamente (46 módulos) y
  `git diff --check` no reportó errores. Las rutas y los componentes no se
  probaron en el navegador.
