"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Zap, Globe, Brain, Users, Laptop, MapPin, Clock, Building2 } from "lucide-react";
import SectionBadge from "~/components/marketing/SectionBadge";
import { useScrollReveal } from "~/hooks/useScrollReveal";

const values = [
    {
        icon: Brain,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        title: "Think in First Principles",
        description: "We don't copy what others do. We reason from the ground up. Every product decision, every client call, every line of code is questioned.",
    },
    {
        icon: Zap,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        title: "Bias Toward Doing",
        description: "We ship. We iterate. A good idea in production beats a perfect idea in planning. If you're comfortable waiting for permission, you won't thrive here.",
    },
    {
        icon: Globe,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        title: "Remote, Async, Intentional",
        description: "We're a distributed team. We write things down, respect time zones, and default to async communication. Being online ≠ being productive.",
    },
    {
        icon: Users,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        title: "Client Outcomes Over Activity",
        description: "We measure success by what actually changes for our clients—not meetings held, not reports sent. ROI is the only scorecard that matters.",
    },
];

const openRoles = [
    {
        title: "Senior AI/Automation Engineer",
        team: "Engineering",
        location: "Remote",
        type: "Full-time",
        badge: "Hiring",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        description: "Build the AI pipeline that powers our client audits — LLM orchestration, RAG systems, workflow automation across n8n/Make/Zapier.",
        tags: ["Python", "LangChain", "n8n", "OpenAI API", "Supabase"],
    },
    {
        title: "Product Designer (0→1)",
        team: "Design",
        location: "Remote",
        type: "Full-time",
        badge: "Hiring",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        description: "Own the design of our dashboard, client portal, and audit experience from concept to production. You'll work directly with the founder.",
        tags: ["Figma", "Systems Thinking", "SaaS UX", "Dark Mode Obsession"],
    },
    {
        title: "Operations Consultant (Contract)",
        team: "Consulting",
        location: "Remote",
        type: "Contract",
        badge: "Open",
        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        description: "Deliver AgentBlue-powered audits to clients across solar, HVAC, and professional services. You're the expert. We're the engine.",
        tags: ["Consulting", "Process Mapping", "AI Literacy", "Client-Facing"],
    },
    {
        title: "Growth & Partnerships Lead",
        team: "Go-to-Market",
        location: "Remote",
        type: "Full-time",
        badge: "Coming Soon",
        badgeColor: "text-white/40 bg-white/5 border-white/10",
        description: "Own our agency and consultant channel — recruit partners, set up co-sell programs, and build the distribution flywheel.",
        tags: ["B2B SaaS", "Channel Sales", "Outbound", "Agency Networks"],
    },
];

const perks = [
    { icon: Laptop, label: "Full Remote", sub: "Work from anywhere" },
    { icon: Clock, label: "Async-First", sub: "No pointless standups" },
    { icon: Globe, label: "Global Team", sub: "Timezone-flexible" },
    { icon: Building2, label: "Equity Available", sub: "For senior roles" },
];

