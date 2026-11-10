import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
    ArrowRight,
    BookmarkCheck,
    Building2,
    Camera,
    ChevronRight,
    FileCheck2,
    FileText,
    HeartHandshake,
    Lock,
    LockKeyhole,
    MessageCircle,
    Play,
    PlayCircle,
    Scale,
    ShieldAlert,
    ShieldCheck,
    StickyNote,
    Users,
} from "lucide-react";
import {
    CtaBand,
    Faq,
    PilotStrip,
    TrailPattern,
} from "@/components/marketing/blocks";
import { RevealOnScroll } from "@/components/marketing/reveal";
import { HeroVaultWindow } from "@/components/marketing/visuals";

export const metadata: Metadata = {
    title: "Escapture: Keep a record of what happened.",
    description:
        "Save Facebook posts, notes, stories, and Messenger conversations with tamper checks. Build a case in your own time, and route it to an accountable authority only when ready.",
};

const pipelineCards = [
    {
        title: "Capture & prove origin",
        description:
            "Save what's on screen via the extension. All captures run real-time DOM tamper checks and cryptographic SHA-256 checksums.",
        badge: "SHA-256 Tamper checks",
        badgeClass: "bg-brand-50 text-brand-800 border border-brand-200/80",
        Icon: Camera,
    },
    {
        title: "Build in your vault",
        description:
            "Organize evidence without pressure. Invite trusted friends or witnesses to add their own captures with live collaboration.",
        badge: "Private until escalated",
        badgeClass: "bg-canvas text-muted border border-border",
        Icon: LockKeyhole,
    },
    {
        title: "Confirm recommended desks",
        description:
            "State harm type and location. Escapture recommends Guidance, University Affairs, SK/LGU, or WCPD. Preview exactly what leaves.",
        badge: "Student-confirmed routing",
        badgeClass: "bg-brand-50 text-brand-800 border border-brand-200/80",
        Icon: Users,
    },
    {
        title: "Track to real closure",
        description:
            'Each confirmed desk opens an accountable ticket with SLA clocks. Follow updates until reviewers file a written "Actions Taken" note.',
        badge: "Accountable resolution",
        badgeClass: "bg-amber-50 text-amber-900 border border-amber-200/80",
        Icon: BookmarkCheck,
    },
];

const authorities = [
    {
        name: "Guidance & Counseling Office",
        badge: "Confidential Support",
        description:
            "Confidential psychological first-aid, emotional support, student wellness check-ins, and voluntary mediation in a calm, safe environment.",
        Icon: HeartHandshake,
        badgeClass: "bg-brand-50 text-brand-800 border-brand-200",
    },
    {
        name: "University Student Affairs",
        badge: "Campus Accountability",
        description:
            "Formal disciplinary investigation, student code-of-conduct enforcement, campus protective measures, and official administrative resolution.",
        Icon: Building2,
        badgeClass: "bg-blue-50 text-blue-900 border-blue-200",
    },
    {
        name: "SK & Barangay Youth Council",
        badge: "Community & Local",
        description:
            "Off-campus dispute handling, community mediation under the Barangay Youth Protection Council, and local peer assistance.",
        Icon: Users,
        badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
    },
    {
        name: "Women & Children Protection Desk (WCPD)",
        badge: "Legal Escalation",
        description:
            "Serious threat assessment, cyber libel reporting, non-consensual image distribution handling, and formal law enforcement coordination.",
        Icon: ShieldCheck,
        badgeClass: "bg-rose-50 text-rose-900 border-rose-200",
    },
];

const trustCapabilities = [
    {
        title: "Client-side Tamper Checks",
        description:
            "The browser extension refuses to capture if browser developer tools, DOM modifications, or script injectors altered the page before saving.",
        Icon: ShieldAlert,
    },
    {
        title: "Cryptographic SHA-256 Fingerprint",
        description:
            "Every capture is hashed with SHA-256 upon capture. Reviewers open a frozen, script-free copy verified against the original hash.",
        Icon: FileCheck2,
    },
    {
        title: "Trauma-Informed Privacy Control",
        description:
            "Your vault stays completely private. Automated sensitive word detection blurs distressing captures for student well-being until hovered.",
        Icon: Lock,
    },
];

