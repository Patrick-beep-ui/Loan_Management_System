---
name: frontend
description: Frontend React con Vite: entrada, rutas, componentes de UI, estilos y alias de rutas.
---

# Frontend

La interfaz vive en `src/client/` y usa React 19 con Vite 6. Los primitivos
compartidos están en `src/components/ui/`, los componentes por dominio en
`src/components/<dominio>/`, los hooks de cliente en `src/client/hooks/` y las
utilidades en `src/lib/` y `src/client/utils/`.
El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Entrada y rutas

`src/client/main.jsx` crea el router con `createBrowserRouter` y monta
`RouterProvider` dentro de `React.StrictMode`. Una ruta sin `path` monta
`AuthProvider` como layout raíz; dentro de ella, `RequireAuth` protege
`/loans`, `/create-loan`, `/loans/:id` y `/loans/:id/edit`, y `RequireAdmin`
protege `/admin` y sus hijos. El resto de las rutas son públicas:

| Ruta | Vista | Archivo | Acceso |
| --- | --- | --- | --- |
| `/` | `App` (demo inicial de Vite) | `src/client/App.jsx` | público |
| `/login` | `Login` | `src/client/views/Login.jsx` | público |
| `/signup` | `Signup` | `src/client/views/Signup.jsx` | público |
| `/loans` | `Loan` | `src/client/views/Loans.jsx` | protegido |
| `/create-loan` | `CreateLoan` | `src/client/views/CreateLoan.jsx` | protegido |
| `/loans/:id` | `LoanDetails` | `src/client/views/LoanDetails.jsx` | protegido |
| `/loans/:id/edit` | `EditLoan` | `src/client/views/EditLoan.jsx` | protegido |
| `/admin` | redirección | `src/client/main.jsx` | admin |
| `/admin/dashboard` | `AdminDashboard` | `src/client/views/admin/AdminDashboard.jsx` | admin |
| `/admin/users` | `AdminUsers` | `src/client/views/admin/AdminUsers.jsx` | admin |
| `/admin/stakeholders` | `AdminStakeholders` | `src/client/views/admin/AdminStakeholders.jsx` | admin |
| `/admin/loans` | `AdminLoans` | `src/client/views/admin/AdminLoans.jsx` | admin |
| `/admin/payments` | `AdminPayments` | `src/client/views/admin/AdminPayments.jsx` | admin |
| `/test` | `Test` (vista de prueba) | `src/client/Test.jsx` | público |

`Login` y `Signup` consumen `/api/auth` a través del servicio compartido
`src/lib/axiosService.js` (`api.post`): validan los campos, desactivan el botón
mientras envían y muestran `error.response?.data?.error` o un mensaje de red en
una región `role="alert"` con tokens `destructive`. `Login` usa
`useAuth().login(token)` para guardar el JWT en `localStorage`, cargar el
usuario con `/users/auth` y navegar a la ruta de origen (`state.from`) o
`/loans`. `Signup` envía `email`, `password` y `stakeholder_id` como entero
positivo y, tras el `201`, navega a `/login` con un aviso de registro correcto.
`Loan` consume `/api/loans` con `api.get("/loans")` y muestra un listado en
tabla con ID, prestamista, cliente, monto, tasa, modo, fecha de desembolso y
total a pagar; usa `useAuth().user` solo para mostrar nombre y rol, porque el
backend ya filtra los préstamos según el JWT. Incluye estados de carga, vacío y
error con reintento, un botón `New loan` que navega a `/create-loan` y un aviso
`role="status"` cuando vuelve con `state.createdLoanId`; un `401` global limpia
la sesión y `RequireAuth` vuelve a `/login`. `CreateLoan` es un formulario
funcional: carga `GET /api/stakeholders`, permite seleccionar o crear fiadores,
genera una vista previa de cuotas y envía `POST /api/loans` tras la aprobación;
no registra pagos; esa acción ocurre desde `LoanDetails`. `LoanDetails` consume `GET /api/loans/:id` y muestra
el resumen, el calendario, fiadores, garantías y el estado del interés; desde
ahí se navega a `/loans/:id/edit` y se elimina el préstamo con `Dialog` solo si
no hay pagos registrados. `EditLoan` recupera el mismo préstamo: sin pagos
rellena el formulario compartido y envía `PUT /api/loans/:id` con todos los
arreglos; con pagos muestra un formulario reducido y envía `PATCH /api/loans/:id`
solo con fiadores, garantías y, para `admin`, `lender_id`.
`App.jsx` continúa siendo el contador de ejemplo de
Vite. La ruta `/test` usa `api.get("/roles")`; esa ruta del servidor está
actualmente deshabilitada en `src/server/api.js`, por lo que no forma parte del
flujo de autenticación.

