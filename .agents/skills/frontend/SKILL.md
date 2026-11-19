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
  `tailwindcss`, `@tailwindcss/vite` y `tw-animate-css`. `react-router-dom`
  provee el enrutamiento. La instalación de la CLI añadió también `shadcn` e
  `install` como dependencias; el código actual no las utiliza.

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

## Convenciones

- Las vistas nuevas van en `src/client/views/` y se registran en
  `src/client/main.jsx`.
- Los componentes reutilizables van en `src/components/ui/`; usar el alias `@/`
  para importar desde `src/`.
- Los tokens de color se definen en `index.css`; evitar colores fijos en los
  componentes de UI.
- Todo cambio de comportamiento del frontend se documenta aquí y en
  `CHANGELOG.md`, siguiendo la skill `documentation`.
