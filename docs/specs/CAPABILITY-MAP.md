# Capability Map: Figma UI Redesign

| Module ID | Responsibility | Depends On |
|---|---|---|
| `theme-tokens` | Green brand color palette, semantic tokens, card radius, border styles in `globals.css` | — |
| `app-shell` | Collapsible sidebar (86px collapsed / 364px hover-expanded), Escapture logo, nav links (Vault, Reports, Notifications), footer links | `theme-tokens` |
| `vault-ui` | Vault page with "My Evidences" & "Shared with me" pill tabs, search/filter toolbar, 2-column Evidence Cards (`32:124`, `32:282`), and 3 empty states (`37:5761`, `32:5399`, `37:6041`) | `theme-tokens`, `app-shell` |
| `reports-ui` | Reports page (formerly Cases) with "All Reports", "Drafts", "Archived" pill tabs, search/filter toolbar, 2-column Report Cards (`44:1290`, `44:1316`), and Create Report Modal (`44:1439`) with evidence picker | `theme-tokens`, `app-shell` |
| `notifications-ui` | Notifications page with pill tabs (All, Unread, Sharing, Reports), "Mark all as read" action, date headers, and notification item cards (`44:1820`) | `theme-tokens`, `app-shell` |

**Build Order**: `theme-tokens` → `app-shell` → `vault-ui` → `reports-ui` → `notifications-ui`
