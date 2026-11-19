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
| `/loans` | `Loan` | `src/client/views/Loans.jsx` |
| `/create-loan` | `CreateLoan` | `src/client/views/CreateLoan.jsx` |

Las tres vistas son todavía placeholders: solo renderizan un `section` con un
título. No consumen la API ni almacenan el JWT; la integración con
`/api/auth`, `/api/loans` y `/api/payments` queda para otro cambio. `App.jsx`
sigue siendo el contador de ejemplo generado por Vite.

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
  `@fontsource-variable/geist` (tipografía), `tailwindcss`, `@tailwindcss/vite`
  y `tw-animate-css`. `react-router-dom` provee el enrutamiento. La instalación
  de la CLI añadió también `shadcn` e `install` como dependencias; el código
  actual no las utiliza.

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

`src/client/index.css` importa `tailwindcss`, `tw-animate-css`,
`shadcn/tailwind.css` y la fuente Geist; declara `@custom-variant dark`,
variables de color para tema claro y oscuro (`background`, `foreground`,
`card`, `primary`, `muted`, `destructive`, `border`, `sidebar`, `chart-*`, etc.)
y un bloque `@theme inline` que las expone como utilidades (`--color-*`,
`--font-sans`, `--radius-*`). El bloque `@layer base` aplica `border-border`,
`outline-ring/50`, `bg-background`, `text-foreground` y `font-sans` a los
elementos base.

## Convenciones

- Las vistas nuevas van en `src/client/views/` y se registran en
  `src/client/main.jsx`.
- Los componentes reutilizables van en `src/components/ui/`; usar el alias `@/`
  para importar desde `src/`.
- Los tokens de color se definen en `index.css`; evitar colores fijos en los
  componentes de UI.
- Todo cambio de comportamiento del frontend se documenta aquí y en
  `CHANGELOG.md`, siguiendo la skill `documentation`.
