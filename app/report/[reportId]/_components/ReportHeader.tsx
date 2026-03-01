import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

interface ReportHeaderProps {
  businessName: string;
  industry: string | null;
  createdAt: string;
  isPro: boolean;
}

export default function ReportHeader({ businessName, industry, createdAt, isPro }: ReportHeaderProps) {
  const date = createdAt ? new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }) : "";

  return (
    <header className="border-b border-border/10 sticky top-0 z-10 bg-background/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/reports"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-foreground font-bold tracking-tight text-lg">{businessName}</h1>
            <p className="text-muted-foreground text-[13px] font-medium mt-0.5">
              {industry ? `${industry} · ` : ""}{date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isPro && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-500 text-xs font-semibold tracking-wide uppercase">Free Preview</span>
            </div>
          )}
          {isPro && (
            <span className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider shadow-sm">
              Pro Report
            </span>
          )}
          <div className="h-6 w-[1px] bg-border/50 mx-2" />
          <Link
            href="/dashboard"
            className="flex items-center justify-center px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