## Configuración y dependencias

- `vite.config.js`: registra los plugins `react()` y `tailwindcss()` y define el
  alias `@` → `./src` con `fileURLToPath(new URL("./src", import.meta.url))`.
- `jsconfig.json`: `baseUrl` `.` y el path `@/*` → `./src/*` para que editores y
  herramientas resuelvan el mismo alias.
- `components.json`: configuración de shadcn con estilo `base-nova`, `tsx: false`,
  `rsc: false`, CSS en `src/client/index.css`, iconos `lucide` y los alias
  `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib` y `@/hooks`.
- Dependencias de UI: `@base-ui/react` (primitivos), `class-variance-authority`
  (variantes), `cn` (concatenación de clases), `lucide-react` (iconos),
  `tailwindcss`, `@tailwindcss/vite` y `tw-animate-css`. `react-router-dom`
  provee el enrutamiento. La instalación de la CLI añadió también `shadcn` e
  `install` como dependencias; el código actual no las utiliza.
- `axios` se usa únicamente a través de `src/lib/axiosService.js`; `Login`,
  `Signup`, `Test.jsx` y los hooks `useLoans`, `useLoanFormState`,
  `useCreateLoanForm`, `useLoanDetails`, `useEditLoanForm`, `useLoanPayment`,
  `usePayments`, `usePaymentRevert`, `useAdminUsers`, `useAdminStakeholders`,
  `useAdminLoans`, `useAdminPayments` y `useAdminDashboard` importan esa
  instancia en lugar de crear clientes propios.

## Componentes de UI

`src/components/ui/` contiene los componentes generados con shadcn:

| Archivo | Componentes exportados | Primitivo |
| --- | --- | --- |
| `button.jsx` | `Button`, `buttonVariants` | `Button` de `@base-ui/react/button` |
| `card.jsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | elementos `div` |
| `dialog.jsx` | `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | `Dialog` de `@base-ui/react/dialog` |
| `input.jsx` | `Input` | `Input` de `@base-ui/react/input` |
| `label.jsx` | `Label` | elemento `label` |
| `select.jsx` | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` | `Select` de `@base-ui/react/select` |
| `table.jsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | etiquetas HTML de tabla |
| `textarea.jsx` | `Textarea` | elemento `textarea` |

Los componentes con estilos combinan `className` mediante `cn`. Hoy importan
`cn` directamente del paquete `cn`; `src/lib/utils.js` también lo reexporta y es
el alias declarado en `components.json`, pero los componentes aún no lo usan.
Conviene tenerlo presente al agregar componentes nuevos.

### Componentes por dominio

`src/components/admin/` reúne la UI del panel de administración:

