# Spec: Notifications UI (`notifications-ui`)

## Objective
Update the Notifications interface (`app/(app)/notifications/page.tsx` and related components) to match Figma design node `44:1820`, with pill tabs ("All", "Unread", "Sharing", "Reports"), "Mark all as read" button, date sectioning, and green-bordered notification cards with unread badges.

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS v4
- Lucide React (`CheckCheck`, `Search`, `SlidersHorizontal`, `ArrowRight`, `LockKeyhole`, `Users`, `FolderOpen`)

## Commands
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Test: `npm test`

## Project Structure
- `app/(app)/notifications/page.tsx` → Page container, header, search & tabs
- `components/layout/notification-row.tsx` → Individual notification card matching node `44:1820`
- `components/layout/notification-actions.tsx` → "Mark all as read" action handler

## Code Style & Conventions
```tsx
// Notification Card Structure (Node 44:1820)
<div className="rounded-2xl border-2 border-[#52946B] bg-white p-5 flex items-center justify-between gap-4">
  <div className="flex items-center gap-4">
    <div className="size-12 rounded-full bg-[#EBF4EE] text-[#52946B] flex items-center justify-center shrink-0">
      <Users size={22} />
    </div>
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-[#203E2C] text-base">{title}</h3>
        {unread && (
          <span className="text-xs font-semibold text-[#D97706] flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#D97706]" />
            Unread
          </span>
        )}
      </div>
      <p className="text-sm text-muted">{description}</p>
    </div>
  </div>
  <div className="flex flex-col items-end gap-2 shrink-0">
    <span className="text-xs text-muted font-medium">{timeAgo}</span>
    <Link href={targetHref} className="text-xs font-bold text-[#52946B] hover:underline flex items-center gap-1">
      View shared evidence <ArrowRight size={14} />
    </Link>
  </div>
</div>
```

## Testing Strategy
- Verify notification tab filtering (All, Unread, Sharing, Reports).
- Verify "Mark all as read" updates state.
- Verify click on "View shared evidence" navigates to the target evidence item.

## Boundaries
- **Always do**: Preserve the underlying notification service and API endpoints.
- **Ask first**: Changing notification types or notification storage schema.
- **Never do**: Remove accessibility aria tags on notifications.

## Success Criteria
1. Header displays "Notifications" and subtitle "Keep track of your evidence, reports, and sharing updates."
2. "Mark all as read" button displayed on the right with `CheckCheck` icon.
3. Tabs render as pill badges: "All [count]", "Unread [count]", "Sharing [count]", "Reports [count]".
4. Section heading displays "Today · [Current Date]".
5. Notification cards render inside rounded-2xl containers with green border, circular icon, unread indicator, timestamp, and "View shared evidence ->" link.

## Open Questions
None.
