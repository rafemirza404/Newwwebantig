"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, Layers, ClipboardList } from 'lucide-react';
import { AUDIT_QUESTIONS } from '@/config/auditQuestions';
import { generateAuditResult } from '@/services/audit/recommendations';
import type { AuditAnswers } from '@/services/audit/auditBot';
import { DOMAIN_QUESTIONS, DOMAIN_META } from './domains';

type Props = {
  currentQuestionIndex: number;
  auditAnswers: AuditAnswers;
  auditComplete: boolean;
  userId: string;
};

type TabId = 'gaps' | 'roi' | 'stack' | 'log';

const TABS: { id: TabId; label: string }[] = [
  { id: 'gaps', label: 'Gaps' },
  { id: 'roi', label: 'ROI' },
  { id: 'stack', label: 'Stack' },
  { id: 'log', label: 'Log' },
];

const priorityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-400',
  medium: 'bg-[#2563EB]',
};

const priorityBadge: Record<string, string> = {
  critical: 'text-red-600 border-red-200 bg-red-50',
  high: 'text-amber-600 border-amber-200 bg-amber-50',
  medium: 'text-[#2563EB] border-blue-200 bg-blue-50',
};

const priorityLabel: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Recommended',
};

export default function IntelligencePanel({ currentQuestionIndex, auditAnswers, auditComplete, userId: _userId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('gaps');

  const answeredCount = Object.keys(auditAnswers).length;
  const totalQuestions = AUDIT_QUESTIONS.length;

  const partialResult = useMemo(() => {
    if (answeredCount === 0) return null;
    return generateAuditResult(auditAnswers);
  }, [auditAnswers, answeredCount]);

  const domainProgress = useMemo(() =>
    Object.entries(DOMAIN_QUESTIONS).map(([domain, questions]) => {
      const answered = questions.filter(q => auditAnswers[q] !== undefined).length;
      const total = questions.length;
      const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
      return { domain, answered, total, pct, ...DOMAIN_META[domain] };
    }),
    [auditAnswers]
  );

  const contextAnswers = useMemo(() =>
    AUDIT_QUESTIONS
      .filter(q => auditAnswers[q.id] !== undefined)
      .slice(0, 3)
      .map(q => ({
        snippet: q.text.length > 38 ? q.text.slice(0, 38) + '…' : q.text,
        answer: q.options.find(o => o.value === auditAnswers[q.id])?.label ?? auditAnswers[q.id],
      })),
    [auditAnswers]
  );

  const stackInfo = useMemo(() => {
    const toolsVal = auditAnswers.automation_tools;
    const followVal = auditAnswers.follow_up_method;
    const tools = toolsVal
      ? AUDIT_QUESTIONS.find(q => q.id === 'automation_tools')?.options.find(o => o.value === toolsVal)?.label
      : null;
    const followMethod = followVal
      ? AUDIT_QUESTIONS.find(q => q.id === 'follow_up_method')?.options.find(o => o.value === followVal)?.label
      : null;
    return { tools, followMethod };
  }, [auditAnswers]);

  const logEntries = useMemo(() =>
    AUDIT_QUESTIONS
      .filter(q => auditAnswers[q.id] !== undefined)
      .map((q, idx) => ({
        index: idx + 1,
        questionId: q.id,
        answer: q.options.find(o => o.value === auditAnswers[q.id])?.label ?? auditAnswers[q.id],
      })),
    [auditAnswers]
  );

  const isAgentActive = !auditComplete && answeredCount < totalQuestions;

  return (
    <aside className="flex flex-col w-[300px] h-full bg-white shrink-0">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span className="text-[13px] font-bold text-[#0F172A]">Intelligence</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isAgentActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-[#64748B]'
        }`}>
          {isAgentActive ? '● Active' : '○ Idle'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] px-2 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-3 py-3 text-[12px] font-semibold transition-colors ${
              activeTab === tab.id ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="ip-tab-bar"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB] rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── GAPS ─────────────────────────────── */}
        {activeTab === 'gaps' && (
          <div className="p-4 space-y-5">
            {/* Status badge */}
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                auditComplete
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${auditComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {auditComplete ? 'Complete' : 'In Progress'}
              </span>
            </div>

            {/* Efficiency Score */}
            <div className="bg-[#F4F5F7] rounded-[8px] px-4 py-3">
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Efficiency Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#0F172A]">
                  {partialResult?.score ?? '—'}
                </span>
                {partialResult && (
                  <span className="text-[11px] text-[#64748B] font-medium">/ 100</span>
                )}
              </div>
              {partialResult && (
                <p className="text-[11px] text-[#64748B] mt-1 leading-snug line-clamp-2">
                  {partialResult.profileBadge}
                </p>
              )}
            </div>

            {/* Domain progress bars */}
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Live Gaps</p>
              <div className="space-y-3">
                {domainProgress.map(({ domain, pct, label, emoji }) => (
                  <div key={domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[#0F172A] font-medium flex items-center gap-1.5">
                        <span className="text-sm leading-none">{emoji}</span>
                        {label}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F4F5F7] rounded-full overflow-hidden border border-[#E2E8F0]">
                      <motion.div
                        className={`h-full rounded-full ${
                          pct === 0 ? 'bg-slate-200' : pct === 100 ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                        animate={{ width: `${pct}%` }}
                        initial={{ width: '0%' }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agent */}
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-2.5">AI Agents</p>
              <div className="flex items-center justify-between bg-[#F4F5F7] rounded-[8px] px-3 py-2.5 border border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[6px] bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#0F172A] leading-none">Atlas</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Question Engine</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAgentActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-[#64748B]'
                }`}>
                  {isAgentActive ? 'Active' : 'Idle'}
                </span>
              </div>
            </div>

            {/* Context */}
            {contextAnswers.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-2.5">Context</p>
                <div className="space-y-2">
                  {contextAnswers.map((c, i) => (
                    <div key={i} className="bg-[#F4F5F7] rounded-[8px] px-3 py-2.5 border border-[#E2E8F0]">
                      <p className="text-[10px] text-[#64748B] mb-0.5 truncate">{c.snippet}</p>
                      <p className="text-[12px] font-medium text-[#0F172A]">{c.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROI ──────────────────────────────── */}
        {activeTab === 'roi' && (
          <div className="p-4 space-y-3">
            {answeredCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F4F5F7] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#64748B]" />
                </div>
                <p className="text-[13px] text-[#64748B] font-medium leading-snug max-w-[180px]">
                  Answer questions to unlock your ROI analysis
                </p>
              </div>
            ) : (
              <>
                {!auditComplete && (
                  <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-2">
                    <p className="text-[11px] text-amber-700 font-medium leading-snug">
                      Complete all {totalQuestions} questions for your full personalized report
                    </p>
                  </div>
                )}
                {partialResult?.recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[#F4F5F7] rounded-[8px] p-3 border border-[#E2E8F0]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[12px] font-semibold text-[#0F172A] flex items-center gap-1.5 flex-1">
                        <span className="shrink-0">{rec.icon}</span>
                        <span className="truncate">{rec.title}</span>
                      </p>
                      <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide shrink-0 px-1.5 py-0.5 rounded-full border ${priorityBadge[rec.priority]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[rec.priority]}`} />
                        {priorityLabel[rec.priority]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">{rec.problem}</p>
                    <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                      <p className="text-[10px] text-emerald-600 font-semibold leading-snug">{rec.outcome}</p>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── STACK ────────────────────────────── */}
        {activeTab === 'stack' && (
          <div className="p-4 space-y-5">
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Automation Tools
              </p>
              {stackInfo.tools ? (
                <span className="inline-flex px-3 py-1.5 bg-[#F4F5F7] border border-[#E2E8F0] rounded-full text-[12px] font-medium text-[#0F172A]">
                  {stackInfo.tools}
                </span>
              ) : (
                <p className="text-[12px] text-[#94A3B8] italic">Not answered yet</p>
              )}
            </div>

            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Follow-up Method
              </p>
              {stackInfo.followMethod ? (
                <span className="inline-flex px-3 py-1.5 bg-[#F4F5F7] border border-[#E2E8F0] rounded-full text-[12px] font-medium text-[#0F172A]">
                  {stackInfo.followMethod}
                </span>
              ) : (
                <p className="text-[12px] text-[#94A3B8] italic">Not answered yet</p>
              )}
            </div>

            {!stackInfo.tools && !stackInfo.followMethod && (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <Layers className="w-8 h-8 text-[#E2E8F0]" />
                <p className="text-[12px] text-[#64748B]">
                  Answer Operations questions to see your current stack
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── LOG ──────────────────────────────── */}
        {activeTab === 'log' && (
          <div className="p-4">
            {logEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <ClipboardList className="w-8 h-8 text-[#E2E8F0]" />
                <p className="text-[12px] text-[#64748B]">No answers recorded yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {logEntries.map((entry) => (
                  <div key={entry.index} className="flex items-start gap-2.5 py-2.5 border-b border-[#F4F5F7] last:border-0">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold flex items-center justify-center mt-0.5">
                      Q{entry.index}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#64748B] font-mono truncate">{entry.questionId}</p>
                      <p className="text-[12px] font-medium text-[#0F172A] truncate">{entry.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
}