const faq = [
    {
        q: "Who can see my vault?",
        a: "Only you. Nothing reaches reviewers until you escalate a report, and you choose who else can see it.",
    },
    {
        q: "Do I have to report anything?",
        a: "No. You can keep captures in your vault and never escalate. It's your decision, on your timeline.",
    },
    {
        q: "Can I withdraw a report?",
        a: "Before you escalate, you can edit or delete anything. Once you escalate, the report is locked as an official case to preserve evidence integrity.",
    },
    {
        q: "What does “captured with tamper checks” mean?",
        a: "The capture passed our checks when it was taken and the saved file hasn't changed since. It proves the DOM was unmodified when captured.",
    },
    {
        q: "Does Escapture replace the university's process?",
        a: "No. It supplements Bulacan State University's existing process by providing verified, structured documentation.",
    },
    {
        q: "Which platforms are supported?",
        a: "Facebook posts, notes, stories, and Messenger conversations. Messenger captures include the messages visible on screen at capture time.",
    },
];

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-canvas text-ink overflow-x-hidden font-sans">
            <RevealOnScroll />

            {/* ===================== HERO SECTION ===================== */}
            <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-24 overflow-hidden">
                <TrailPattern />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                        {/* Left Content (Hero Copy + CTAs + Under-Hero Cards) */}
                        <div className="order-1 lg:col-span-7 flex flex-col items-start">
                            {/* Untitled UI Top Announcement Pill */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/90 shadow-2xs mb-6 sm:mb-8 group">
                                <span className="flex size-2 rounded-full bg-brand-600 animate-pulse" />
                                <span className="text-xs font-semibold text-brand-950">
                                    Piloting at Bulacan State University
                                </span>
                                <span className="text-brand-300 font-light" aria-hidden>
                                    |
                                </span>
                                <span className="text-xs font-medium text-brand-700 flex items-center gap-1 group-hover:text-brand-900 transition-colors">
                                    Campus safety pilot <ChevronRight className="size-3 text-brand-600" />
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-brand-950 leading-[1.08] sm:leading-[1.02] mb-5 sm:mb-6">
                                Keep a record of what happened.
                            </h1>

                            {/* Subtitle */}
                            <p className="text-base sm:text-xl text-muted max-w-2xl leading-relaxed mb-8 sm:mb-10">
                                Save Facebook posts, notes, stories, and
                                Messenger conversations with tamper checks.
                                Build a case in your own time, and route it to
                                an accountable authority only when ready.
                            </p>

                            {/* Dual Action CTA Group */}
                            <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3">
                                <Link
                                    href="/sign-up"
                                    className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-base px-7 py-3.5 rounded-full transition shadow-xs text-center justify-center inline-flex items-center gap-2 group ring-1 ring-brand-700/20">
                                    <span>Start Your Vault</span>
                                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link
                                    href="#how"
                                    className="bg-card hover:bg-brand-50/70 border border-border/80 text-brand-800 hover:text-brand-950 font-semibold text-base px-6 py-3.5 rounded-full inline-flex items-center justify-center gap-2 transition text-center shadow-2xs">
                                    <Play className="size-4 fill-brand-600 text-brand-600" />
                                    <span>See How It Works</span>
                                </Link>
                            </div>

                            {/* Divider Line */}
                            <div className="w-full h-px bg-border/80 mb-6 sm:mb-8" />

                            {/* Under-Hero Feature Subgrid (2 cards) */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* 4 FACEBOOK SURFACES */}
                                <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-brand-300 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="text-[11px] font-bold tracking-wider text-brand-700 uppercase">
                                                Covered Surfaces
                                            </span>
                                            <span className="text-[11px] font-semibold text-brand-800 bg-brand-50 border border-brand-200/60 rounded-full px-2 py-0.5">
                                                4 Surfaces
                                            </span>
                                        </div>
                                        <div className="h-px bg-border/60 mb-3" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <StickyNote className="size-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-brand-900">
                                                    Posts
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <PlayCircle className="size-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-brand-900">
                                                    Stories
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <FileText className="size-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-brand-900">
                                                    Notes
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <MessageCircle className="size-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-brand-900">
                                                    Messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ACCOUNTABLE DESKS */}
                                <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-brand-300 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="text-[11px] font-bold tracking-wider text-brand-700 uppercase">
                                                Accountable Desks
                                            </span>
                                            <span className="text-[11px] font-semibold text-brand-800 bg-brand-50 border border-brand-200/60 rounded-full px-2 py-0.5">
                                                SLA Clocks
                                            </span>
                                        </div>
                                        <div className="h-px bg-border/60 mb-3" />
                                        <p className="text-xs text-muted leading-relaxed mb-3">
                                            Routed with SLA acknowledgment
                                            clocks and required written closing notes.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {[
                                            "Guidance",
                                            "University",
                                            "SK/LGU",
                                            "WCPD",
                                        ].map((badge) => (
                                            <span
                                                key={badge}
                                                className="bg-brand-50 text-brand-800 border border-brand-200/80 text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-center">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Hero: Character Illustration & Vault Mock */}
                        <div className="order-2 lg:col-span-5 flex flex-col items-center justify-center relative">
                            <div className="relative w-full max-w-lg flex flex-col items-center">
                                {/* Elevated Vault Browser Mock */}
                                <div className="w-full relative z-20">
                                    <HeroVaultWindow />
                                </div>

                                {/* Character Illustration sitting at desk */}
                                <div className="w-full max-w-[280px] sm:max-w-[420px] -mt-6 sm:-mt-10 relative z-10 flex justify-center">
                                    <Image
                                        src="/hero-figma.png"
                                        alt="Escapture student user"
                                        width={850}
                                        height={850}
                                        priority
                                        className="w-full h-auto object-contain drop-shadow-md select-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pilot Strip */}
            <PilotStrip
                label="PILOT & COMPLIANCE"
                items={[
                    "Piloting at Bulacan State University",
                    "Supplements the university's existing process",
                    "Facebook posts, stories, notes, and Messenger",
                ]}
            />

            {/* ===================== FOUR STEPS PIPELINE SECTION ===================== */}
            <section
                id="how"
                className="py-16 sm:py-24 lg:py-28 bg-card border-b border-border/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 border border-brand-200 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-brand-600" />
                            How It Works
                        </span>
                        <h2 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-brand-950 leading-[1.08] mb-4">
                            Four steps, at your own pace
                        </h2>
                        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
                            You decide when, and whether, anything goes further.
                            No case moves without your explicit confirmation.
                        </p>
                    </div>

                    {/* 4 Cards Grid with Untitled UI Step Card Pattern */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {pipelineCards.map(
                            ({
                                title,
                                description,
                                badge,
                                badgeClass,
                                Icon,
                            }, index) => (
                                <div
                                    key={title}
                                    className="bg-card border border-border/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-brand-300 transition-all duration-200 group">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <div className="size-11 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-brand-100 transition-colors">
                                                <Icon className="size-5 text-brand-700" />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50/80 border border-brand-200/60 rounded-full px-2.5 py-1 shadow-2xs">
                                                Step {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>
                                        <h3 className="font-heading text-base font-bold text-brand-950 mb-2 leading-snug">
                                            {title}
                                        </h3>
                                        <p className="text-xs sm:text-[13px] text-muted leading-relaxed mb-6">
                                            {description}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-border/60">
                                        <span
                                            className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                                            {badge}
                                        </span>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* ===================== STUDENT AGENCY AND TRUST SECTION ===================== */}
            <section
                id="trust"
                className="py-16 sm:py-24 lg:py-28 bg-canvas relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-12 sm:mb-16">
                        {/* 2 Green Squircle Icons from Figma */}
                        <div className="order-2 lg:order-1 lg:col-span-5 flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
                            <div className="w-full max-w-[150px] sm:max-w-[200px] flex-1 aspect-square rounded-[24px] sm:rounded-[28px] overflow-hidden bg-card border border-border/80 shadow-xs flex items-center justify-center p-3 sm:p-4 hover:border-brand-300 transition-colors">
                                <Image
                                    src="/trust-report-icon.png"
                                    alt="Report document check"
                                    width={264}
                                    height={264}
                                    className="w-full h-full object-contain select-none"
                                />
                            </div>
                            <div className="w-full max-w-[150px] sm:max-w-[200px] flex-1 aspect-square rounded-[24px] sm:rounded-[28px] overflow-hidden bg-card border border-border/80 shadow-xs flex items-center justify-center p-3 sm:p-4 hover:border-brand-300 transition-colors">
                                <Image
                                    src="/trust-verified-icon.png"
                                    alt="Verified shield inspection"
                                    width={263}
                                    height={263}
                                    className="w-full h-full object-contain select-none"
                                />
                            </div>
                        </div>

                        {/* Pill + Headings */}
                        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-start">
                            <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 border border-brand-200 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 sm:mb-4 shadow-2xs">
                                <span className="size-1.5 rounded-full bg-brand-600" />
                                Student Agency and Trust
                            </span>
                            <h2 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-brand-950 leading-[1.08] mb-3 sm:mb-4">
                                Built for hard days.
                                <br />
                                Verified for real accountability.
                            </h2>
                            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
                                Three purpose-built capabilities that turn
                                contested screenshots into routed, auditable
                                evidence.
                            </p>
                        </div>
                    </div>

                    {/* 3 Trust Capability Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                        {trustCapabilities.map(({ title, description, Icon }) => (
                            <div
                                key={title}
                                className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-brand-300 transition-all duration-200 flex flex-col gap-3 group">
                                <div className="size-12 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-brand-100 transition-colors">
                                    <Icon className="size-5.5 text-brand-700" />
                                </div>
                                <h3 className="font-heading font-bold text-brand-950 text-base sm:text-lg">
                                    {title}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===================== ACCOUNTABLE AUTHORITIES SECTION ===================== */}
            <section
                id="authorities"
                className="py-16 sm:py-24 lg:py-28 bg-card border-y border-border/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 border border-brand-200 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-brand-600" />
                            Accountable Desks
                        </span>
                        <h2 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-brand-950 leading-[1.08] mb-4">
                            Where cases go when you&apos;re ready
                        </h2>
                        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
                            Escapture routes your report directly to verified campus and community desks with audit trails, read-only evidence sandboxes, and SLA response clocks.
                        </p>
                    </div>

                    {/* 4 Authority Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8 sm:mb-12">
                        {authorities.map(({ name, badge, description, Icon, badgeClass }) => (
                            <div
                                key={name}
                                className="bg-canvas border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-brand-300 transition-all duration-200 flex flex-col justify-between group">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                        <div className="size-11 rounded-xl bg-card border border-border/70 flex items-center justify-center text-brand-700 shadow-2xs group-hover:bg-brand-50 transition-colors">
                                            <Icon className="size-5" />
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                                            {badge}
                                        </span>
                                    </div>
                                    <h3 className="font-heading font-bold text-brand-950 text-base leading-snug mb-2">
                                        {name}
                                    </h3>
                                    <p className="text-xs sm:text-[13px] text-muted leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reviewer Safeguards Highlight Band */}
                    <div className="rounded-2xl border border-brand-200/90 bg-gradient-to-r from-brand-50/80 via-card to-brand-50/60 p-6 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-2xs">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-brand-600/20">
                                <Scale className="size-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-heading font-bold text-brand-950 text-base sm:text-lg">
                                        Built-in Review Safeguards
                                    </h4>
                                    <span className="hidden sm:inline-block bg-brand-100 text-brand-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-200">
                                        Official desk portal
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-brand-900/80 max-w-2xl leading-relaxed">
                                    Reviewers open evidence in an isolated, script-free sandbox. Case records cannot be altered, reviewer notes are permanently archived, and accused-party submissions remain strictly segregated.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/sign-in"
                            className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm px-6 py-3 rounded-full transition shadow-xs whitespace-nowrap text-center justify-center inline-flex items-center gap-2 shrink-0">
                            <span>Reviewer Portal</span>
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Common Questions / FAQ Section */}
            <section
                id="faq"
                className="py-16 sm:py-24 lg:py-28 bg-canvas border-b border-border/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 border border-brand-200 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-brand-600" />
                            Frequently Asked Questions
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-950 mb-3">
                            Common questions
                        </h2>
                        <p className="text-base sm:text-lg text-muted max-w-xl">
                            Everything you need to know about the vault, verification checks, and university reporting.
                        </p>
                    </div>
                    <Faq items={faq} />
                </div>
            </section>

            {/* CTA Band */}
            <CtaBand
                title="Start your vault today"
                lead="Capture what happened now, and decide what to do with it later. It's private until you choose to share."
                trustBadges={[
                    "SHA-256 tamper checks",
                    "Private until escalated",
                    "Student-controlled timeline",
                    "Free for BulSU students",
                ]}>
                <Link
                    href="/sign-up"
                    className="bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100 font-bold text-base px-8 py-3.5 rounded-full transition shadow-sm w-full sm:w-auto text-center justify-center inline-flex items-center gap-2">
                    <span>Start your vault</span>
                    <ArrowRight className="size-4 text-brand-700" />
                </Link>
                <Link
                    href="#how"
                    className="text-white hover:text-brand-100 font-semibold text-base px-7 py-3.5 rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition w-full sm:w-auto text-center justify-center inline-flex items-center gap-2">
                    <Play className="size-4 fill-white text-white" />
                    <span>See how it works</span>
                </Link>
            </CtaBand>
        </div>
    );
}