| Archivo | Responsabilidad |
| --- | --- |
| `AdminNav.jsx` | navegación con `NavLink`; el activo usa `variant="default"` y los demás `"outline"` |
| `AdminPlaceholder.jsx` | tarjeta de marcador de posición reutilizable; ya no es usada por el panel |
| `users/AdminUsersHeader.jsx` | título, descripción y botón de actualización |
| `users/AdminUsersAlerts.jsx` | avisos de error y éxito del flujo de usuarios |
| `users/AdminUsersTable.jsx` | tabla con estados de carga y vacío |
| `users/AdminUserRow.jsx` | fila con rol, estado y acción de edición |
| `users/AdminUserEditDialog.jsx` | diálogo único con rol, estado y datos del stakeholder vinculado |
| `stakeholders/AdminStakeholdersHeader.jsx` | título, descripción y acciones `Refresh` y `New stakeholder` |
| `stakeholders/AdminStakeholdersAlerts.jsx` | avisos de error y éxito del flujo de stakeholders |
| `stakeholders/AdminStakeholdersTable.jsx` | tabla con estados de carga y vacío |
| `stakeholders/AdminStakeholderRow.jsx` | fila con acciones `Edit` y `Delete` |
| `stakeholders/StakeholderFormFields.jsx` | campos reutilizables de persona con validación por campo |
| `stakeholders/AdminStakeholderFormDialog.jsx` | formulario de alta y edición que reutiliza `StakeholderFormFields` |
| `stakeholders/DeleteStakeholderDialog.jsx` | confirmación de eliminación con `Dialog` |
| `loans/AdminLoansHeader.jsx` | título, descripción y botón de actualización |
| `loans/AdminLoansAlerts.jsx` | avisos de error y éxito del flujo de préstamos |
| `loans/AdminLoansTable.jsx` | tabla con estados de carga y vacío |
| `loans/AdminLoanRow.jsx` | fila con importes formateados y acción `Reassign lender` |
| `loans/ReassignLenderDialog.jsx` | selección de prestamista y envío de `PATCH /api/loans/:id` |
| `payments/AdminPaymentsHeader.jsx` | título, descripción y acciones `Refresh` y `Record payment` |
| `payments/AdminPaymentsAlerts.jsx` | avisos de error y éxito del flujo de pagos |
| `payments/AdminPaymentsTable.jsx` | tabla con estados de carga y vacío |
| `payments/AdminPaymentRow.jsx` | fila con pago, préstamo, destino y acción `Revert` |
| `payments/AdminPaymentRecordDialog.jsx` | selección de cuota o interés pendiente y envío del pago |
| `dashboard/AdminDashboardHeader.jsx` | título, descripción y botón de actualización |
| `dashboard/AdminDashboardAlerts.jsx` | aviso de error del panel |
| `dashboard/AdminDashboardCards.jsx` | tarjetas de importes, pagos y cuotas vencidas |
| `dashboard/AdminDashboardStatus.jsx` | estado de cuotas, interés y cartera |
| `dashboard/AdminDashboardPaymentTrend.jsx` | pagos agrupados por mes |
| `dashboard/AdminDashboardRecentPayments.jsx` | tabla de los pagos más recientes |

`src/components/loans/` reúne la UI específica de préstamos, separada por
propósito en `create/`, `list/`, `details/` y `edit/`. Las vistas importan desde
la carpeta correspondiente con el alias `@/`.

#### `src/components/loans/create/`

| Archivo | Responsabilidad |
| --- | --- |
| `CreateLoanForm.jsx` | formulario completo: datos, fiadores, garantías y envío de la vista previa |
| `LoanDetailsFields.jsx` | campos de prestamista, cliente, monto, tasa, modo, desembolso y cuotas |
| `GuarantorsFieldArray.jsx` | alta, baja y listado de fiadores |
| `GuarantorRow.jsx` | un fiador existente o inline |
| `CollateralsFieldArray.jsx` | alta, baja y listado de garantías |
| `CollateralRow.jsx` | una garantía con descripción y valor estimado |
| `InstallmentPreview.jsx` | resumen, tabla de cuotas y acciones de aprobación |
| `FormField.jsx` | envoltorio de etiqueta y control, usado por el formulario |
| `ErrorAlert.jsx` | mensaje de error con `role="alert"`, usado por el formulario y la vista previa |

#### `src/components/loans/list/`

| Archivo | Responsabilidad |
| --- | --- |
| `LoanListHeader.jsx` | título, descripción según el usuario y botón `New loan` |
| `LoanCreatedAlert.jsx` | aviso descartable `role="status"` tras la creación |
| `LoanDeletedAlert.jsx` | aviso descartable `role="status"` tras la eliminación |
| `LoanLoadErrorAlert.jsx` | error de carga con acción `Retry` |
| `LoanTable.jsx` | tabla del listado con estados de carga y vacío |
| `LoanTableRow.jsx` | una fila con importes, tasa, modo y fecha formateados; el ID enlaza al detalle |

#### `src/components/loans/details/`

| Archivo | Responsabilidad |
| --- | --- |
| `LoanDetailsHeader.jsx` | título, acciones `Back to loans`, `Edit` y `Delete` |
| `LoanSummary.jsx` | resumen de prestamista, cliente, importes y condiciones |
| `LoanInstallmentsTable.jsx` | calendario ordenado por número de cuota, con acciones `Pay` y `Revert` |
| `LoanGuarantorsList.jsx` | fiadores y sus IDs de stakeholder |
| `LoanCollateralsList.jsx` | garantías con valor estimado |
| `LoanInterestStatus.jsx` | estado del interés ordinario y sus acciones `Pay interest` y `Revert interest` |
| `LoanLockedAlert.jsx` | aviso que explica qué campos quedan bloqueados con pagos y que la eliminación requiere revertirlos |
| `LoanUpdatedAlert.jsx` | aviso descartable tras volver de la edición |
| `LoanDetailsError.jsx` | error de carga, `404` y reintento |
| `DeleteLoanDialog.jsx` | confirmación de eliminación con `Dialog` |

