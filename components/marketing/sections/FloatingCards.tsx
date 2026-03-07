import { heroContent } from "~/data/heroContent";
import { Brain, Zap, FileText } from "lucide-react";

// Visual treatment + animation params per card — separated from position data
const CARD_ANIM = {
    profiler: {
        opacityClass: "opacity-[0.28]",
        blurClass:    "blur-[2px]",
        scaleClass:   "scale-[0.80]",
        entryDelay:   "0.3s",
        floatDelay:   "1.1s",
        floatDuration:"4.2s",
        shadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    "gap-analyzer": {
        opacityClass: "opacity-[0.75]",
        blurClass:    "",
        scaleClass:   "scale-[0.90]",
        entryDelay:   "0.5s",
        floatDelay:   "1.3s",
        floatDuration:"4.8s",
        shadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
    },
    report: {
        opacityClass: "opacity-100",
        blurClass:    "",
        scaleClass:   "scale-100",
        entryDelay:   "0.7s",
        floatDelay:   "1.5s",
        floatDuration:"3.9s",
        shadow: "0 24px 64px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.10)",
    },
} as const;

export default function FloatingCards() {
    return (
        <div className="relative h-full w-full max-w-[600px] flex flex-col items-end justify-center">

            {/* ── Glow layer 1: primary ambient, upper-right radial ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse 75% 65% at 88% 12%, rgba(255,255,255,0.072) 0%, rgba(255,255,255,0.02) 46%, transparent 72%)"
                }}
            />

            {/* ── Glow layer 2: mid-section fill ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse 52% 52% at 70% 60%, rgba(255,255,255,0.030) 0%, transparent 64%)"
                }}
            />

            {/* ── Glow layer 3: right-edge front strip (the "light from the right" effect) ── */}
            <div
                className="absolute top-0 right-0 w-[26%] h-full pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse 100% 65% at 100% 22%, rgba(255,255,255,0.048) 0%, transparent 62%)"
                }}
            />

            {/* ── Prompt Bubble ── */}
            <div
                className="absolute top-[2%] right-[5%] z-30 border border-white/[0.08] rounded-2xl rounded-tr-sm px-4 py-3 w-[225px] lg:w-[265px]"
                style={{
                    background: "linear-gradient(145deg, rgba(16,16,16,0.97) 0%, rgba(9,9,9,0.99) 100%)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
                    animation: "m-card-entry 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both",
                }}
            >
                {/* Top highlight strip */}
                <div className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
                <p className="text-[11.5px] text-white/60 leading-relaxed font-normal">
                    {heroContent.promptBubble}
                </p>
            </div>

            {/* ── Cards wrapper ── */}
            <div className="relative w-full h-[600px]">
                {heroContent.floatingCards.map((card) => {
                    let Icon = Brain;
                    if (card.id === "gap-analyzer") Icon = Zap;
                    if (card.id === "report")        Icon = FileText;

                    const anim = CARD_ANIM[card.id as keyof typeof CARD_ANIM];

                    return (
                        // Outer: absolute position + entry animation (opacity 0→1, translateY)
                        <div
                            key={card.id}
                            className={`absolute ${card.positionClass}`}
                            style={{
                                animation: `m-card-entry 0.9s cubic-bezier(0.16,1,0.3,1) ${anim.entryDelay} both`,
                            }}
                        >
                            {/* Inner: opacity/blur/scale + float animation + glossy card visuals */}
                            <div
                                className={`
                                    relative overflow-hidden rounded-2xl border border-white/[0.08]
                                    w-[262px] md:w-[308px] lg:w-[350px]
                                    ${anim.opacityClass} ${anim.blurClass} ${anim.scaleClass}
                                `}
                                style={{
                                    background: "linear-gradient(145deg, rgba(17,17,17,0.97) 0%, rgba(9,9,9,0.99) 100%)",
                                    boxShadow: anim.shadow,
                                    animation: `m-card-float ${anim.floatDuration} ease-in-out ${anim.floatDelay} infinite`,
                                }}
                            >
                                {/* Glossy top-edge highlight */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.13] to-transparent" />

                                <div className="p-5">
                                    {/* Platform badge */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-[5px] bg-white/[0.05] rounded-full border border-white/[0.06] w-fit mb-3.5">
                                        <Icon className={`w-[11px] h-[11px] ${card.logoColor}`} strokeWidth={2.5} />
                                        <span className={`text-[11px] font-semibold tracking-wide ${card.logoColor}`}>
                                            {card.name}
                                        </span>
                                    </div>

                                    <p className="text-[11.5px] text-white/50 leading-[1.65] whitespace-pre-wrap font-normal">
                                        {card.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
