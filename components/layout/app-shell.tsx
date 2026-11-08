"use client";

import {
    Archive,
    Bell,
    ChevronDown,
    Columns3,
    FolderOpen,
    Inbox,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Menu as MenuIcon,
    Search,
    Tags,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    createContext,
    Suspense,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Menu } from "@/components/ui/menu";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import { Logo } from "./logo";
import { NotificationPopover } from "./notification-popover";

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
        label: "Shared with me",
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
            label: "Reviewer accounts",
            Icon: Users,
            match: (p) => p.startsWith("/admin/reviewers"),
        },
        {
            href: "/admin/word-bank",
            label: "Word bank",
            Icon: Tags,
            match: (p) => p.startsWith("/admin/word-bank"),
        },
    ],
};

const ROLE: Record<
    Role,
    { label: string; group: string; search: { action: string; label: string } }
> = {
    student: {
        label: "Student",
        group: "Your Space",
        search: { action: "/vault", label: "Search your vault" },
    },
    reviewer: {
        label: "Case reviewer",
        group: "Reviews",
        search: {
            action: "/review/board",
            label: "Search cases and reporters",
        },
    },
    admin: {
        label: "Administrator",
        group: "Administration",
        search: {
            action: "/review/board",
            label: "Search cases and reporters",
        },
    },
};

type Crumb = { path: string; title: string; section?: string };
const CrumbContext = createContext<(crumb: Crumb) => void>(() => {});

export function PageCrumbs({
    title,
    section,
}: {
    title: string;
    section?: string;
}) {
    const set = useContext(CrumbContext);
    const path = usePathname();
    useEffect(() => set({ path, title, section }), [set, path, title, section]);
    return null;
}

function HeaderSearch({ role, className }: { role: Role; className?: string }) {
    const { action, label } = ROLE[role].search;
    const pathname = usePathname();
    const q = useSearchParams().get("q") ?? "";
    const current = pathname === action ? q : "";
    return (
        <form
            role="search"
            action={action}
            method="get"
            className={cn("relative", className)}>
            <Search
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
                key={`${pathname}?${current}`}
                type="search"
                name="q"
                defaultValue={current}
                aria-label={label}
                placeholder={label}
                maxLength={120}
                className="h-10 w-full rounded-md border border-border-strong bg-card pr-3 pl-[38px] text-[15px] leading-5 text-ink placeholder:text-muted"
            />
        </form>
    );
}

const iconButton =
    "relative grid size-11 place-items-center rounded-md text-ink transition-colors duration-150 hover:bg-brand-100 hover:text-brand-800";

