"use client";

interface ScoreBarProps {
  label: string;
  score: number; // 0-100
  maxScore?: number;
}

function getScoreColor(score: number) {
  if (score >= 70) return "var(--success)";
  if (score >= 40) return "var(--info)";
  return "var(--danger)";
}

export default function ScoreBar({ label, score, maxScore = 100 }: ScoreBarProps) {
  const pct = Math.min(100, (score / maxScore) * 100);
  const color = getScoreColor(score);

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm w-32 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-foreground text-sm font-medium w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
