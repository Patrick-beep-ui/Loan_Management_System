---
name: design
description: Apply the Loan Management System design system whenever creating or modifying frontend views, pages, layouts, forms, tables, dialogs, or reusable UI components. Enforce the approved color palette, Playfair Display and Montserrat typography, and reuse shadcn/ui components in this React JavaScript project.
---

# Design

## Before implementation

1. Read `src/client/index.css`, `src/client/App.css`, and the relevant frontend documentation.
2. Locate and read the frontend `components.json` and `package.json`.
3. Inspect existing UI components and a related view to follow established patterns.
4. Reuse the current design tokens, layouts, component variants, and utilities.
5. Keep the project in JavaScript and JSX. Ensure `components.json` uses `"tsx": false` before adding components.

## Color palette

Use these approved colors and their assigned roles. Preserve the OKLCH token format.

| Hex | OKLCH | Role |
| --- | --- | --- |
| #263A69 | oklch(0.3574 0.0856 265.02) | Primary application color, primary actions, active navigation, and key emphasis |
| #B0C7DD | oklch(0.8195 0.0399 247.12) | Secondary actions related to the primary color |
| #E8E3DD | oklch(0.9181 0.0098 72.66) | Page backgrounds, cards, and subtle surfaces |
| #EDECEA | oklch(0.9433 0.0029 84.56) | Popovers, notifications, and popup message surfaces |
| #0F0F0F | oklch(0.1684 0 89.88) | Default text |

### Token usage

- Map primary actions to `--primary`.
- Map secondary actions to `--secondary`.
- Map backgrounds, cards, and subtle surfaces to the appropriate existing background, card, and muted tokens.
- Map popup surfaces to `--popover`. Explicitly apply the corresponding surface token to notifications when they do not inherit it.
- Map default text to `--foreground`, `--card-foreground`, `--popover-foreground`, and `--secondary-foreground` where appropriate.
- Use an approved light palette color for text on primary backgrounds, and verify contrast.
- Reuse semantic classes such as `bg-primary`, `text-primary-foreground`, `bg-secondary`, `bg-background`, `bg-card`, and `text-foreground`.
- Do not repeat raw hex or OKLCH values inside individual views.
- Derive hover, focus, selected, and disabled styles from existing tokens and variants.
- Preserve established destructive, error, warning, and success tokens. Use them only for their semantic purposes.
- Pair status colors with readable labels or icons.
- Do not introduce a new brand palette or change global colors for a single view.
- Preserve existing theme support without copying light-theme values into dark-theme tokens.

## Typography

Use Google Fonts:

- **Playfair Display:** page titles, section headings, card headings, and dialog titles.
- **Montserrat:** body text, navigation, buttons, labels, inputs, tables, notifications, helper text, and financial values.

### Font setup

- Check whether the fonts are already loaded before adding an import.
- Load both families once through the existing global font-loading mechanism.
- If absent, use Google Fonts with `display=swap` and the weights required by the interface.
- Keep font definitions centralized in the frontend styles.
- Use or establish semantic font tokens:
  - `--font-heading: "Playfair Display", serif`
  - `--font-sans: "Montserrat", sans-serif`
- Apply Montserrat to the application body and form controls.
- Apply Playfair Display to `h1`–`h6` and heading components that do not render heading elements.
- Inspect shadcn title components rather than assuming they use heading tags.
- Reuse existing typography utilities. If absent, add a reusable heading utility using the project's current Tailwind configuration.
- Keep currency, balances, dates, and table content in Montserrat. Use tabular numerals where helpful.
- Avoid inline font declarations repeated across views.

## shadcn/ui components

1. Search the configured UI directory before creating a component.
2. Reuse installed shadcn components and their existing variants.
3. Compose existing components into domain-specific UI for loans, customers, payments, and reports.
4. If a required component is missing, add it from the frontend package directory containing the relevant `components.json`:

   ```bash
   pnpm dlx shadcn@latest add <component>
   ```

   For example:

   ```bash
   pnpm dlx shadcn@latest add dialog select table
   ```

5. Install only the components needed for the task.
6. Inspect generated files and imports, and confirm that the output uses JavaScript/JSX.
7. Preserve the approved palette and typography if generated styles introduce defaults.
8. Review overwrite prompts and retain existing component customizations.
9. Use the project's configured import aliases.
10. Preserve pnpm as the package manager and update its lockfile when dependencies change.

Prefer shadcn primitives for buttons, inputs, labels, cards, tables, dialogs, selects, menus, tooltips, and related interactions. Create custom components when the business interface requires composition beyond those primitives.

## View implementation

- Follow the existing application shell, spacing, border radii, and navigation patterns.
- Establish a clear page title, primary action, and content hierarchy.
- Use primary styling for the main action and secondary or outline variants for supporting actions.
- Keep layouts responsive and forms usable on small screens.
- Handle loading, empty, error, and success states when relevant.
- Provide visible labels, keyboard access, and visible focus states.
- Associate validation messages with their fields.
- Keep financial values aligned and consistently formatted using the project's existing conventions.
- Avoid decorative additions that compete with operational information.
- Keep shared styling in `src/client/index.css` and `src/client/App.css`, following their existing responsibilities.
- Update relevant frontend documentation when introducing or changing shared design rules or reusable patterns.

## Verification

Before completing a frontend task:

- Confirm that all colors use the approved semantic tokens.
- Confirm that headings use Playfair Display and other text uses Montserrat.
- Confirm that existing shadcn components were reused where appropriate.
- Confirm that any added components were installed with pnpm and generated as JavaScript/JSX.
- Check responsive behavior, text contrast, focus visibility, and applicable UI states.
- Run the relevant frontend checks available in `package.json`.
- Inspect the rendered result when a browser or preview is available.
- Report any verification that could not be performed.