#### `src/components/loans/edit/`

| Archivo | Responsabilidad |
| --- | --- |
| `EditLoanHeader.jsx` | título de la edición y acción para volver al detalle |
| `EditLoanError.jsx` | error de carga, `404` y reintento |
| `EditLockedAlert.jsx` | aviso que explica la edición reducida cuando hay pagos |
| `RestrictedLoanEditForm.jsx` | formulario de edición con pagos: fiadores, garantías y selección de prestamista solo para `admin` |

### Pagos y reversión

`src/components/payments/` reúne la UI de registro y reversión de pagos,
separada de los flujos de préstamos:

| Archivo | Responsabilidad |
| --- | --- |
| `InstallmentPaymentModal.jsx` | confirma el pago de una cuota contra `/payments/installment` |
| `InterestPaymentModal.jsx` | confirma el pago del interés separado contra `/payments/interest` |
| `PaymentModalFields.jsx` | monto bloqueado y `paid_at` opcional compartidos |
| `PaymentSuccessAlert.jsx` | aviso descartable `role="status"` tras registrar o revertir un pago |
| `RevertPaymentDialog.jsx` | confirmación de reversión con `Dialog` y botón destructivo |

## Estilos

`src/client/index.css` importa `tailwindcss`, `tw-animate-css` y
`shadcn/tailwind.css`; declara `@custom-variant dark`, las variables de color de
la paleta de marca y un bloque `@theme inline` que las expone como utilidades
(`--color-*`, `--font-heading`, `--font-sans`, `--radius-*`). El bloque
`@layer base` aplica `border-border`, `outline-ring/50`, `bg-background`,
`text-foreground` y `font-sans` a los elementos base, y `font-heading` a
los encabezados semánticos `h1` a `h6`.

### Paleta de marca

Los cinco colores se definen en formato `oklch` dentro de `:root` y `.dark`:

| Hex | Uso | Tokens principales |
| --- | --- | --- |
| `263A69` | Color principal de la aplicación | `--primary`, `--ring` |
| `B0C7DD` | Acciones secundarias relacionadas con el principal | `--secondary`, `--accent`, `--border`, `--input` |
| `E8E3DD` | Fondos, objetos sutiles y tarjetas | `--background`, `--card` |
| `EDECEA` | Notificaciones, popups y mensajes | `--popover`, `--muted`, `--primary-foreground` en tema claro |
| `0F0F0F` | Texto | `--foreground`, `--card-foreground`, `--secondary-foreground` |

En tema claro los textos sobre el azul oscuro usan `EDECEA`; en `.dark` el
fondo es `0F0F0F`, las tarjetas y popups usan `263A69` y los acentos pasan a
`B0C7DD`. `--destructive` conserva el rojo de shadcn y los tokens `chart-*` y
`sidebar-*` mantienen sus valores por defecto. Los estilos heredados de Vite
(colores fijos en `a`, `button` y `App.css`) se eliminaron o se reemplazaron por
variables de la paleta.

### Tipografía

Las fuentes se cargan desde Google Fonts mediante los enlaces `preconnect` y
`stylesheet` en `index.html`: Montserrat (rango variable `100..900`) para el
texto y Playfair Display (`400..900`) para los títulos, ambas con
`display=swap`. En `index.css`, `@theme inline` define `--font-sans` como
Montserrat y `--font-heading` como Playfair Display. La utilidad `font-heading`
se usa en `CardTitle` y `DialogTitle`, y `@layer base` la aplica también a
`h1`–`h6`. No se instala ninguna fuente local: el paquete
`@fontsource-variable/geist` se eliminó del proyecto.

## Servicio HTTP

