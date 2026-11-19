# Changelog — frontend

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
