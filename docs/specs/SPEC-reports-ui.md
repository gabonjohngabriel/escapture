# Spec: Reports UI (`reports-ui`)

## Objective
Update the student Cases/Reports interface (`app/(app)/cases/page.tsx` and `components/cases/`) to match Figma designs `44:1090`, `44:1439`, `44:1290`, and `44:1316`, including rebranding UI labels from "Cases" to "Reports", rendering the 2-column Report Card grid, and implementing the "Create Report" modal with evidence preview/selection.

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS v4
- Lucide React (`Plus`, `Search`, `SlidersHorizontal`, `StickyNote`, `MessageCircle`, `Lock`, `X`)

## Commands
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Test: `npm test`

## Project Structure
- `app/(app)/cases/page.tsx` → Page container, header "Reports", tab filtering
- `components/cases/report-toolbar.tsx` → Pill tabs ("All Reports", "Drafts", "Archived"), search & filter bar, "+ Create Report" button
- `components/cases/report-cards-grid.tsx` → 2-column grid of Report Cards (`44:1290`, `44:1316`)
- `components/cases/report-card.tsx` → Individual Report Card with green header banner, kind badge, and footer statistics (Updated, Evidences count, Sharing status)
- `components/cases/create-report-modal.tsx` → Modal dialog matching node `44:1439` with title, description, evidence selector with visual preview, and privacy notice

## Code Style & Conventions
```tsx
// Report Card Structure
<div className="rounded-2xl border-2 border-[#52946B] bg-white overflow-hidden shadow-sm flex flex-col">
  <div className="bg-[#52946B] text-white px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full border border-white/60 flex items-center justify-center font-bold">
        {/* Author / Case Icon */}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/80">Group</p>
        <h3 className="font-bold text-white text-base truncate">{reportTitle}</h3>
      </div>
    </div>
    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
      <StickyNote size={14} />
      <span>Posts</span>
    </div>
  </div>
  <div className="px-6 py-4 grid grid-cols-3 gap-4 text-xs text-[#203E2C]">
    <div>
      <p className="font-semibold text-muted">Updated</p>
      <p className="font-medium">{formatDate(updatedAt)}</p>
    </div>
    <div>
      <p className="font-semibold text-muted">Evidences</p>
      <p className="font-medium">{evidenceCount} captures</p>
    </div>
    <div>
      <p className="font-semibold text-muted">Sharing</p>
      <p className="font-medium">{collaboratorCount > 0 ? `${collaboratorCount} person` : "Private"}</p>
    </div>
  </div>
</div>
```

## Testing Strategy
- Verify case creation via the modal correctly submits to `POST /api/cases` and optionally attaches selected evidence via `POST /api/cases/:id/evidence`.
- Verify tab filtering for "All Reports", "Drafts", "Archived".
- Verify navigation to `/cases/[id]`.

## Boundaries
- **Always do**: Keep the underlying `/cases` routes and API endpoints intact.
- **Ask first**: Changing the database schema for cases.
- **Never do**: Break existing case collaboration or sharing features.

## Success Criteria
1. Header displays "Reports" and subtitle "Organize captured evidence. Share only when you choose."
2. Primary action button is "+ Create Report" in brand green pill style.
3. Tabs render as pill badges: "All Reports [count]", "Drafts [count]", "Archived [count]".
4. Reports are displayed in a responsive 2-column card grid matching nodes `44:1290` and `44:1316`.
5. "Create Report Modal" opens with:
   - "Report title *" and "Description (optional)" fields
   - "Captured evidence *" section showing selected captures with visual preview and "+ Choose more evidence"
   - Green privacy advisory banner with lock icon
   - "Cancel" and "+ Create Report" actions.

## Open Questions
None.