`src/lib/axiosService.js` exporta una instancia de axios con
`baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"`.
Un interceptor de petición lee el JWT de `localStorage` bajo la clave `token`
y, si existe, añade `Authorization: Bearer <token>` a todas las peticiones.
Por eso las vistas invocan métodos con rutas relativas a `/api`
(`api.post("/auth/login")`, `api.get("/roles")`, `api.get("/users")`,
`api.get("/stakeholders")`, `api.get("/stakeholders/:id")`,
`api.post("/stakeholders")`, `api.put("/stakeholders/:id")`,
`api.delete("/stakeholders/:id")`, `api.patch("/admin/users/:userId")`,
`api.post("/loans")`,
`api.put("/loans/:id")`, `api.patch("/loans/:id")`,
`api.post("/payments/installment")`, `api.post("/payments/interest")`,
`api.get("/payments")`, `api.delete("/payments/:id")`) y no necesitan construir el header ni repetir el prefijo
`/api`. El interceptor de respuesta elimina
`token` y emite `auth:unauthorized` ante un `401`, salvo en `/auth/login` y
`/auth/signup` para no ocultar errores de credenciales. `AuthProvider` escucha
ese evento y limpia el usuario.

## Autenticación en el cliente

`src/client/contexts/AuthContext.jsx` exporta `AuthProvider`, `useAuth()`,
`RequireAuth` y `RequireAdmin`:

- `AuthProvider` es el layout raíz: al montar hidrata el usuario con
  `api.get("/users/auth")` si hay `token`, expone `{ user, isAuthenticated,
  loading, login, logout }` y renderiza `<Outlet />`.
- `useAuth()` permite leer el usuario y las acciones de sesión desde cualquier
  vista; falla si se usa fuera del provider.
- `RequireAuth` muestra "Checking session..." mientras hidrata y redirige a
  `/login` con `state.from` si no hay sesión; si la hay, renderiza `<Outlet />`.
- `RequireAdmin` usa el mismo estado de hidratación, redirige a `/login` sin
  sesión y a `/loans` si `user.Role.role_name` no es `admin`; si lo es,
  renderiza `<Outlet />`.
- `login(token)` guarda el JWT, carga `/users/auth` y actualiza el estado;
  `logout()` borra el token y el usuario. Ambos están disponibles vía
  `useAuth()`.
- El usuario expuesto conserva las claves de Sequelize `Stakeholder` y `Role`
  (`user.Stakeholder.first_name`, `user.Role.role_name`, etc.). `CreateLoan`
  toma `lender_id` de `user.stakeholder_id` para cuentas `lender`; `admin` lo
  selecciona en el formulario.
- Las peticiones a `/auth/login` y `/auth/signup` usan `api.post` del servicio
  compartido; la URL final se resuelve con el `baseURL` configurado. El JWT se
  guarda en `localStorage` con la clave `token` y el interceptor lo adjunta como
  `Authorization: Bearer <token>` a todas las peticiones, incluso a las públicas
  cuando ya hay una sesión. Ese es el mecanismo que exige `checkAuth`.
- Los errores se leen de `error.response?.data?.error`; si no hay respuesta se
  muestra un mensaje genérico. Ambos casos usan una región `role="alert"` con
  `text-destructive` y `bg-destructive/10`.
- Las dos vistas comparten la misma composición: `Card`, `CardHeader`,
  `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Label`, `Input`
  y `Button`, sin colores fijos.

## Panel de administración

`src/client/layouts/AdminLayout.jsx` es el shell de `/admin`: título, `AdminNav`
y `Outlet`. Las vistas en `src/client/views/admin/` son reemplazadas por cada
fase de dominio sin tocar el router; `/admin/users` lista cuentas con
`useAdminUsers` desde `GET /api/users` y usa un único diálogo para rol, estado y
datos del stakeholder vinculado. Esos datos se cargan con
`GET /api/stakeholders/:id` y se guardan con `PATCH /api/admin/users/:userId`
más `PUT /api/stakeholders/:id`; si no hay persona vinculada solo se muestran
rol y estado. `/admin/stakeholders` usa `useAdminStakeholders` sobre el CRUD
existente de `/api/stakeholders`: lista con `GET`, crea con `POST`, edita con
`PUT` y elimina con `DELETE`, con validación local y confirmación antes de
borrar; oculta en cliente las personas vinculadas a cuentas. `/admin/loans` usa
`useAdminLoans` sobre `GET /api/loans` y `GET /api/users`; el diálogo
`Reassign lender` toma sus opciones de las cuentas con `Role.role_name =
"lender"`, excluye al cliente del préstamo, envía `PATCH /api/loans/:id` con
`lender_id` y recarga el listado tras guardar. Las cuentas inactivas con rol
`lender` siguen apareciendo. `/admin/payments` usa `useAdminPayments` sobre
`GET /api/payments` para el historial de `admin` y `GET /api/loans` para escoger
destinos pendientes; `Record payment` publica en los endpoints de cuota o interés
con un monto calculado por el destino, y la reversión reutiliza
`usePaymentRevert` con `RevertPaymentDialog`. No se expone `PATCH /api/payments/:id`
en el panel. `/admin/dashboard` usa `useAdminDashboard` y
`src/client/utils/adminDashboard.js` para agregar `GET /api/loans` y
`GET /api/payments` en el cliente: tarjetas de importes, estado de la cartera,
tendencia mensual y pagos recientes, sin endpoint propio.
`LoanListHeader` muestra el enlace `Admin` solo cuando
`user.Role.role_name === "admin"`. El
contrato completo, incluido el orden de las fases posteriores, vive en el módulo
`admin`.

