---
name: frontend
description: Frontend React con Vite: entrada, rutas, componentes de UI, estilos y alias de rutas.
---

# Frontend

La interfaz vive en `src/client/` y usa React 19 con Vite 6. Los componentes
compartidos están en `src/components/ui/` y las utilidades en `src/lib/`.
El historial de cambios de este módulo está en [`CHANGELOG.md`](CHANGELOG.md).

## Entrada y rutas

`src/client/main.jsx` crea el router con `createBrowserRouter` y monta
`RouterProvider` dentro de `React.StrictMode`. Las rutas definidas hoy son:

| Ruta | Vista | Archivo |
| --- | --- | --- |
| `/` | `App` (demo inicial de Vite) | `src/client/App.jsx` |
| `/login` | `Login` | `src/client/views/Login.jsx` |
| `/signup` | `Signup` | `src/client/views/Signup.jsx` |
| `/loans` | `Loan` | `src/client/views/Loans.jsx` |
| `/create-loan` | `CreateLoan` | `src/client/views/CreateLoan.jsx` |
| `/test` | `Test` (vista de prueba) | `src/client/Test.jsx` |

`Login` y `Signup` consumen `/api/auth` a través del servicio compartido
`src/lib/axiosService.js` (`api.post`): validan los campos, desactivan el botón
mientras envían y muestran `error.response?.data?.error` o un mensaje de red en
una región `role="alert"` con tokens `destructive`. `Login` guarda el JWT en
`localStorage` bajo la clave `token` y navega a `/loans`. `Signup` envía
`email`, `password` y `stakeholder_id` como entero positivo y, tras el `201`,
navega a `/login` con un estado que muestra un aviso de registro correcto.
`Loan` consume `/api/loans` con `api.get("/loans")` y muestra un listado en
tabla con ID, prestamista, cliente, monto, tasa, modo, fecha de desembolso y
total a pagar; incluye estados de carga, vacío y error con reintento, y ante un
`401` elimina el token y vuelve a `/login`. `CreateLoan` sigue siendo
placeholder y no consume `/api/payments`. `App.jsx` continúa siendo el contador
de ejemplo de Vite. La
ruta `/test` usa `api.get("/roles")`; esa ruta del servidor está actualmente
deshabilitada en `src/server/api.js`, por lo que no forma parte del flujo de
autenticación.

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
  `Signup` y `Test.jsx` importan esa instancia en lugar de crear clientes
  propios.

## Componentes de UI

`src/components/ui/` contiene los componentes generados con shadcn:

| Archivo | Componentes exportados | Primitivo |
| --- | --- | --- |
| `button.jsx` | `Button`, `buttonVariants` | `Button` de `@base-ui/react/button` |
| `card.jsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | elementos `div` |
| `dialog.jsx` | `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | `Dialog` de `@base-ui/react/dialog` |
| `input.jsx` | `Input` | `Input` de `@base-ui/react/input` |
| `label.jsx` | `Label` | elemento `label` |
| `table.jsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | etiquetas HTML de tabla |

Los componentes con estilos combinan `className` mediante `cn`. Hoy importan
`cn` directamente del paquete `cn`; `src/lib/utils.js` también lo reexporta y es
el alias declarado en `components.json`, pero los componentes aún no lo usan.
Conviene tenerlo presente al agregar componentes nuevos.

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
(`api.post("/auth/login")`, `api.get("/roles")`) y no necesitan construir el
header ni repetir el prefijo `/api`.

## Autenticación en el cliente

- Las peticiones a `/auth/login` y `/auth/signup` usan `api.post` del servicio
  compartido; la URL final se resuelve con el `baseURL` configurado.
- El JWT se guarda en `localStorage` con la clave `token` y el interceptor lo
  adjunta como `Authorization: Bearer <token>` a todas las peticiones, incluso
  a las públicas cuando ya hay una sesión. Ese es el mecanismo que exige
  `checkAuth`.
- Los errores se leen de `error.response?.data?.error`; si no hay respuesta se
  muestra un mensaje genérico. Ambos casos usan una región `role="alert"` con
  `text-destructive` y `bg-destructive/10`.
- Las dos vistas comparten la misma composición: `Card`, `CardHeader`,
  `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Label`, `Input`
  y `Button`, sin colores fijos.

## Listado de préstamos

`src/client/views/Loans.jsx` usa `api.get("/loans")` y renderiza los resultados
con los componentes `Table*`. Las columnas son ID, prestamista, cliente, monto,
tasa, modo, fecha de desembolso y total a pagar. Los importes se formatean con
dos decimales y separador de miles, la tasa con hasta cuatro decimales y `%`, y
la fecha como `YYYY-MM-DD`; los valores ausentes se muestran como `—`. Un `401`
borra `token` y redirige a `/login`.

## Convenciones

- Las vistas nuevas van en `src/client/views/` y se registran en
  `src/client/main.jsx`.
- Los componentes reutilizables van en `src/components/ui/`; usar el alias `@/`
  para importar desde `src/`.
- Los tokens de color se definen en `index.css`; evitar colores fijos en los
  componentes de UI.
- Todo cambio de comportamiento del frontend se documenta aquí y en
  `CHANGELOG.md`, siguiendo la skill `documentation`.
