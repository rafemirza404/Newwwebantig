const FUNCTION_LABELS: Record<string, string> = {
  sales: "Sales",
  operations: "Operations",
  technology: "Technology",
  marketing: "Marketing",
  customer_service: "Customer Service",
  finance: "Finance",
  hr: "HR",
  strategy: "Strategy",
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
  summary: string;
}

export default function ScoreSection({ overall, functionScores, summary }: ScoreSectionProps) {
  const scoreColor = getScoreColor(overall);
  const scoreLabel = getScoreLabel(overall);

  // Circumference for the ring
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (overall / 100) * circ;

  return (
    <section className="pt-8">
      {/* Executive summary card */}
      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Circular score */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-sm">
              {/* Track */}
              <circle
                cx="70" cy="70" r={r}
                fill="none"
                stroke="currentColor"
                className="text-secondary"
                strokeWidth="10"
              />
              {/* Progress */}
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
              {/* Score text */}
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
      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8">
        <h3 className="text-foreground font-medium text-[20px] mb-8 tracking-tight">AI Maturity by Function</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          {Object.entries(functionScores).map(([fn, score]) => {
            const color = getScoreColor(score);
            return (
              <div key={fn} className="flex items-center gap-4">
                <span className="text-muted-foreground text-[13px] font-medium uppercase tracking-[0.08em] w-40 flex-shrink-0">
                  {FUNCTION_LABELS[fn] ?? fn}
                </span>
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-[14px] font-medium w-10 text-right tabular-nums" style={{ color }}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
