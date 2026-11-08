"use client";

import {
    Archive,
    Bell,
    ChevronDown,
    Columns3,
    FolderOpen,
    Inbox,
    KeyRound,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Menu as MenuIcon,
    PanelLeftClose,
    PanelLeftOpen,
    Tags,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { Menu } from "@/components/ui/menu";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import { Logo } from "./logo";
import { NotificationPopover } from "./notification-popover";
import {
    PrivacyBlurProvider,
    PrivacyBlurToggle,
} from "@/components/layout/privacy-blur";

type Role = "student" | "reviewer" | "admin";
type NavItem = {
    href: string;
    label: string;
    Icon: typeof Bell;
    match: (p: string) => boolean;
};

const REVIEW_NAV: NavItem[] = [
    {
        href: "/review",
        label: "Dashboard",
        Icon: LayoutDashboard,
        match: (p) => p === "/review",
    },
    {
        href: "/review/board",
        label: "Review Board",
        Icon: Columns3,
        match: (p) =>
            p.startsWith("/vault") ||
            (p.startsWith("/review/") &&
                !p.startsWith("/review/archives") &&
                !p.startsWith("/review/shared")),
    },
    {
        href: "/review/shared",
        label: "Shared With Me",
        Icon: Inbox,
        match: (p) => p.startsWith("/review/shared"),
    },
    {
        href: "/review/archives",
        label: "Case Archives",
        Icon: Archive,
        match: (p) => p.startsWith("/review/archives"),
    },
];

const NAV: Record<Role, NavItem[]> = {
    student: [
        {
            href: "/vault",
            label: "Vault",
            Icon: LockKeyhole,
            match: (p) => p.startsWith("/vault"),
        },
        {
            href: "/cases",
            label: "Reports",
            Icon: FolderOpen,
            match: (p) => p.startsWith("/cases"),
        },
    ],
    reviewer: REVIEW_NAV,
    admin: [
        ...REVIEW_NAV,
        {
            href: "/admin/reviewers",
            label: "Reviewer Accounts",
            Icon: Users,
            match: (p) => p.startsWith("/admin/reviewers"),
        },
        {
            href: "/admin/word-bank",
            label: "Word Bank",
            Icon: Tags,
            match: (p) => p.startsWith("/admin/word-bank"),
        },
    ],
};

const ROLE: Record<Role, { label: string; group: string }> = {
    student: {
        label: "Student",
        group: "Your Space",
    },
    reviewer: {
        label: "Case reviewer",
        group: "Review Cases",
    },
    admin: {
        label: "Administrator",
        group: "Manage Your Platform",
    },
};

type Crumb = { path: string; title: string; section?: string; sensitive?: boolean };
const CrumbContext = createContext<(crumb: Crumb) => void>(() => {});

export function PageCrumbs({
    title,
    section,
    sensitive,
}: {
    title: string;
    section?: string;
    sensitive?: boolean;
}) {
    const set = useContext(CrumbContext);
    const path = usePathname();
    useEffect(
        () => set({ path, title, section, sensitive }),
        [set, path, title, section, sensitive],
    );
    return null;
}

const iconButton =
    "relative grid size-10 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-brand-50 hover:text-brand-800";

const sidebarListeners = new Set<() => void>();
function subscribeSidebar(callback: () => void) {
    sidebarListeners.add(callback);
    return () => {
        sidebarListeners.delete(callback);
    };
}
function getSidebarCollapsed() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("escapture:sidebar-collapsed") === "true";
}
function getServerSidebarCollapsed() {
    return false;
}