## Listado de préstamos

La vista `src/client/views/Loans.jsx` arma el `Card` y compone `LoanListHeader`,
`LoanCreatedAlert`, `LoanDeletedAlert`, `LoanLoadErrorAlert` y `LoanTable`. El
hook `useLoans` consume `api.get("/loans")` con el servicio compartido y
mantiene los estados de carga, vacío y error, además de las acciones de reintento, cierre del aviso y
navegación a `/create-loan`. Usa `useAuth().user` solo para construir la
descripción con nombre y rol, porque el backend filtra los préstamos según el
JWT. `LoanTable` muestra ID, prestamista, cliente, monto, tasa, modo, fecha de
desembolso y total a pagar; los formatos viven en
`src/client/utils/loanFormat.js`: importes con dos decimales y separador de
miles, tasa con hasta cuatro decimales y `%`, fecha `YYYY-MM-DD` y `—` para
valores ausentes. Cuando la creación termina, la vista vuelve con
`state.createdLoanId` y `LoanCreatedAlert` muestra un aviso `role="status"`
descartable. Tras una eliminación, la vista vuelve con `state.deletedLoanId` y
`LoanDeletedAlert` muestra el aviso correspondiente; el ID de cada fila enlaza
a `/loans/:id`. Ante un `401`, el interceptor global limpia `token` y
`RequireAuth` redirige a `/login`.

## Creación de préstamos

La vista `src/client/views/CreateLoan.jsx` solo arma el encabezado y alterna
entre `CreateLoanForm` e `InstallmentPreview`. El hook `useLoanFormState`
mantiene el estado, carga `GET /api/stakeholders` con `api.get("/stakeholders")`
y valida con `buildLoanPayload` de `src/client/utils/loanForm.js`;
`normalizeGuarantors` y `normalizeCollaterals` son helpers exportados del mismo
archivo y se reutilizan en la edición con pagos. `useCreateLoanForm` solo envía
`POST /api/loans`. El formulario
permite elegir cliente, prestamista (solo `admin`) y fiadores existentes;
también permite crear fiadores inline con `first_name`, `last_name`,
`national_id`, `marital_status`, `occupation` y `date_of_birth`. Exige al menos
un fiador y una garantía con `description` y `estimated_value` opcional.
`lender_id` se deriva de `useAuth().user.stakeholder_id` para cuentas `lender`.

El botón `Preview installments` valida los datos con `buildLoanPayload` y usa
`src/client/utils/loanSchedule.js` para generar el calendario antes de enviar
nada. El helper trabaja en centavos: calcula
`interest = round(loan_amount * interest_rate / 100)`, reparte el total en
cuotas iguales con el resto en la última y produce fechas mensuales desde la
primera fecha de vencimiento, ajustando al último día del mes. El total de las
cuotas es capital + interés en modo `included` y solo capital en `separate`; en
ese modo el interés se muestra como una obligación aparte. Los vencimientos son
`YYYY-MM-DD` y el primer vencimiento no puede ser anterior al desembolso.

La etapa de revisión muestra un resumen y una `Table` con número, vencimiento e
importe de cada cuota. `Back to edit` conserva los datos; `Approve & create`
envía `api.post("/loans", payload)` con todos los campos y arreglos normalizados
y, tras el `201`, vuelve a `/loans` con `state.createdLoanId`. Los errores de
validación y de API se muestran en una región `role="alert"` con tokens
`destructive`.

## Detalle y edición de préstamos

