import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { heroContent } from "~/data/heroContent";
import FloatingCards from "./FloatingCards";

export default function HeroSection() {
    return (
        <section className="relative min-h-[85vh] flex items-center pt-20 pb-10 overflow-hidden bg-black text-white">

            {/* Section-level right ambient glow — mirrors reference's right-side brightness */}
            <div
                className="absolute top-0 right-0 w-[55%] h-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse 90% 80% at 100% 20%, rgba(255,255,255,0.048) 0%, transparent 68%)"
                }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-4 items-center">

                    {/* ── Left Column ── */}
                    <div className="flex flex-col space-y-4 max-w-xl py-6">

                        {/* H1 — two-line, second italic with vertical gradient */}
                        <h1
                            className="text-[36px] md:text-[46px] lg:text-[54px] font-light tracking-[-0.03em] leading-[1.07] mb-1"
                            style={{ animation: "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
                        >
                            <span className="block text-white/90">
                                {heroContent.h1.start}
                            </span>
                            <span className="block italic text-transparent bg-clip-text bg-gradient-to-b from-white/90 to-white/40">
                                {heroContent.h1.end}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="text-[17px] md:text-[19px] font-semibold text-white leading-snug"
                            style={{ animation: "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}
                        >
                            {heroContent.subtitle}
                        </p>

                        {/* Paragraph */}
                        <p
                            className="text-[14px] md:text-[15px] text-white/55 font-normal max-w-md leading-relaxed"
                            style={{ animation: "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}
                        >
                            {heroContent.paragraph}
                        </p>

                        {/* Checklist */}
                        <ul
                            className="space-y-2.5 pt-1"
                            style={{ animation: "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.42s both" }}
                        >
                            {heroContent.checklist.map((item, index) => (
                                <li key={index} className="flex items-center gap-2.5 text-white/55">
                                    <CheckCircle2
                                        strokeWidth={1.5}
                                        className="w-[16px] h-[16px] text-white/45 flex-shrink-0"
                                    />
                                    <span className="text-[13px] md:text-[14px] font-normal">{item}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Group */}
                        <div
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3"
                            style={{ animation: "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.52s both" }}
                        >
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-full font-semibold text-[13px] text-center transition-all duration-200"
                            >
                                Start Free Audit
                            </Link>
                            <Link
                                href="/demo"
                                className="w-full sm:w-auto bg-transparent hover:bg-white/[0.04] border border-white/20 text-white px-6 py-2.5 rounded-full font-semibold text-[13px] text-center transition-all duration-200"
                            >
                                Book a Demo
                            </Link>
                        </div>

                        {/* Microcopy */}
                        <p
                            className="text-[12px] text-white/30 font-normal pt-1"
                            style={{ animation: "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.62s both" }}
                        >
                            {heroContent.microcopy}
                        </p>
                    </div>

                    {/* ── Right Column: Floating Cards ── */}
                    <div className="relative w-full h-[540px] lg:h-[620px] flex items-center justify-center lg:justify-end xl:pl-8">
                        <FloatingCards />
                    </div>

                </div>
            </div>
        </section>
    );
}
