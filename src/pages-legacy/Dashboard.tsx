import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AuditChat from '@/components/dashboard/AuditChat';
import AuditReport from '@/components/dashboard/AuditReport';
import Sidebar from '@/components/dashboard/Sidebar';
import IntelligencePanel from '@/components/dashboard/IntelligencePanel';
import type { AuditAnswers } from '@/services/audit/auditBot';
const agentblueLogo = '/agentblue-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [auditComplete, setAuditComplete] = useState(false);
  const [checkingAudit, setCheckingAudit] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [auditAnswers, setAuditAnswers] = useState<AuditAnswers>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('audits')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAuditComplete(true);
        setCheckingAudit(false);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProgress = (index: number, answers: AuditAnswers) => {
    setCurrentQuestionIndex(index);
    setAuditAnswers(answers);
  };

  const handleAuditComplete = () => setAuditComplete(true);

  const handleRetake = () => {
    setAuditComplete(false);
    setCurrentQuestionIndex(0);
    setAuditAnswers({});
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-[#F4F5F7] flex font-sans overflow-hidden">

      {/* Pane A: Sidebar — visible ≥768px */}
      <div className="hidden md:flex w-[260px] shrink-0 h-full">
        <Sidebar
          auditAnswers={auditAnswers}
          auditComplete={auditComplete}
          onNewAudit={handleRetake}
          onSignOut={handleSignOut}
          user={user}
        />
      </div>

      {/* Pane B: Center */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-x border-[#E2E8F0]">

        {/* Mobile top bar — visible <768px */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-[#E2E8F0] shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2563EB] rounded-[8px] flex items-center justify-center p-0.5">
              <img src={agentblueLogo} alt="AgentBlue" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <span className="text-sm font-bold text-[#0F172A]">AgentBlue</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 flex items-center justify-center text-[#64748B] rounded-[8px] hover:bg-[#F4F5F7] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile dropdown nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-white border-b border-[#E2E8F0] px-4 py-3 flex flex-col gap-1 z-50 shrink-0"
            >
              <button
                onClick={() => { handleRetake(); setMobileMenuOpen(false); }}
                className="text-sm py-2.5 px-3 text-left rounded-[8px] font-medium text-[#0F172A] hover:bg-[#F4F5F7] transition-colors"
              >
                New Audit
              </button>
              <button
                onClick={handleSignOut}
                className="text-sm py-2.5 px-3 text-left rounded-[8px] font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop breadcrumb header — visible ≥768px */}
        <header className="hidden md:flex h-14 items-center px-6 border-b border-[#E2E8F0] bg-white shrink-0">
          <nav className="flex items-center gap-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">
            <span>AgentBlue</span>
            <span className="text-[#CBD5E1] font-light text-base leading-none">/</span>
            <span className="text-[#0F172A]">
              {auditComplete ? 'Automation Blueprint' : 'Operations Audit'}
            </span>
          </nav>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-5">
          <div className="flex-1 flex flex-col bg-white border border-[#E2E8F0] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            {checkingAudit ? (
              <div className="flex items-center justify-center flex-1">
                <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={auditComplete ? 'report' : 'audit'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                >
                  {!auditComplete ? (
                    <AuditChat
                      userId={user.id}
                      onComplete={handleAuditComplete}
                      onProgress={handleProgress}
                    />
                  ) : (
                    <AuditReport userId={user.id} onRetake={handleRetake} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Pane C: IntelligencePanel — visible ≥1024px */}
      <div className="hidden lg:flex w-[300px] shrink-0 h-full">
        <IntelligencePanel
          currentQuestionIndex={currentQuestionIndex}
          auditAnswers={auditAnswers}
          auditComplete={auditComplete}
          userId={user.id}
        />
      </div>

    </div>
  );
}
