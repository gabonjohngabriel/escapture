import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
    BookmarkCheck,
    Building2,
    Camera,
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
    Section,
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
        title: "CAPTURE & PROVE ORIGIN",
        description:
            "Save what's on screen via the extension. All captures run real-time DOM tamper checks and cryptographic SHA-256 checksums.",
        badge: "SHA-256 Tamper checks",
        badgeClass: "bg-brand-50 text-brand-800 border border-brand-200/80",
        Icon: Camera,
    },
    {
        title: "BUILD IN YOUR VAULT",
        description:
            "Organize evidence without pressure. Invite trusted friends or witnesses to add their own captures with live collaboration.",
        badge: "Private until escalated",
        badgeClass: "bg-canvas text-muted border border-border",
        Icon: LockKeyhole,
    },
    {
        title: "CONFIRM RECOMMENDED DESKS",
        description:
            "State harm type and location. Escapture recommends Guidance, University Affairs, SK/LGU, or WCPD. Preview exactly what leaves.",
        badge: "Student-confirmed routing",
        badgeClass: "bg-brand-50 text-brand-800 border border-brand-200/80",
        Icon: Users,
    },
    {
        title: "TRACK TO REAL CLOSURE",
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

            {/* HERO SECTION */}
            <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
                <TrailPattern />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left Content */}
                        <div className="lg:col-span-7 flex flex-col items-start">
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-brand-800 leading-[1.02] mb-6">
                                Keep a record of what happened.
                            </h1>
                            <p className="text-lg sm:text-xl text-muted max-w-2xl leading-relaxed mb-8">
                                Save Facebook posts, notes, stories, and
                                Messenger conversations with tamper checks.
                                Build a case in your own time, and route it to
                                an accountable authority only when ready.
                            </p>

                            {/* Dual Action Pill Button */}
                            <div className="mb-10 inline-flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-card border border-brand-200/80 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)]">
                                <Link
                                    href="/sign-up"
                                    className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-base px-7 py-3 rounded-full transition shadow-xs text-center">
                                    Start Your Vault
                                </Link>
                                <Link
                                    href="#how"
                                    className="text-brand-700 hover:text-brand-900 hover:bg-brand-50/70 font-semibold text-base px-6 py-3 rounded-full flex items-center gap-2 transition text-center">
                                    <Play className="size-4 fill-brand-600 text-brand-600" />
                                    See How It Works
                                </Link>
                            </div>

                            {/* Divider Line */}
                            <div className="w-full h-px bg-border/80 mb-8" />

                            {/* Under-Hero Feature Subgrid (2 cards) */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* 4 FACEBOOK SURFACES */}
                                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-center text-xs font-black tracking-wider text-brand-800 uppercase mb-3">
                                            4 FACEBOOK SURFACES
                                        </h2>
                                        <div className="h-px bg-border/70 mb-4" />
                                        <div className="grid grid-cols-2 gap-3.5">
                                            <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <StickyNote className="size-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-brand-900">
                                                    Posts
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <PlayCircle className="size-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-brand-900">
                                                    Stories
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <FileText className="size-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-brand-900">
                                                    Notes
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-canvas border border-border/50">
                                                <div className="size-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                                    <MessageCircle className="size-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-brand-900">
                                                    Messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ACCOUNTABLE DESKS */}
                                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-center text-xs font-black tracking-wider text-brand-800 uppercase mb-3">
                                            ACCOUNTABLE DESKS
                                        </h2>
                                        <div className="h-px bg-border/70 mb-3" />
                                        <p className="text-xs sm:text-sm text-muted leading-relaxed mb-4">
                                            Routed with SLA acknowledgment
                                            clocks and required written closing notes.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 pt-1">
                                        {[
                                            "Guidance",
                                            "University",
                                            "SK/LGU",
                                            "WCPD",
                                        ].map((badge) => (
                                            <span
                                                key={badge}
                                                className="bg-brand-50 text-brand-800 border border-brand-200/80 text-[11px] font-semibold px-2.5 py-1 rounded-full text-center">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Hero: Character Illustration & Vault Mock */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                            <div className="relative w-full max-w-lg flex flex-col items-center">
                                {/* Vault Browser Mock */}
                                <div className="w-full relative z-20">
                                    <HeroVaultWindow />
                                </div>

                                {/* Character Illustration sitting at desk */}
                                <div className="w-full max-w-[420px] -mt-6 sm:-mt-8 relative z-10 flex justify-center">
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
                items={[
                    "Piloting at Bulacan State University",
                    "Supplements the university's existing process",
                    "Facebook posts, stories, notes, and Messenger",
                ]}
            />

            {/* ===================== FOUR STEPS PIPELINE SECTION ===================== */}
            <section
                id="how"
                className="py-20 lg:py-28 bg-card border-y border-border/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                        <span className="bg-brand-100 text-brand-800 border border-brand-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-2xs">
                            How It Works
                        </span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-800 leading-[1.05] mb-4">
                            Four steps, at your own pace
                        </h2>
                        <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
                            You decide when, and whether, anything goes further.
                            No case moves without your explicit confirmation.
                        </p>
                    </div>

                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {pipelineCards.map(
                            ({
                                title,
                                description,
                                badge,
                                badgeClass,
                                Icon,
                            }) => (
                                <div
                                    key={title}
                                    className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-brand-300 transition-all min-h-[250px]">
                                    <div>
                                        <h3 className="text-center text-xs font-black tracking-wider text-brand-800 uppercase mb-3">
                                            {title}
                                        </h3>
                                        <div className="h-px bg-border/70 mb-4" />
                                        <div className="flex items-start gap-3.5 mb-5">
                                            <div className="size-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon className="size-5 text-brand-700" />
                                            </div>
                                            <p className="text-xs sm:text-[13px] text-muted leading-relaxed">
                                                {description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <span
                                            className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
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
                className="py-20 lg:py-28 bg-canvas relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center mb-16">
                        {/* Left Column: 2 Green Squircle Icons from Figma */}
                        <div className="lg:col-span-5 flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
                            <div className="w-[160px] sm:w-[200px] aspect-square rounded-[28px] overflow-hidden bg-card border border-border/80 shadow-xs flex items-center justify-center p-3">
                                <Image
                                    src="/trust-report-icon.png"
                                    alt="Report document check"
                                    width={264}
                                    height={264}
                                    className="w-full h-full object-contain select-none"
                                />
                            </div>
                            <div className="w-[160px] sm:w-[200px] aspect-square rounded-[28px] overflow-hidden bg-card border border-border/80 shadow-xs flex items-center justify-center p-3">
                                <Image
                                    src="/trust-verified-icon.png"
                                    alt="Verified shield inspection"
                                    width={263}
                                    height={263}
                                    className="w-full h-full object-contain select-none"
                                />
                            </div>
                        </div>

                        {/* Right Column: Pill + Headings */}
                        <div className="lg:col-span-7 flex flex-col items-start">
                            <span className="bg-brand-100 text-brand-800 border border-brand-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-2xs">
                                Student Agency and Trust
                            </span>
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-800 leading-[1.05] mb-4">
                                Built for hard days.
                                <br />
                                Verified for real accountability.
                            </h2>
                            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
                                Three purpose-built capabilities that turn
                                contested screenshots into routed, auditable
                                evidence.
                            </p>
                        </div>
                    </div>

                    {/* 3 Trust Capability Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trustCapabilities.map(({ title, description, Icon }) => (
                            <div
                                key={title}
                                className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
                                <div className="size-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                    <Icon className="size-5" />
                                </div>
                                <h3 className="font-bold text-brand-900 text-lg">
                                    {title}
                                </h3>
                                <p className="text-sm text-muted leading-relaxed">
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
                className="py-20 lg:py-28 bg-card border-y border-border/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                        <span className="bg-brand-100 text-brand-800 border border-brand-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-2xs">
                            Accountable Desks
                        </span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-800 leading-[1.05] mb-4">
                            Where cases go when you&apos;re ready
                        </h2>
                        <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
                            Escapture routes your report directly to verified campus and community desks with audit trails, read-only evidence sandboxes, and SLA response clocks.
                        </p>
                    </div>

                    {/* 4 Authority Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {authorities.map(({ name, badge, description, Icon, badgeClass }) => (
                            <div
                                key={name}
                                className="bg-canvas border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-brand-300 transition-colors">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <div className="size-11 rounded-xl bg-card border border-border/70 flex items-center justify-center text-brand-700 shadow-2xs">
                                            <Icon className="size-5" />
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                                            {badge}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-brand-900 text-lg leading-snug mb-2">
                                        {name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reviewer Safeguards Highlight Band */}
                    <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Scale className="size-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-900 text-lg">
                                    Built-in Review Safeguards
                                </h4>
                                <p className="text-sm text-brand-800/80 max-w-2xl leading-relaxed mt-1">
                                    Reviewers open evidence in an isolated, script-free sandbox. Case records cannot be altered, reviewer notes are permanently archived, and accused-party submissions remain strictly segregated.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/sign-in"
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition shadow-xs whitespace-nowrap">
                            Reviewer Portal
                        </Link>
                    </div>
                </div>
            </section>

            {/* Common Questions / FAQ Section */}
            <Section
                id="faq"
                tone="canvas"
                eyebrow="Questions"
                title="Common questions"
                center>
                <Faq items={faq} />
            </Section>

            {/* CTA Band */}
            <CtaBand
                title="Start your vault today"
                lead="Capture what happened now, and decide what to do with it later. It's private until you choose to share.">
                <Link
                    href="/sign-up"
                    className="bg-white text-brand-800 hover:bg-brand-50 font-bold text-base px-7 py-3 rounded-full transition shadow-sm">
                    Start your vault
                </Link>
                <Link
                    href="#how"
                    className="text-white hover:text-brand-100 font-bold text-base px-6 py-3 rounded-full border border-white/30 hover:border-white transition">
                    See how it works
                </Link>
            </CtaBand>
        </div>
    );
}
