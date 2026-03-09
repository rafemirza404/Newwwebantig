import React from "react";
import { heroContent } from "~/data/heroContent";
import { Brain, Zap, FileText } from "lucide-react";

const CARD_ANIM = {
  profiler: {
    opacity: 0.62,
    zIndex: "z-10",
  },
  "gap-analyzer": {
    opacity: 0.88,
    zIndex: "z-20",
  },
  report: {
    opacity: 1,
    zIndex: "z-30",
  },
} as const;

// Solid dark card — matches reference aesthetic
const SOLID_CARD: React.CSSProperties = {
  background: "#0c0c10",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow:
    "0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
  borderRadius: "14px",
};

export default function FloatingCards() {
  return (
    // Radial mask on entire cluster — fades all edges naturally into bg, no hard clip
    <div
      className="relative h-full w-full max-w-[560px] flex flex-col items-end justify-center"
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 86% at 52% 50%, black 18%, rgba(0,0,0,0.88) 42%, rgba(0,0,0,0.45) 64%, transparent 82%)",
        maskImage:
          "radial-gradient(ellipse 90% 86% at 52% 50%, black 18%, rgba(0,0,0,0.88) 42%, rgba(0,0,0,0.45) 64%, transparent 82%)",
      }}
    >
      {/* ── Soft glow bloom behind cards ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(50,65,100,0.12) 0%, transparent 65%)",
        }}
      />

      {/* ── Prompt Bubble ── */}
      <div
        className="absolute top-[6%] lg:top-[10%] right-[14%] z-40 px-4 py-3 w-[260px]"
        style={SOLID_CARD}
      >
        <p className="text-[12.5px] text-[#999] leading-[1.55] font-normal">
          {heroContent.promptBubble}
        </p>
      </div>

      {/* ── Cards wrapper ── */}
      <div className="relative w-full h-[580px]">
        {heroContent.floatingCards.map((card) => {
          let Icon = Brain;
          if (card.id === "gap-analyzer") Icon = Zap;
          if (card.id === "report") Icon = FileText;

          const anim = CARD_ANIM[card.id as keyof typeof CARD_ANIM];

          return (
            <div
              key={card.id}
              className={`absolute ${card.positionClass} ${anim.zIndex}`}
              style={{ opacity: anim.opacity }}
            >
              <div
                className="relative overflow-hidden w-[240px] md:w-[270px] lg:w-[300px]"
                style={SOLID_CARD}
              >
                <div className="px-4 py-4">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white/[0.06] border border-white/[0.07] flex-shrink-0">
                      <Icon
                        className={`w-3 h-3 ${card.logoColor}`}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className={`text-[11.5px] font-semibold tracking-wide ${card.logoColor}`}
                    >
                      {card.name}
                    </span>
                  </div>

                  {/* Subtle divider */}
                  <div className="w-full h-px bg-white/[0.05] mb-3" />

                  {/* Content */}
                  <div className="space-y-2">
                    {card.content.split("\n\n").map((block, idx) => (
                      <p
                        key={idx}
                        className={`text-[12px] leading-[1.6] whitespace-pre-wrap ${idx === 0 ? "text-white/75 font-medium" : "text-white/40 font-normal"}`}
                      >
                        {block}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