export default function CareersPage() {
    const heroRef = useScrollReveal();

    return (
        <>
            {/* 1. Hero */}
            <section className="relative pt-40 pb-32 overflow-hidden border-b border-white/[0.05]">
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-600/6 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/6 rounded-full blur-[120px] pointer-events-none" />

                <div ref={heroRef} className="m-container relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionBadge label="WE'RE HIRING" className="m-reveal mb-8 flex justify-center" color="emerald" />
                        <h1
                            className="m-reveal m-reveal-delay-1 text-[42px] md:text-[58px] lg:text-[66px] font-light tracking-[-0.03em] leading-[1.05] mb-8 text-transparent bg-clip-text"
                            style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}
                        >
                            Build the infrastructure<br />that makes AI actually work.
                        </h1>
                        <p className="m-reveal m-reveal-delay-2 text-[17px] md:text-[19px] text-white/50 mb-12 font-normal leading-relaxed max-w-2xl mx-auto">
                            We're a small, focused team rethinking how businesses adopt AI — starting with honest diagnosis, not hype. Join us if you want your work to matter.
                        </p>
                        <div className="m-reveal m-reveal-delay-3 flex flex-wrap items-center justify-center gap-3">
                            {perks.map((perk, i) => {
                                const Icon = perk.icon;
                                return (
                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-[13px] text-white/60">
                                        <Icon className="w-3.5 h-3.5 text-white/40" />
                                        <span className="font-medium text-white/80">{perk.label}</span>
                                        <span className="text-white/30">·</span>
                                        <span>{perk.sub}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Values */}
            <section className="py-32 border-b border-white/[0.05]">
                <div className="m-container">
                    <div className="text-center mb-16">
                        <SectionBadge label="HOW WE WORK" className="mb-6 flex justify-center" color="emerald" />
                        <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] text-transparent bg-clip-text"
                            style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                            What it's like to work here.
                        </h2>
                        <p className="text-[15px] text-white/40 mt-4 max-w-xl mx-auto">
                            We're not for everyone. We're for people who want to move fast, think deeply, and see their work ship to real businesses.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-0 border border-white/[0.07] rounded-2xl overflow-hidden">
                        {values.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <div
                                    key={i}
                                    className={`p-10 bg-[#050505] ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""} border-white/[0.07]`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${v.bg} border ${v.border} flex items-center justify-center mb-6`}>
                                        <Icon className={`w-5 h-5 ${v.color}`} />
                                    </div>
                                    <h3 className="text-[18px] font-semibold text-white mb-3">{v.title}</h3>
                                    <p className="text-[14px] text-zinc-400 leading-relaxed">{v.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. Open Roles */}
            <section className="py-32 border-b border-white/[0.05] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-600/4 rounded-full blur-[120px] pointer-events-none" />
                <div className="m-container relative z-10">
                    <div className="text-center mb-16">
                        <SectionBadge label="OPEN ROLES" className="mb-6 flex justify-center" color="emerald" />
                        <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] text-transparent bg-clip-text"
                            style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                            Find your place on the team.
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {openRoles.map((role, i) => (
                            <div
                                key={i}
                                className="group border border-white/[0.07] rounded-2xl bg-[#050505] overflow-hidden hover:border-white/[0.12] transition-all"
                            >
                                <div className="p-7 flex flex-col md:flex-row md:items-start gap-5">
                                    {/* Left content */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                            <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest ${role.badgeColor}`}>
                                                {role.badge}
                                            </span>
                                            <span className="text-[11px] text-white/30 font-mono">{role.team}</span>
                                        </div>
                                        <h3 className="text-[19px] font-semibold text-white mb-2">{role.title}</h3>
                                        <p className="text-[14px] text-zinc-400 leading-relaxed mb-4 max-w-2xl">{role.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {role.tags.map((tag, ti) => (
                                                <span key={ti} className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px] text-white/50 font-mono">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right metadata + CTA */}
                                    <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 text-[12px] text-white/40">
                                                <MapPin className="w-3 h-3" />
                                                <span>{role.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[12px] text-white/40">
                                                <Clock className="w-3 h-3" />
                                                <span>{role.type}</span>
                                            </div>
                                        </div>
                                        {role.badge !== "Coming Soon" ? (
                                            <a
                                                href={`mailto:team@agentblue.ai?subject=Application: ${role.title}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-black rounded-xl text-[13px] font-semibold hover:bg-white/90 transition-all group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                            >
                                                Apply Now <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <div className="px-4 py-2.5 border border-white/[0.07] rounded-xl text-[13px] text-white/30">
                                                Not open yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No role fits note */}
                    <div className="mt-8 p-6 border border-white/[0.05] rounded-2xl bg-[#050505] text-center">
                        <p className="text-[14px] text-white/40 mb-3">Don't see a role that fits? We always want to hear from exceptional people.</p>
                        <a
                            href="mailto:team@agentblue.ai?subject=General Application"
                            className="inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white transition-colors font-medium"
                        >
                            Send us a cold email <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* 4. CTA */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/6 rounded-full blur-[120px] pointer-events-none" />
                <div className="m-container relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-6 text-transparent bg-clip-text"
                        style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 40%, white 100%)" }}>
                        Small team. Big mission.<br />Real impact.
                    </h2>
                    <p className="text-[16px] text-white/40 mb-10 max-w-lg mx-auto">
                        We're not here to build another SaaS. We're here to change how businesses think about AI — one honest audit at a time.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="mailto:team@agentblue.ai?subject=I Want to Join AgentBlue"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-[15px] hover:bg-white/90 transition-all"
                        >
                            Reach Out <ArrowRight className="w-4 h-4" />
                        </a>
                        <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white/70 rounded-xl font-medium text-[15px] hover:border-white/20 hover:text-white transition-all">
                            Learn About Us <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
