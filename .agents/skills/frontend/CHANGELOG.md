# Changelog — frontend

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
