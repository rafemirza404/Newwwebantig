"use client";

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Plus, MessageSquare, HelpCircle, ChevronDown } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
const agentblueLogo = '/agentblue-logo.png';
import type { AuditAnswers } from '@/services/audit/auditBot';
import { DOMAIN_QUESTIONS, DOMAIN_META, getDomainStatus } from './domains';

type Props = {
  auditAnswers: AuditAnswers;
  auditComplete: boolean;
  onNewAudit: () => void;
  onSignOut: () => void;
  user: User;
};

const dotColors = {
  not_started: 'bg-slate-300',
  in_progress: 'bg-amber-400',
  complete: 'bg-emerald-500',
};

export default function Sidebar({ auditAnswers, auditComplete, onNewAudit, onSignOut, user }: Props) {
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({ strategy: true });

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'User';
  const companyName = (user.user_metadata?.company_name as string | undefined) ?? '';
  const initial = firstName[0]?.toUpperCase() ?? 'U';

  const sessionLabel = auditAnswers.business_type
    ? auditAnswers.business_type === 'solar'
      ? '☀️ Solar Audit'
      : auditAnswers.business_type === 'hvac'
      ? '❄️ HVAC Audit'
      : '⚡ Solar & HVAC Audit'
    : 'Active Session';

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => ({ ...prev, [domain]: !prev[domain] }));
  };

  return (
    <aside className="flex flex-col w-[260px] h-full bg-white border-r border-[#E2E8F0] shrink-0">
      {/* Logo row */}
      <div className="h-14 flex items-center px-5 border-b border-[#E2E8F0] shrink-0">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-[#2563EB] rounded-[8px] flex items-center justify-center p-0.5">
            <img src={agentblueLogo} alt="AgentBlue" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#0F172A] tracking-tight block leading-none">AgentBlue</span>
            <span className="text-[10px] text-[#64748B] tracking-wide">Workspace</span>
          </div>
        </Link>
      </div>

      {/* New Audit button */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <button
          onClick={onNewAudit}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-[8px] text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">New Audit</span>
          <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-1.5 py-0.5 rounded">
            NEW
          </span>
        </button>
      </div>

      <div className="h-px bg-[#E2E8F0] mx-4 shrink-0" />

      {/* Audit Domains */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest px-2 mb-3">
          Audit Domains
        </p>

        <nav className="flex flex-col gap-0.5">
          {Object.entries(DOMAIN_META).map(([domain, meta]) => {
            const status = getDomainStatus(domain, auditAnswers);
            const isExpanded = expandedDomains[domain] ?? false;

            return (
              <div key={domain}>
                <button
                  onClick={() => toggleDomain(domain)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-[8px] hover:bg-[#F4F5F7] text-left transition-colors"
                >
                  <span className="text-base leading-none">{meta.emoji}</span>
                  <span className="flex-1 text-[13px] font-medium text-[#0F172A] truncate">{meta.label}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[status]}`} />
                  <ChevronDown
                    className={`w-3 h-3 text-[#64748B] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="ml-6 mt-0.5 flex flex-col gap-0.5 overflow-hidden"
                  >
                    {status !== 'not_started' ? (
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] bg-blue-50/60 border border-blue-100/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                        <span className="text-[11px] font-medium text-[#2563EB] truncate">{sessionLabel}</span>
                      </div>
                    ) : (
                      <span className="px-2 py-1.5 text-[11px] text-[#64748B]">Not started</span>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Support section */}
        <div className="mt-6">
          <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest px-2 mb-3">
            Support
          </p>
          <nav className="flex flex-col gap-0.5">
            <a
              href="mailto:sophia@supportagentblue.in"
              className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F5F7] transition-colors"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              Email Support
            </a>
            <a
              href="#"
              className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F5F7] transition-colors"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              Help Center
            </a>
          </nav>
        </div>
      </div>

      {/* User footer */}
      <div className="border-t border-[#E2E8F0] p-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] font-bold text-sm shrink-0 uppercase border border-blue-100">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0F172A] truncate">{firstName}</p>
            {companyName && <p className="text-[11px] text-[#64748B] truncate">{companyName}</p>}
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[12px] font-medium text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
