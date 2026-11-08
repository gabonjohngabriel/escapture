# Spec: App Shell & Sidebar (`app-shell`)

## Objective
Implement the collapsible/expandable sidebar navigation in `components/layout/app-shell.tsx` and `components/layout/logo.tsx` matching Figma nodes `21:96` (collapsed default state, width 86px) and `21:95`, `44:1208`, `44:2180` (expanded on hover or toggle, width 364px).

## Tech Stack
- Next.js 16 (App Router, Client Component for interactive sidebar)
- Lucide React (`LockKeyhole`, `FolderOpen`, `Bell`)
- Tailwind CSS v4

## Commands
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Test: `npm test`

## Project Structure
- `components/layout/app-shell.tsx` → Layout wrapper, responsive sidebar, navigation menu
- `components/layout/logo.tsx` → Fingerprint shield brand logo

## Code Style & Conventions
```tsx
// Collapsed state: w-[86px]
// Hover / Expanded state: w-[364px] transition-all duration-300 ease-in-out
<aside
  className={cn(
    "fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-[#E5EBE7] transition-all duration-300",
    expanded ? "w-[364px] shadow-lg" : "w-[86px]"
  )}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  {/* Logo, Navigation items (Vault, Reports, Notifications), Footer links */}
</aside>
```

## Testing Strategy
- Verify smooth expansion and collapse on desktop viewport (>= 1024px).
- Verify navigation active states for `/vault`, `/cases` (Reports), and `/notifications`.
- Mobile drawer navigation preserved for viewports < 1024px.

## Boundaries
- **Always do**: Preserve full keyboard navigability (`Tab`, `Enter`) and accessible ARIA attributes (`aria-expanded`, `aria-current="page"`).
- **Ask first**: Altering role-based navigation logic for reviewers/administrators.
- **Never do**: Break routing links or session menus.

## Success Criteria
1. Sidebar renders at 86px width in default state with centered icons (LockKeyhole, FolderOpen, Bell).
2. Active navigation item renders a circular green background (`#52946B`) in collapsed mode and a full green pill in expanded mode.
3. Sidebar expands smoothly to 364px on hover or expand toggle, showing "Escapture" title, "Your Space" category heading, full labels ("Vault", "Reports", "Notifications"), and bottom links ("Privacy Notice", "Terms of Service").
4. Fits cleanly alongside the main content area without layout overflow or content clipping.

## Open Questions
None.
