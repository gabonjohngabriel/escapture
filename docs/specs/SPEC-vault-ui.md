# Spec: Vault UI (`vault-ui`)

## Objective
Update the student Vault user interface (`app/(app)/vault/page.tsx` and `components/vault/`) to match Figma designs `11:159`, `21:142`, `32:5448`, `37:5857`, `37:5959`, `37:6063`, `32:124`, `32:282`, `37:5761`, `32:5399`, and `37:6041`.

## Tech Stack
- Next.js 16 (Server Components + Client interactive components)
- Tailwind CSS v4
- Lucide React (`Search`, `SlidersHorizontal`, `ChevronDown`, `StickyNote`, `MessageCircle`, `Folder`, `RefreshCcw`, `FileX`)

## Commands
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Test: `npm test`

## Project Structure
- `app/(app)/vault/page.tsx` → Page container, data fetching, view routing
- `components/vault/vault-toolbar.tsx` → Pill tabs ("My Evidences", "Shared with me"), search input, filter dropdown
- `components/vault/vault-cards-grid.tsx` → 2-column card grid rendering Evidence Cards (`32:124`, `32:282`)
- `components/vault/vault-card.tsx` → Individual Evidence Card with green header banner, metadata, and footer status tags
- `components/vault/vault-empty-state.tsx` → Empty vault (`37:5761`), empty shared (`32:5399`), and access revoked (`37:6041`) states

## Code Style & Conventions
```tsx
// Evidence Card Structure
<div className="rounded-2xl border-2 border-[#52946B] bg-white overflow-hidden shadow-sm flex flex-col">
  {/* Green Header Banner */}
  <div className="bg-[#52946B] text-white px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full border border-white/60 flex items-center justify-center font-bold">
        {/* Author Avatar or Initial */}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/80">Group</p>
        <h3 className="font-bold text-white text-base truncate">{groupOrAuthor}</h3>
      </div>
    </div>
    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
      <StickyNote size={14} />
      <span>{kind === "facebook_post" ? "Posts" : "Messages"}</span>
    </div>
  </div>
  {/* White Footer Details */}
  <div className="px-6 py-4 grid grid-cols-3 gap-4 text-xs text-[#203E2C]">
    <div>
      <p className="font-semibold text-muted">Captured</p>
      <p className="font-medium">{formatDate(capturedAt)}</p>
    </div>
    <div>
      <p className="font-semibold text-muted">In Reports</p>
      <p className="font-medium">{caseCount > 0 ? "In a report" : "Not in a report"}</p>
    </div>
    <div>
      <p className="font-semibold text-muted">Sharing</p>
      <p className="font-medium">{shared ? "Shared" : "Private"}</p>
    </div>
  </div>
</div>
```

## Testing Strategy
- Unit/component verification with Vitest.
- Visual check of "My Evidences" vs "Shared with me" tabs.
- Verification of all 3 empty states (`37:5761`, `32:5399`, `37:6041`).
- Verification of search & filter form submission.

## Boundaries
- **Always do**: Preserve full item click/detail navigation to `/vault/[id]`.
- **Ask first**: Removing any item metadata or tamper verification indicators.
- **Never do**: Drop pagination or query search handling.

## Success Criteria
1. Vault page header displays "Welcome back, User!" and "Only you can control what is shared within the university."
2. Toolbar renders "My Evidences [count]" and "Shared with me [count]" pill switcher.
3. Search bar and Filter dropdown match the Figma rounded-pill container styling.
4. Evidence items render in a responsive 2-column card grid (wide on collapsed sidebar, compact on expanded sidebar).
5. Empty Vault state displays green border container with Folder icon and actions: "Capture evidence" and "How to use the extension".
6. Empty Shared with me state displays "Nothing has been shared with you yet" with Refresh button and "Go to My Evidences" button.
7. Access Revoked state displays "This shared item is no longer available" with Refresh button and "Back to shared evidence" button.

## Open Questions
None.
