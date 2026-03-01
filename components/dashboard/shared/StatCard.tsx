"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  accent?: string;
  href?: string;
  hrefLabel?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  delta,
  deltaPositive,
}: StatCardProps) {
  return (
    <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 flex flex-col min-h-[140px] transition-colors gap-3 justify-between">
      {/* Top row: label */}
      <h3 className="text-muted-foreground text-[13px] font-medium tracking-wide">{label}</h3>

      {/* Big number */}
      <p className="text-foreground text-[28px] font-bold tracking-tight">{value}</p>

      {/* Subtitle / delta */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border mt-auto w-full">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
          {delta ?? subtitle ?? "Vs Last month"}
        </span>
      </div>
    </div>
  );
}
