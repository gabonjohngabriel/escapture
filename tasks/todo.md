# Task List: Figma UI Redesign

- [x] Task 1: Update theme tokens and color scale in `app/globals.css`
  - Acceptance: Green brand scale (`--brand-50` to `--brand-950`), `--radius-card: 16px`, `--radius-modal: 20px`, and `--border-figma-green: #52946B` configured.
  - Verify: `npm run build` and `npm run typecheck` pass.
  - Files: `app/globals.css`

- [x] Task 2: Redesign sidebar navigation in `components/layout/app-shell.tsx` and `components/layout/logo.tsx`
  - Acceptance: Collapsed default (86px) with circular green active indicator; hover/toggle expanded (364px) with "Escapture", "Your Space", "Vault", "Reports", "Notifications", and bottom links ("Privacy Notice", "Terms of Service") matching nodes `21:96`, `21:95`, `44:1208`, `44:2180`.
  - Verify: Sidebar transitions cleanly between states on desktop; mobile drawer functions on small screens.
  - Files: `components/layout/app-shell.tsx`, `components/layout/logo.tsx`

- [x] Checkpoint: Foundation & Navigation
  - Verify: `npm run build` and `npm run typecheck` pass; sidebar navigation works on all student routes.

- [x] Task 3: Create Evidence Card components (`components/vault/vault-card.tsx` and `components/vault/vault-cards-grid.tsx`)
  - Acceptance: Cards match nodes `32:124` and `32:282` with green header banner, author avatar/initial, group title, kind badge ("Posts" / "Messages"), captured date, in reports status, and sharing badge.
  - Verify: Cards render in 2-column responsive layout without visual overflow.
  - Files: `components/vault/vault-card.tsx`, `components/vault/vault-cards-grid.tsx`

- [x] Task 4: Create Vault Empty State components (`components/vault/vault-empty-state.tsx`)
  - Acceptance: Implements 3 variants matching nodes `37:5761` (Empty Vault with "Capture evidence" and "How to use the extension"), `32:5399` (Empty Shared with me with "Go to My Evidences" and refresh icon), and `37:6041` (Access Revoked with "Back to shared evidence" and refresh icon).
  - Verify: All 3 variants render with matching icons, text, and action buttons.
  - Files: `components/vault/vault-empty-state.tsx`

- [x] Task 5: Assemble new Vault Page (`app/(app)/vault/page.tsx` & `components/vault/vault-toolbar.tsx`)
  - Acceptance: Matches nodes `11:159`, `21:142`, `32:5448`, `37:5857`, `37:5959`, `37:6063` with header "Welcome back, User!", pill tabs ("My Evidences", "Shared with me"), search/filter controls, and card grid / empty state rendering.
  - Verify: Navigating between tabs, searching, and filtering works smoothly.
  - Files: `app/(app)/vault/page.tsx`, `components/vault/vault-toolbar.tsx`

- [x] Checkpoint: Vault Interface
  - Verify: `npm run build` and `npm run typecheck` pass; Vault page functions end-to-end.

- [x] Task 6: Create Report Card components (`components/cases/report-card.tsx` & `components/cases/report-cards-grid.tsx`)
  - Acceptance: Cards match nodes `44:1290` and `44:1316` with green header banner, group title, kind badge, and footer metrics (Updated date, Evidences count, Sharing status).
  - Verify: Cards link to `/cases/[id]` and display correct counts.
  - Files: `components/cases/report-card.tsx`, `components/cases/report-cards-grid.tsx`

- [x] Task 7: Create "Create Report" modal (`components/cases/create-report-modal.tsx`)
  - Acceptance: Matches node `44:1439` with report title input, optional description, captured evidence selector with visual preview and "+ Choose more evidence", green lock privacy notice, and cancel/create actions.
  - Verify: Successfully creates draft case via API and attaches selected captures.
  - Files: `components/cases/create-report-modal.tsx`, `components/cases/case-actions.tsx`

- [x] Task 8: Assemble rebranded Reports Page (`app/(app)/cases/page.tsx`)
  - Acceptance: Matches node `44:1090` with header "Reports", subtitle "Organize captured evidence. Share only when you choose.", "+ Create Report" button, pill tabs ("All Reports", "Drafts", "Archived"), and 2-column card grid.
  - Verify: Tab filtering for drafts/archived works and links to case details.
  - Files: `app/(app)/cases/page.tsx`

- [x] Checkpoint: Reports Interface
  - Verify: `npm run build` and `npm run typecheck` pass; Reports creation and viewing works end-to-end.

- [x] Task 9: Redesign Notifications Page (`app/(app)/notifications/page.tsx` & `components/layout/notification-row.tsx`)
  - Acceptance: Matches node `44:1820` with header "Notifications", "Mark all as read" button, pill tabs (All, Unread, Sharing, Reports), date sectioning ("Today · [Date]"), and green-bordered cards with unread badges.
  - Verify: Tabs filter notifications and "Mark all as read" works.
  - Files: `app/(app)/notifications/page.tsx`, `components/layout/notification-row.tsx`

- [x] Task 10: Final integration, verification, and regression tests
  - Acceptance: Entire application builds cleanly with `npm run build`, passes `npm run typecheck`, and unit tests pass with `npm test`.
  - Verify: Desktop and mobile responsiveness verified across all routes.
  - Files: All modified components