La vista `src/client/views/LoanDetails.jsx` compone los componentes de
`src/components/loans/details/` alrededor del hook `useLoanDetails`, que consume
`api.get("/loans/:id")` y mantiene estados de carga, error, `404`, aviso de
actualización y confirmación de eliminación. Muestra los datos del préstamo, las
cuotas, fiadores, garantías y la obligación de interés. `loanHasPayments` de
`src/client/utils/loanEdit.js` detecta cuotas pagadas o interés pagado:
`Delete` queda desactivado y `Edit` abre el formulario reducido. El backend
sigue siendo la autoridad y responde `409` ante intentos directos.
`DeleteLoanDialog` usa `Dialog` y, tras
`api.delete("/loans/:id")`, vuelve a `/loans` con `state.deletedLoanId`.

El registro de pagos se abre desde las acciones `Pay` de cada cuota pendiente y
`Pay interest` de la obligación separada pendiente. `useLoanPayment` administra
el destino, la fecha opcional y el envío; `src/components/payments/` contiene
`InstallmentPaymentModal`, `InterestPaymentModal`, `PaymentModalFields` y
`PaymentSuccessAlert`. El monto aparece bloqueado con el valor exacto exigido
por el backend. Si `paid_at` se deja vacío se omite del payload y el servidor
usa la hora actual; si se completa, `buildPaymentPayload` lo convierte a ISO con
zona antes de enviarlo. Tras el `201` se cierra el modal, se llama a
`refreshLoan()` y se muestra un aviso `role="status"`; por eso el detalle
distingue entre `loading` inicial y `refreshing` posterior.

La reversión es independiente del registro de pagos: `usePayments` carga
`/api/payments?loan_id=...`, `paymentHistory.js` asocia cada pago con su cuota o
interés y `usePaymentRevert` envía `DELETE /api/payments/:id` usando solo el
`payment_id`. `RevertPaymentDialog` pide confirmación; tras el `204` se recargan
el préstamo y el historial, se muestra un aviso, `Delete` vuelve a estar
disponible y `Edit` pasa al formulario completo.

La edición vive en `src/client/views/EditLoan.jsx`. El hook `useEditLoanForm`
carga el préstamo, convierte la respuesta al estado del formulario con
`loanToFormState` y reutiliza `useLoanFormState`, por lo que comparte la
validación, carga de stakeholders y generación de vista previa con la creación.
Sin pagos, la vista reutiliza `CreateLoanForm` e `InstallmentPreview` con
etiquetas opcionales (`Preview changes`, `Save changes`, `Saving...`) y
`handleApprove` envía `api.put("/loans/:id", payload)` con todos los arreglos;
el backend recrea cuotas, fiadores y garantías y no se envían IDs de relaciones
hijas. Con pagos, `EditLockedAlert` explica las restricciones y
`RestrictedLoanEditForm` muestra solo fiadores, garantías y, para `admin`, el
prestamista. `buildRestrictedLoanPatchPayload` reutiliza `normalizeGuarantors` y
`normalizeCollaterals` de `loanForm.js`, valida que prestamista y cliente difieran
cuando corresponde y omite `lender_id` para cuentas `lender`. `handleApprove`
envía `api.patch("/loans/:id", payload)` y vuelve al detalle con
`state.updatedLoanId`.

## Convenciones

- Las vistas nuevas van en `src/client/views/` y se registran en
  `src/client/main.jsx`.
- Las vistas del panel van en `src/client/views/admin/` y el shell en
  `src/client/layouts/`.
- Los primitivos reutilizables van en `src/components/ui/` y los componentes
  compuestos por dominio en `src/components/<dominio>/`, agrupados por propósito
  cuando hay más de un flujo (por ejemplo, `loans/create/` y `loans/list/`).
- Los hooks de las vistas van en `src/client/hooks/`; usar el alias `@/` para
  importar desde `src/`.
- El estado de sesión vive en `src/client/contexts/`; consumirlo con
  `useAuth()` desde cualquier vista.
- Los helpers puros de dominio van en `src/client/utils/`, como
  `loanSchedule.js`, `loanForm.js`, `loanFormat.js`, `loanEdit.js`,
  `loanPayment.js`, `paymentHistory.js`, `userForm.js` y `stakeholderForm.js`.
- Los tokens de color se definen en `index.css`; evitar colores fijos en los
  componentes de UI.
- Todo cambio de comportamiento del frontend se documenta aquí y en
  `CHANGELOG.md`, siguiendo la skill `documentation`; si afecta al panel,
  también se actualiza el módulo `admin`.
