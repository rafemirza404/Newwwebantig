import type { FunctionScore } from "../page";

const FUNCTION_LABELS: Record<string, string> = {
  sales: "Sales",
  operations: "Operations",
  technology: "Technology",
  marketing: "Marketing",
  customer_service: "Customer Service",
  customer_support: "Customer Support",
  finance: "Finance",
  hr: "HR",
  strategy: "Strategy",
  data_reporting: "Data & Reporting",
  customer_onboarding: "Onboarding",
};

const STATUS_CONFIG = {
  below: { label: "Below avg", color: "#F87171" },
  on_par: { label: "On par", color: "#F59E0B" },
  above: { label: "Above avg", color: "#4ADE80" },
};

function getScoreColor(score: number): string {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#F59E0B";
  return "#F87171";
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Developing";
  return "Critical Gap";
}

interface ScoreSectionProps {
  overall: number;
  functionScores: Record<string, number>;
  richFunctionScores?: Record<string, FunctionScore>;
  summary: string;
}

export default function ScoreSection({
  overall,
  functionScores,
  richFunctionScores,
  summary,
}: ScoreSectionProps) {
  const scoreColor = getScoreColor(overall);
  const scoreLabel = getScoreLabel(overall);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (overall / 100) * circ;

  const hasIndustryData = Object.values(richFunctionScores ?? {}).some(
    (s) => s.industry_average !== undefined
  );

  return (
    <section className="pt-8">
      {/* Executive summary card */}
      <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Circular score */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-sm">
              <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" className="text-secondary" strokeWidth="10" />
              <circle
                cx="70" cy="70" r={r}
                fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
              />
              <text x="70" y="66" textAnchor="middle" fill="currentColor" className="text-foreground" fontSize="34" fontWeight="600" letterSpacing="-1">
                {overall}
              </text>
              <text x="70" y="86" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="12" fontWeight="500" letterSpacing="0.5">
                / 100
              </text>
            </svg>
            <p className="text-center text-[13px] font-semibold mt-4 uppercase tracking-[0.08em]" style={{ color: scoreColor }}>
              {scoreLabel}
            </p>
          </div>

          {/* Summary text */}
          <div className="flex-1 md:mt-2">
            <h2 className="text-foreground font-medium text-[24px] tracking-tight mb-4">Executive Summary</h2>
            <p className="text-muted-foreground text-[15px] leading-relaxed max-w-2xl">{summary}</p>
          </div>
        </div>
      </div>

      {/* Function scores */}
      <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8">
        <h3 className="text-foreground font-medium text-[20px] mb-8 tracking-tight">AI Maturity by Function</h3>
        <div className="space-y-6">
          {Object.entries(functionScores).map(([fn, score]) => {
            const color = getScoreColor(score);
            const rich = richFunctionScores?.[fn];
            const industryAvg = rich?.industry_average;
            const status = rich?.status;
            const rationale = rich?.score_rationale;
            const statusCfg = status ? STATUS_CONFIG[status] : null;

            return (
              <div key={fn}>
                {/* Bar row */}
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-[13px] font-medium uppercase tracking-[0.08em] w-36 flex-shrink-0">
                    {FUNCTION_LABELS[fn] ?? fn}
                  </span>
                  <div className="flex-1 relative">
                    <div className="bg-secondary rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${score}%`, backgroundColor: color }}
                      />
                    </div>
                    {industryAvg !== undefined && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full opacity-70"
                        style={{ left: `${industryAvg}%`, backgroundColor: "#94A3B8" }}
                        title={`Industry avg: ${industryAvg}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 w-20 justify-end flex-shrink-0">
                    <span className="text-[14px] font-medium tabular-nums" style={{ color }}>
                      {score}
                    </span>
                    {industryAvg !== undefined && (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        / {industryAvg}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge + rationale */}
                {(statusCfg || rationale) && (
                  <div className="ml-40 flex items-start gap-2 mt-1.5">
                    {statusCfg && (
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: `${statusCfg.color}18`, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    )}
                    {rationale && (
                      <p className="text-muted-foreground text-[12px] leading-relaxed line-clamp-2">
                        {rationale}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {hasIndustryData && (
          <div className="flex items-center gap-6 mt-8 pt-4 border-t border-border/20 text-[12px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 bg-[#94A3B8] rounded-full opacity-70" />
              <span>Industry average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 rounded-full bg-[#4ADE80]" />
              <span>Your score</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