export function AppShell({
    user,
    unread,
    counts = {},
    initialBlur = false,
    children,
}: {
    user: { name: string; email: string; role: Role };
    unread: number;
    counts?: Record<string, number>;
    initialBlur?: boolean;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const role = ROLE[user.role];
    const items: NavItem[] = [
        ...NAV[user.role],
        {
            href: "/notifications",
            label: "Notifications",
            Icon: Bell,
            match: (p) => p.startsWith("/notifications"),
        },
    ];
    const home = items[0].href;
    const [crumb, setCrumb] = useState<Crumb | null>(null);
    const mine = crumb && crumb.path === pathname ? crumb : null;
    const section =
        items.find((item) => item.href === mine?.section) ??
        items.find((item) => item.match(pathname)) ??
        items[0];

    const collapsed = useSyncExternalStore(
        subscribeSidebar,
        getSidebarCollapsed,
        getServerSidebarCollapsed,
    );
    const [menuOpen, setMenuOpen] = useState(false);
    const drawer = useRef<HTMLDialogElement>(null);

    function toggleCollapsed() {
        const next = !getSidebarCollapsed();
        localStorage.setItem("escapture:sidebar-collapsed", String(next));
        sidebarListeners.forEach((l) => l());
    }

    async function signOut() {
        await api("/api/auth/sign-out", { body: {} }).catch(() => {});
        router.push("/sign-in");
        router.refresh();
    }

    useEffect(() => {
        const d = drawer.current;
        if (!d) return;
        if (menuOpen && !d.open) d.showModal();
        if (!menuOpen && d.open) d.close();
    }, [menuOpen]);

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 1024px)");
        const onChange = () => wide.matches && setMenuOpen(false);
        wide.addEventListener("change", onChange);
        return () => wide.removeEventListener("change", onChange);
    }, []);

    return (
        <PrivacyBlurProvider initialBlur={initialBlur}>
            <div
                data-density={
                    user.role === "student" ? "comfortable" : "compact"
                }
                className="app-shell min-h-screen bg-canvas">
                {/* Desktop Collapsible Sidebar */}
                <aside
                    aria-label="Sidebar"
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 hidden flex-col justify-between border-r border-border bg-card transition-all duration-200 ease-out lg:flex overflow-visible",
                        collapsed
                            ? "w-[86px] px-3 py-6"
                            : "w-[294px] px-4 py-6",
                    )}>
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div
                            className={cn(
                                "flex h-12 items-center justify-between",
                                collapsed && "group relative",
                            )}>
                            <Link
                                href={home}
                                className={cn(
                                    "flex items-center overflow-hidden rounded-md transition-opacity duration-200",
                                    collapsed &&
                                        "group-hover:opacity-0 group-focus-within:opacity-0",
                                )}
                                title="Escapture">
                                <Logo
                                    size={36}
                                    withName={!collapsed}
                                    animateName={true}
                                    nameClassName="text-[22px] font-bold text-brand-500 ml-1"
                                />
                            </Link>
                            {!collapsed && (
                                <button
                                    type="button"
                                    onClick={toggleCollapsed}
                                    aria-label="Collapse sidebar"
                                    title="Collapse sidebar"
                                    className="flex size-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-brand-700">
                                    <PanelLeftClose
                                        size={18}
                                        strokeWidth={2}
                                        aria-hidden
                                    />
                                </button>
                            )}
                            {collapsed && (
                                <button
                                    type="button"
                                    onClick={toggleCollapsed}
                                    aria-label="Open sidebar"
                                    title="Open sidebar"
                                    className="absolute inset-0 z-10 flex items-center justify-center rounded-xl text-muted opacity-0 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-brand-700">
                                    <PanelLeftOpen
                                        size={18}
                                        strokeWidth={2}
                                        aria-hidden
                                    />
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute top-1/2 left-full z-50 ml-8 -translate-y-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1.5 text-sm font-medium text-ink opacity-0 shadow-raised transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                                        Open sidebar
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Navigation Section */}
                        <nav aria-label="Main" className="mt-1">
                            {!collapsed && (
                                <p className="mb-4 px-3 text-xs font-semibold text-muted">
                                    {role.group}
                                </p>
                            )}
                            <ul className="flex flex-col gap-1.5">
                                {items.map(({ href, label, Icon }) => {
                                    const active = href === section.href;
                                    const showDot =
                                        href === "/notifications" && unread > 0;
                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                aria-current={
                                                    active ? "page" : undefined
                                                }
                                                className={cn(
                                                    "group relative flex h-14 w-full items-center rounded-full transition-colors duration-150 select-none",
                                                    collapsed
                                                        ? "justify-center px-0"
                                                        : "px-4 gap-2",
                                                    active
                                                        ? "bg-brand-500 text-white shadow-xs"
                                                        : "text-brand-500 hover:bg-brand-50 hover:text-brand-800",
                                                )}
                                                title={label}>
                                                <div className="flex size-8 shrink-0 items-center justify-center">
                                                    <Icon
                                                        size={20}
                                                        strokeWidth={2}
                                                        aria-hidden
                                                        className={cn(
                                                            "shrink-0",
                                                            active
                                                                ? "text-white"
                                                                : "text-brand-700 group-hover:text-brand-800",
                                                        )}
                                                    />
                                                    {collapsed && (
                                                        <span
                                                            aria-hidden
                                                            className="pointer-events-none absolute top-1/2 left-full z-50 ml-8 -translate-y-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1.5 text-sm font-medium text-ink opacity-0 shadow-raised transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                                                            {label}
                                                        </span>
                                                    )}
                                                </div>
                                                {!collapsed && (
                                                    <span className="truncate text-[18px] font-semibold leading-none">
                                                        {label}
                                                    </span>
                                                )}
                                                {!collapsed &&
                                                    counts[href] !==
                                                        undefined && (
                                                        <span
                                                            className={cn(
                                                                "tnum ml-auto rounded-full px-2 py-0.5 text-xs font-bold text-[16px]",
                                                                active
                                                                    ? "text-white"
                                                                    : "text-brand-500 group-hover:text-brand-800",
                                                            )}>
                                                            {counts[href]}
                                                        </span>
                                                    )}
                                                {showDot && (
                                                    <span
                                                        className={cn(
                                                            "size-2.5 rounded-full bg-escalated-solid",
                                                            collapsed
                                                                ? "absolute top-2.5 right-2.5"
                                                                : "ml-auto mr-1",
                                                        )}
                                                        aria-hidden
                                                    />
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>

                    {/* Footer Links */}
                    <div className="border-t border-border pt-4">
                        {!collapsed ? (
                            <div className="flex flex-col gap-2 px-2 text-xs text-muted">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/privacy"
                                        className="transition-colors hover:text-brand-700 hover:underline">
                                        Privacy
                                    </Link>
                                    <span>·</span>
                                    <Link
                                        href="/terms"
                                        className="transition-colors hover:text-brand-700 hover:underline">
                                        Terms
                                    </Link>
                                    <span>·</span>
                                    <Link
                                        href="/contact"
                                        className="transition-colors hover:text-brand-700 hover:underline">
                                        Contact
                                    </Link>
                                </div>
                                <p className="text-[11px] text-muted">
                                    Escapture for BulSU
                                </p>
                            </div>
                        ) : (
                            <div className="flex justify-center text-[11px] font-bold text-muted">
                                v0.1
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile Drawer */}
                <dialog
                    ref={drawer}
                    aria-label="Menu"
                    onClose={() => setMenuOpen(false)}
                    onClick={(e) =>
                        e.target === e.currentTarget && setMenuOpen(false)
                    }
                    className="drawer m-0 h-full max-h-none w-[min(320px,calc(100%-48px))] max-w-none border-r border-border bg-card p-0 text-ink shadow-modal">
                    {menuOpen && (
                        <div className="flex h-full flex-col justify-between p-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <Logo size={36} />
                                    <button
                                        type="button"
                                        aria-label="Close the menu"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-brand-50 hover:text-brand-800">
                                        <X
                                            size={20}
                                            strokeWidth={1.75}
                                            aria-hidden
                                        />
                                    </button>
                                </div>
                                <nav aria-label="Mobile Main">
                                    <p className="mb-2 px-3 text-xs font-semibold text-muted">
                                        {role.group}
                                    </p>
                                    <ul className="flex flex-col gap-1.5">
                                        {items.map(({ href, label, Icon }) => {
                                            const active =
                                                href === section.href;
                                            return (
                                                <li key={href}>
                                                    <Link
                                                        href={href}
                                                        onClick={() =>
                                                            setMenuOpen(false)
                                                        }
                                                        className={cn(
                                                            "flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors",
                                                            active
                                                                ? "bg-brand-600 text-white"
                                                                : "text-brand-700 hover:bg-brand-50 hover:text-brand-800",
                                                        )}>
                                                        <Icon
                                                            size={20}
                                                            strokeWidth={2}
                                                        />
                                                        <span>{label}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-border text-xs text-muted">
                                <Link
                                    href="/privacy"
                                    onClick={() => setMenuOpen(false)}
                                    className="hover:text-brand-700 hover:underline">
                                    Privacy Notice
                                </Link>
                                <span>·</span>
                                <Link
                                    href="/terms"
                                    onClick={() => setMenuOpen(false)}
                                    className="hover:text-brand-700 hover:underline">
                                    Terms
                                </Link>
                            </div>
                        </div>
                    )}
                </dialog>

                {/* Main Content Area */}
                <div
                    className={cn(
                        "flex min-h-screen flex-col transition-all duration-200",
                        collapsed ? "lg:pl-[86px]" : "lg:pl-[294px]",
                    )}>
                    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Open the menu"
                                aria-haspopup="dialog"
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen(true)}
                                className={cn(iconButton, "-ml-2 lg:hidden")}>
                                <MenuIcon
                                    size={22}
                                    strokeWidth={1.75}
                                    aria-hidden
                                />
                            </button>
                            {mine && (
                                <span
                                    data-privacy-sensitive={
                                        mine.sensitive ? "true" : undefined
                                    }
                                    className="text-sm font-medium text-muted truncate max-w-[240px] sm:max-w-md">
                                    {mine.title}
                                </span>
                            )}
                        </div>

                        <div className="ml-auto flex items-center gap-1 lg:gap-2">
                            {user.role === "student" && <PrivacyBlurToggle />}
                            <NotificationPopover
                                unread={unread}
                                role={user.role}
                            />
                            <span
                                aria-hidden
                                className="mx-1 hidden h-7 w-px bg-border sm:block"
                            />
                            <Menu
                                label="Account menu"
                                triggerClassName="flex h-11 items-center gap-3 rounded-full py-0 pr-3 pl-1.5 text-left text-ink transition-colors duration-150 hover:bg-brand-50"
                                trigger={
                                    <>
                                        <span
                                            aria-hidden
                                            className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-[13px] leading-none font-bold text-brand-900">
                                            {initials(user.name)}
                                        </span>
                                        <span className="hidden max-w-[160px] lg:block">
                                            <span className="block truncate text-sm leading-[18px] font-semibold">
                                                {user.name}
                                            </span>
                                            <span className="block text-[13px] leading-[18px] text-muted">
                                                {role.label}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            size={16}
                                            strokeWidth={1.75}
                                            aria-hidden
                                            className="text-muted"
                                        />
                                    </>
                                }
                                header={
                                    <div className="mb-1 min-w-0 border-b border-border px-3 pt-2 pb-3">
                                        <p className="truncate text-sm leading-5 font-semibold">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-[13px] leading-[18px] text-muted">
                                            {user.email}
                                        </p>
                                    </div>
                                }
                                items={[
                                    ...(user.role === "student"
                                        ? [
                                              {
                                                  label: "Passkeys & security",
                                                  icon: (
                                                      <KeyRound
                                                          size={18}
                                                          strokeWidth={1.75}
                                                          aria-hidden
                                                      />
                                                  ),
                                                  onSelect: () =>
                                                      router.push(
                                                          "/account/security",
                                                      ),
                                              },
                                          ]
                                        : []),
                                    {
                                        label: "Sign out",
                                        icon: (
                                            <LogOut
                                                size={18}
                                                strokeWidth={1.75}
                                                aria-hidden
                                            />
                                        ),
                                        onSelect: signOut,
                                    },
                                ]}
                            />
                        </div>
                    </header>

                    <main className="min-w-0 flex-1">
                        <CrumbContext.Provider value={setCrumb}>
                            <div
                                className={cn(
                                    "mx-auto flex flex-col gap-[var(--section-gap)] p-[var(--page-pad)] [&>*]:min-w-0",
                                    user.role === "student"
                                        ? "max-w-[1680px]"
                                        : "max-w-[1440px]",
                                )}>
                                {children}
                            </div>
                        </CrumbContext.Provider>
                    </main>
                </div>
            </div>
        </PrivacyBlurProvider>
    );
}
