# Implementation Plan: Figma UI Redesign (20 Designs)

## Overview
Implement the complete visual and interactive redesign across the Escapture student interface, matching all 20 designs from Figma (`5BoqUg1V9JVzw5VPsjUlMT`). This covers the green brand design tokens, the collapsible sidebar navigation in the app shell, the 2-column Evidence Card grid and empty states in the Vault, the rebranded Reports interface and Create Report modal, and the Notifications page redesign.

## Architecture Decisions
1. **Design Tokens**: Update existing `--brand-*` CSS variables in `app/globals.css` from the previous slate-blue to Figma green (`#52946B` as primary brand-500) so that existing UI components inherit the theme automatically while custom Figma components use precise token classes.
2. **Non-breaking Route Structure**: Keep `/cases` routes, API routes (`/api/cases`), and backend database schema intact, rebranding the user-facing labels to "Reports" in navigation, headings, tabs, and modals.
3. **Responsive Card Grid**: The Evidence and Report cards use a 2-column grid on desktop (`grid-cols-1 xl:grid-cols-2`), adapting cleanly whether the sidebar is collapsed (width 86px) or expanded (width 364px), collapsing to a single column on mobile.
4. **Interactive Create Report Modal**: Uses a client modal dialog matching node `44:1439` with title, optional description, evidence preview/picker, and privacy advisory box, submitting to `POST /api/cases` and linking selected captures.

## Task List

### Phase 1: Foundation (Theme Tokens)
- [ ] Task 1: Update global brand tokens, card radii, and border styles in `app/globals.css`

### Checkpoint 1: Foundation
- [ ] Build succeeds: `npm run build`
- [ ] Typecheck passes: `npm run typecheck`

### Phase 2: App Shell & Sidebar Navigation
- [ ] Task 2: Redesign sidebar navigation in `components/layout/app-shell.tsx` and `components/layout/logo.tsx` with collapsed (86px) and expanded (364px) hover/toggle states matching nodes `21:96`, `21:95`, `44:1208`, `44:2180`

### Checkpoint 2: App Shell
- [ ] Sidebar collapses to 86px with icons and green circular active indicator
- [ ] Sidebar expands to 364px on hover/toggle with "Escapture", "Your Space", nav items, and footer links

### Phase 3: Vault Interface
- [ ] Task 3: Create Evidence Card components (`components/vault/vault-card.tsx` and `components/vault/vault-cards-grid.tsx`) matching nodes `32:124` and `32:282`
- [ ] Task 4: Create Vault Empty State components (`components/vault/vault-empty-state.tsx`) matching nodes `37:5761` (Empty Vault), `32:5399` (Empty Shared), and `37:6041` (Access Revoked)
- [ ] Task 5: Update `components/vault/vault-toolbar.tsx` and `app/(app)/vault/page.tsx` to assemble the new Vault layout matching nodes `11:159`, `21:142`, `32:5448`, `37:5857`, `37:5959`, `37:6063`

### Checkpoint 3: Vault Interface
- [ ] Vault page renders cards in 2-column grid
- [ ] Tabs ("My Evidences", "Shared with me") filter items and update counts
- [ ] All 3 empty states display appropriately according to tab and permissions

### Phase 4: Reports Interface (formerly Cases)
- [ ] Task 6: Create Report Card components (`components/cases/report-card.tsx` and `components/cases/report-cards-grid.tsx`) matching nodes `44:1290` and `44:1316`
- [ ] Task 7: Create the "Create Report" modal (`components/cases/create-report-modal.tsx`) matching node `44:1439` with capture preview and picker
- [ ] Task 8: Update `app/(app)/cases/page.tsx` and toolbar to assemble the Reports view matching node `44:1090`

### Checkpoint 4: Reports Interface
- [ ] Header displays "Reports", tabs display "All Reports", "Drafts", "Archived"
- [ ] "+ Create Report" button opens modal and creates draft case with attached captures
- [ ] 2-column card grid renders existing reports with metrics

### Phase 5: Notifications Interface
- [ ] Task 9: Redesign `app/(app)/notifications/page.tsx` and `components/layout/notification-row.tsx` matching node `44:1820`

### Checkpoint 5: Notifications Interface
- [ ] Notifications render inside green-bordered cards with unread badges
- [ ] Tabs (All, Unread, Sharing, Reports) and "Mark all as read" work

### Phase 6: Final Verification & Polish
- [ ] Task 10: Run full build, typecheck, unit tests, and verify responsive behavior across all viewports

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Sidebar hover causing layout shift | High | Use fixed positioning with transition, adjusting main content margin dynamically |
| Broken reviewer/admin navigation | Medium | Preserve existing `NAV.reviewer` and `NAV.admin` configurations while styling the student navigation |
| Long titles clipping in cards | Low | Truncate gracefully with CSS ellipsis while keeping full title in HTML `title` tooltip |

## Open Questions
None.
