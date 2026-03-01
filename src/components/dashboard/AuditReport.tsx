"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { AuditResult, Recommendation } from '@/services/audit/recommendations';
import { CalendarBooking } from '@/components/CalendarBooking';
import { Button } from '@/components/ui/button';
import { RotateCcw, CheckCircle2, AlertCircle, Info, Download, FileText } from 'lucide-react';

type Props = {
  userId: string;
  onRetake: () => void;
};

const priorityConfig = {
  critical: {
    label: 'Critical Priority',
    color: 'text-red-600',
    bg: 'bg-white',
    border: 'border-l-[3px] border-l-red-500 border border-slate-200/80',
    dot: 'bg-red-500',
    icon: AlertCircle,
  },
  high: {
    label: 'High Priority',
    color: 'text-amber-600',
    bg: 'bg-white',
    border: 'border-l-[3px] border-l-amber-500 border border-slate-200/80',
    dot: 'bg-amber-500',
    icon: CheckCircle2,
  },
  medium: {
    label: 'Recommended',
    color: 'text-[#4F7CFF]',
    bg: 'bg-white',
    border: 'border-l-[3px] border-l-[#4F7CFF] border border-slate-200/80',
    dot: 'bg-[#4F7CFF]',
    icon: Info,
  },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const strokeColor = score >= 60 ? '#10B981' : score >= 35 ? '#F59E0B' : '#4F7CFF';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="7" />
        <motion.circle
          cx="56" cy="56" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="text-center absolute">
        <span className="text-3xl font-bold text-slate-900 leading-none tracking-tight">{score}</span>
        <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">/ 100</span>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const cfg = priorityConfig[rec.priority];
  const PriorityIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.12, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(15,23,42,0.08)' }}
      className={`rounded-xl p-6 md:p-7 transition-shadow duration-200 cursor-default ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl filter grayscale contrast-125 opacity-90 select-none hidden sm:block">
            {rec.icon}
          </span>
          <h3 className="text-slate-900 font-bold text-base tracking-tight">{rec.title}</h3>
        </div>
        <div className={`flex items-center gap-1.5 shrink-0 text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-md ${cfg.color}`}>
          <PriorityIcon className="w-3 h-3" />
          {cfg.label}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">Problem identified</p>
          <p className="text-slate-700 font-medium leading-relaxed text-[13px]">{rec.problem}</p>
        </div>
        <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100/60">
          <p className="text-[#4F7CFF] text-[10px] uppercase tracking-widest font-bold mb-2">AgentBlue solution</p>
          <p className="text-slate-800 font-medium leading-relaxed text-[13px]">{rec.solution}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span className="font-bold text-[10px] uppercase tracking-widest text-emerald-600">Expected Impact:</span>
        <span className="font-semibold text-[13px] text-emerald-700">{rec.outcome}</span>
      </div>
    </motion.div>
  );
}

export default function AuditReport({ userId, onRetake }: Props) {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAudit = async () => {
      const { data } = await supabase
        .from('audits')
        .select('recommendations')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.recommendations) {
        setResult(data.recommendations as AuditResult);
      }
      setLoading(false);
    };

    fetchLatestAudit();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="w-8 h-8 border-2 border-[#4F7CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6 bg-white">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-2 border border-slate-100">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-sm">No completed audit found yet.</p>
        <Button onClick={onRetake} className="bg-[#4F7CFF] hover:bg-blue-600 text-white shadow-sm rounded-xl px-6">
          Start Your Audit
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full px-5 sm:px-8 py-8 space-y-6 font-sans">

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
          <ScoreRing score={result.score} />
          <div className="flex-1 mt-1">
            <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md mb-3">
              Automation Readiness Profile
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              {result.profileBadge}
            </h2>
            <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed max-w-2xl">
              {result.profileDescription}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recommendations Feed */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-4"
        >
          <h3 className="text-slate-900 font-bold text-base tracking-tight">Your Action Plan</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {result.recommendations.length} recommendations
          </span>
        </motion.div>

        <div className="space-y-4">
          {result.recommendations.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} />
          ))}
        </div>
      </div>

      {/* Action CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, ease: 'easeOut' }}
        className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-7 sm:p-8 text-center"
      >
        <div className="max-w-xl mx-auto">
          <h3 className="text-slate-900 font-bold text-xl tracking-tight mb-3">Let's build this.</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Ready to turn this roadmap into reality? Book a free strategy call to discuss implementation timelines and exact costs for your specific setup.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <CalendarBooking
              buttonText="Book Strategy Call"
              buttonClassName="w-full sm:w-auto bg-[#4F7CFF] hover:bg-blue-600 text-white font-medium px-8 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            />

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium px-4 rounded-xl"
                title="Coming soon"
              >
                <Download className="w-4 h-4 mr-2 text-slate-400" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={onRetake}
                className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium px-4 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-slate-400" />
                Retake
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
