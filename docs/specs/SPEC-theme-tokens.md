# Spec: Theme Tokens (`theme-tokens`)

## Objective
Establish the new Figma green brand palette and updated design tokens across the application in `app/globals.css`. This ensures that all components, buttons, borders, tabs, and backgrounds seamlessly adopt the new visual language shown in the 20 Figma screens.

## Tech Stack
- Tailwind CSS v4 (`@import "tailwindcss";`, `@theme inline`)
- CSS Variables in `:root`

## Commands
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Test: `npm test`
- Dev: `npm run dev`

## Project Structure
- `app/globals.css` → Global design tokens, brand scale, neutral tokens, semantic variables, and utility classes

## Code Style & Conventions
Use semantic CSS variables for consistency:
```css
:root {
  /* Green Brand Palette from Figma */
  --brand-50: #F2F8F4;
  --brand-100: #E4F1E8;
  --brand-200: #C4E0CC;
  --brand-300: #9ECBA9;
  --brand-400: #74B184;
  --brand-500: #52946B;
  --brand-600: #427A56;
  --brand-700: #356246;
  --brand-800: #294D37;
  --brand-900: #203E2C;
  --brand-950: #122419;

  /* Card and Border Tokens */
  --radius-card: 16px;
  --radius-modal: 20px;
  --radius-pill: 9999px;
  --border-figma-green: #52946B;
}
```

## Testing Strategy
- Verification command: `npm run build` and `npm run typecheck`
- Visual inspection across all pages to ensure no color contrast regression.

## Boundaries
- **Always do**: Maintain WCAG AA contrast for text on green buttons and green card headers.
- **Ask first**: Adding new CSS preprocessors or utility libraries.
- **Never do**: Hardcode arbitrary hex values directly in component files when semantic variables exist.

## Success Criteria
1. `--brand-*` tokens in `app/globals.css` match the Figma green palette (`#52946B` primary).
2. Existing UI elements (buttons, links, badges, focus rings) adapt to the green theme without visual breakages.
3. Card corner radii and pill radii match the Figma specification.

## Open Questions
None.
