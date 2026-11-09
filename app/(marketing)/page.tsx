import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookmarkCheck,
  Camera,
  FileText,
  LockKeyhole,
  MessageCircle,
  Play,
  PlayCircle,
  StickyNote,
  Users,
} from "lucide-react";
import { CtaBand, Faq, PilotStrip, Section, TrailPattern } from "@/components/marketing/blocks";
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
      "Save what's on screen via the extension. Posts get a TLSNotary origin proof; all items run DOM tamper checks and account links.",
    badge: "SHA-256 Tamper checks",
    badgeClass: "bg-[#AAE6D6]/50 text-[#1D6359]",
    Icon: Camera,
  },
  {
    title: "BUILD IN YOUR VAULT",
    description:
      "Organize evidence without pressure. Invite trusted friends or witnesses to add their own captures with live cursor collaboration.",
    badge: "Private until escalated",
    badgeClass: "bg-[#D1D5DB]/35 text-[#4B5563]",
    Icon: LockKeyhole,
  },
  {
    title: "CONFIRM RECOMMENDED DESKS",
    description:
      "State harm type and location. Escapture recommends Guidance, University, or SK/LGU. Preview exactly what leaves.",
    badge: "Student-confirmed routing",
    badgeClass: "bg-[#D1D5DB]/35 text-[#4B5563]",
    Icon: Users,
  },
  {
    title: "TRACK TO REAL CLOSURE",
    description:
      "Each confirmed desk opens an accountable ticket with SLA clocks. Follow updates until reviewers file a written \"Actions Taken\" note.",
    badge: "Accountable resolution",
    badgeClass: "bg-[#FFD900]/25 text-[#92400E]",
    Icon: BookmarkCheck,
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
    <div className="flex flex-col min-h-screen bg-[#FEFEFE] text-ink overflow-x-hidden font-sans">
      <RevealOnScroll />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        <TrailPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#5da36c] leading-[0.95] mb-6">
                Keep a record of what happened.
              </h1>
              <p className="text-xl sm:text-2xl text-[#6ba293] max-w-2xl leading-snug mb-8">
                Save Facebook posts, notes, stories, and Messenger conversations with tamper checks. Build a case in
                your own time, and route it to an accountable authority only when ready.
              </p>

              {/* Dual Action Pill Button */}
              <div className="mb-10 inline-flex flex-wrap items-center gap-3 p-2 rounded-full bg-white border-2 border-[rgba(93,163,108,0.12)] shadow-[0px_4px_30px_0px_rgba(0,0,0,0.05)]">
                <Link
                  href="/sign-up"
                  className="bg-[#5da36c] hover:bg-[#4d8a5a] active:bg-[#40744b] text-white font-bold text-lg px-8 py-3.5 rounded-full transition shadow-xs text-center"
                >
                  Start Your Vault
                </Link>
                <Link
                  href="#how"
                  className="text-[#5da36c] hover:text-[#4d8a5a] font-bold text-lg px-6 py-3.5 rounded-full flex items-center gap-2.5 transition hover:bg-[#5da36c]/5 text-center"
                >
                  <Play className="size-4 fill-[#5da36c] text-[#5da36c]" />
                  See How It Works
                </Link>
              </div>

              {/* Divider Line */}
              <div className="w-full h-px bg-[rgba(93,163,108,0.15)] mb-8" />

              {/* Under-Hero Feature Subgrid (2 cards) */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 4 FACEBOOK SURFACES */}
                <div className="bg-white border-4 border-[#F7FAF7] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-center text-sm font-black tracking-wider text-[#5da36c] uppercase mb-3">
                      4 FACEBOOK SURFACES
                    </h2>
                    <div className="h-px bg-[rgba(93,163,108,0.12)] mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-2xl bg-[rgba(93,163,108,0.06)] flex items-center justify-center text-[#5da36c] shrink-0">
                          <StickyNote className="size-5" />
                        </div>
                        <span className="text-base font-normal text-[#5da36c]">Posts</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-2xl bg-[rgba(93,163,108,0.06)] flex items-center justify-center text-[#5da36c] shrink-0">
                          <PlayCircle className="size-5" />
                        </div>
                        <span className="text-base font-normal text-[#5da36c]">Stories</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-2xl bg-[rgba(93,163,108,0.06)] flex items-center justify-center text-[#5da36c] shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <span className="text-base font-normal text-[#5da36c]">Notes</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-2xl bg-[rgba(93,163,108,0.06)] flex items-center justify-center text-[#5da36c] shrink-0">
                          <MessageCircle className="size-5" />
                        </div>
                        <span className="text-base font-normal text-[#5da36c]">Messages</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCOUNTABLE DESKS */}
                <div className="bg-white border-4 border-[#F7FAF7] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-center text-sm font-black tracking-wider text-[#5da36c] uppercase mb-3">
                      ACCOUNTABLE DESKS
                    </h2>
                    <div className="h-px bg-[rgba(93,163,108,0.12)] mb-3" />
                    <p className="text-sm font-normal text-[#5da36c] leading-snug mb-4">
                      Routed with SLA acknowledgment clocks and required closing notes.
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {["Guidance", "University", "SK/LGU", "WCPD"].map((badge) => (
                      <span
                        key={badge}
                        className="bg-[rgba(93,163,108,0.08)] text-[#6ba293] text-xs font-bold px-3 py-1 rounded-full text-center"
                      >
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
                <div className="w-full max-w-[440px] -mt-6 sm:-mt-10 relative z-10 flex justify-center">
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
      <section id="how" className="py-20 lg:py-28 bg-white border-y border-[rgba(93,163,108,0.1)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="bg-[#5da36c] text-white text-sm font-bold px-6 py-1.5 rounded-full mb-6 shadow-xs">
              How It Works
            </span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#5da36c] leading-[0.95] mb-6">
              Four steps, at your<br />own pace
            </h2>
            <p className="text-xl text-[#6ba293] leading-relaxed max-w-2xl">
              You decide when, and whether, anything goes further. No case moves without your explicit confirmation.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pipelineCards.map(({ title, description, badge, badgeClass, Icon }) => (
              <div
                key={title}
                className="bg-white border-4 border-[rgba(93,163,108,0.06)] rounded-[24px] p-5 flex flex-col justify-between shadow-xs hover:border-[rgba(93,163,108,0.18)] transition-all min-h-[250px]"
              >
                <div>
                  <h3 className="text-center text-sm font-black tracking-wider text-[#5da36c] uppercase mb-3">
                    {title}
                  </h3>
                  <div className="h-px bg-[rgba(93,163,108,0.12)] mb-4" />
                  <div className="flex items-start gap-3.5 mb-5">
                    <div className="size-12 rounded-2xl bg-[rgba(93,163,108,0.06)] flex items-center justify-center text-[#5da36c] shrink-0 mt-0.5">
                      <Icon className="size-6 text-[#5da36c]" />
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#5da36c] leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full ${badgeClass}`}>
                    {badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STUDENT AGENCY AND TRUST SECTION ===================== */}
      <section id="trust" className="py-24 lg:py-32 bg-[#FEFEFE] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: 2 Green Squircle Icons from Figma */}
            <div className="lg:col-span-5 flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
              <div className="w-[180px] sm:w-[220px] aspect-square rounded-[32px] overflow-hidden shadow-sm flex items-center justify-center">
                <Image
                  src="/trust-report-icon.png"
                  alt="Report document check"
                  width={264}
                  height={264}
                  className="w-full h-full object-contain select-none"
                />
              </div>
              <div className="w-[180px] sm:w-[220px] aspect-square rounded-[32px] overflow-hidden shadow-sm flex items-center justify-center">
                <Image
                  src="/trust-verified-icon.png"
                  alt="Verified shield inspection"
                  width={263}
                  height={263}
                  className="w-full h-full object-contain select-none"
                />
              </div>
            </div>

            {/* Right Column: Pill + Huge Heading + Subtitle */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="bg-[#5da36c] text-white text-sm font-bold px-6 py-1.5 rounded-full mb-6 shadow-xs">
                Student Agency and Trust
              </span>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#5da36c] leading-[0.95] mb-6">
                Built for hard days.<br />Verified for real<br />accountability.
              </h2>
              <p className="text-2xl sm:text-3xl text-[#6ba293] leading-snug max-w-2xl">
                Three purpose-built capabilities that turn contested screenshots into routed, auditable evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions / FAQ Section */}
      <Section id="faq" tone="card" eyebrow="Questions" title="Common questions" center>
        <Faq items={faq} />
      </Section>

      {/* CTA Band */}
      <CtaBand
        title="Start your vault today"
        lead="Capture what happened now, and decide what to do with it later. It's private until you choose to share."
      >
        <Link
          href="/sign-up"
          className="bg-white text-[#5da36c] hover:bg-brand-50 font-bold text-base px-7 py-3 rounded-full transition shadow-sm"
        >
          Start your vault
        </Link>
        <Link
          href="#how"
          className="text-white hover:text-brand-100 font-bold text-base px-6 py-3 rounded-full border border-white/30 hover:border-white transition"
        >
          See how it works
        </Link>
      </CtaBand>
    </div>
  );
}
