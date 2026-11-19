# Changelog — frontend

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