export function AppShell({
    user,
    unread,
    counts = {},
    children,
}: {
    user: { name: string; email: string; role: Role };
    unread: number;
    counts?: Record<string, number>;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
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

    const [hovered, setHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const drawer = useRef<HTMLDialogElement>(null);

    async function signOut() {
        await api("/api/auth/sign-out", { body: {} }).catch(() => {});
        window.location.href = "/sign-in";
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

    const isExpanded = hovered || user.role !== "student";

    return (
        <div
            data-density={user.role === "student" ? "comfortable" : "compact"}
            className="app-shell min-h-screen">
            {/* Desktop Collapsible Sidebar */}
            <aside
                aria-label="Sidebar"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn(
                    "fixed inset-y-0 left-0 z-40 hidden flex-col justify-between border-r border-[#E2EBE5] bg-card px-4 py-6 transition-all duration-250 ease-out lg:flex overflow-x-hidden",
                    user.role === "student"
                        ? isExpanded
                            ? "w-[348px] shadow-2xl"
                            : "w-[86px] shadow-xs"
                        : "w-[248px]",
                )}>
                <div className="flex flex-col gap-6">
                    {/* Header & Logo */}
                    <div className="flex h-14 items-center">
                        <Link
                            href={home}
                            className="flex items-center overflow-hidden rounded-md focus-visible:outline-[#52946B]"
                            title="Escapture Home">
                            <Logo
                                size={40}
                                withName={isExpanded}
                                animateName={true}
                                nameClassName="text-[26px] font-bold text-[#52946B]"
                            />
                        </Link>
                    </div>

                    {/* Navigation Section */}
                    <nav aria-label="Main" className="mt-2">
                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-250 ease-out",
                                isExpanded
                                    ? "max-h-8 opacity-100 mb-4"
                                    : "max-h-0 opacity-0 pointer-events-none mb-0",
                            )}>
                            <p className="px-3 text-[16px] font-medium text-[#5F856E] whitespace-nowrap">
                                {role.group}
                            </p>
                        </div>
                        <ul className="flex flex-col gap-2">
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
                                                "group relative flex h-14 w-full items-center rounded-full transition-all duration-250 ease-out overflow-hidden select-none",
                                                active
                                                    ? "bg-[#52946B] text-white shadow-sm"
                                                    : "text-[#52946B] hover:bg-[#F2F7F4]",
                                            )}
                                            title={label}>
                                            <div className="flex size-14 shrink-0 items-center justify-center">
                                                <Icon
                                                    size={24}
                                                    strokeWidth={2.25}
                                                    aria-hidden
                                                    className={cn(
                                                        "shrink-0",
                                                        active
                                                            ? "text-white"
                                                            : "text-[#52946B]",
                                                    )}
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    "whitespace-nowrap overflow-hidden transition-all duration-250 ease-out text-[22px] font-bold leading-none",
                                                    isExpanded
                                                        ? "max-w-[200px] opacity-100 translate-x-0 ml-1"
                                                        : "max-w-0 opacity-0 -translate-x-3 pointer-events-none ml-0",
                                                )}>
                                                {label}
                                            </span>
                                            {counts[href] !== undefined && (
                                                <span
                                                    className={cn(
                                                        "tnum ml-auto whitespace-nowrap overflow-hidden rounded-full text-xs font-bold transition-all duration-250 ease-out mr-3",
                                                        isExpanded
                                                            ? "max-w-[50px] opacity-100 px-2.5 py-0.5"
                                                            : "max-w-0 opacity-0 pointer-events-none p-0",
                                                        active
                                                            ? "bg-white/25 text-white"
                                                            : "bg-[#F2F7F4] text-[#52946B]",
                                                    )}>
                                                    {counts[href]}
                                                </span>
                                            )}
                                            {showDot && (
                                                <span
                                                    className={cn(
                                                        "size-2.5 rounded-full bg-[#D97706] transition-all duration-250",
                                                        isExpanded
                                                            ? "ml-auto mr-3"
                                                            : "absolute top-2.5 right-2.5",
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
                <div className="relative pt-4 overflow-hidden">
                    <div
                        className={cn(
                            "flex items-center justify-between rounded-full border border-[#DCE5DF] bg-[#FAFBFB] p-1.5 shadow-xs whitespace-nowrap transition-all duration-250 ease-out",
                            isExpanded
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4 pointer-events-none",
                        )}>
                        <Link
                            href="/privacy"
                            tabIndex={isExpanded ? 0 : -1}
                            className="rounded-full px-4 py-2 text-[14px] font-bold text-[#52946B] transition-colors hover:text-[#356246]">
                            Privacy Notice
                        </Link>
                        <Link
                            href="/terms"
                            tabIndex={isExpanded ? 0 : -1}
                            className="rounded-full bg-[#52946B] px-5 py-2 text-[14px] font-bold text-white shadow-xs transition-colors hover:bg-[#427A56]">
                            Terms of Service
                        </Link>
                    </div>

                    <div
                        className={cn(
                            "py-2 text-center transition-all duration-250 ease-out",
                            !isExpanded
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none hidden",
                        )}>
                        <span className="text-[10px] font-bold text-[#5F856E] uppercase">
                            v0.1
                        </span>
                    </div>
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
                                    className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-[#E3EFE7]">
                                    <X
                                        size={20}
                                        strokeWidth={1.75}
                                        aria-hidden
                                    />
                                </button>
                            </div>
                            <nav aria-label="Mobile Main">
                                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-[#55665C]">
                                    {role.group}
                                </p>
                                <ul className="flex flex-col gap-1.5">
                                    {items.map(({ href, label, Icon }) => {
                                        const active = href === section.href;
                                        return (
                                            <li key={href}>
                                                <Link
                                                    href={href}
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                    className={cn(
                                                        "flex h-12 items-center gap-3 rounded-xl px-4 text-base font-semibold",
                                                        active
                                                            ? "bg-[#52946B] text-white"
                                                            : "text-[#203E2C] hover:bg-[#E3EFE7]",
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
                        <div className="flex items-center gap-2 pt-4">
                            <Link
                                href="/privacy"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-[#55665C]">
                                Privacy Notice
                            </Link>
                            <Link
                                href="/terms"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-full bg-[#52946B] px-3.5 py-1.5 text-xs font-semibold text-white">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                )}
            </dialog>

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex min-h-screen flex-col transition-all duration-300",
                    user.role === "student" ? "lg:pl-[86px]" : "lg:pl-[248px]",
                )}>
                <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#E2EBE5] bg-card/95 backdrop-blur px-4 py-2 lg:px-8 lg:py-0">
                    <button
                        type="button"
                        aria-label="Open the menu"
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(true)}
                        className={cn(iconButton, "-ml-2 lg:hidden")}>
                        <MenuIcon size={22} strokeWidth={1.75} aria-hidden />
                    </button>

                    <Suspense
                        fallback={
                            <div className="order-last h-10 w-full lg:order-none lg:w-[320px]" />
                        }>
                        <HeaderSearch
                            role={user.role}
                            className="order-last w-full lg:order-none lg:w-[320px]"
                        />
                    </Suspense>

                    <div className="ml-auto flex items-center gap-1 lg:gap-2">
                        <NotificationPopover unread={unread} role={user.role} />
                        <span
                            aria-hidden
                            className="mx-1 hidden h-7 w-px bg-border sm:block"
                        />
                        <Menu
                            label="Account menu"
                            triggerClassName="flex h-11 items-center gap-3 rounded-md py-0 pr-2 pl-1 text-left text-ink transition-colors duration-150 hover:bg-[#E3EFE7]"
                            trigger={
                                <>
                                    <span
                                        aria-hidden
                                        className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E3EFE7] text-[13px] leading-none font-bold text-[#203E2C]">
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
    );
}
