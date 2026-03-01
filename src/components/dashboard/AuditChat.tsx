"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { AUDIT_QUESTIONS } from '@/config/auditQuestions';
import {
  getNextQuestionIndex,
  getQuestion,
  getAcknowledgment,
  getCompletionMessage,
  type AuditAnswers,
} from '@/services/audit/auditBot';
import { generateAuditResult } from '@/services/audit/recommendations';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';

type Message = {
  id: string;
  role: 'bot' | 'user';
  content: string;
};

type Props = {
  userId: string;
  onComplete: () => void;
  onProgress: (index: number, answers: AuditAnswers) => void;
};

export default function AuditChat({ userId, onComplete, onProgress }: Props) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<AuditAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: 'bot' | 'user', content: string) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, content }]);
  }, []);

  const saveMessage = useCallback(async (auditId: string, role: 'bot' | 'user', content: string) => {
    await supabase.from('audit_messages').insert({ audit_id: auditId, role, content });
  }, []);

  // Initialize: create audit row + show first question
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase
        .from('audits')
        .insert({ user_id: userId, status: 'in_progress' })
        .select('id')
        .single();

      if (error || !data) {
        toast({ title: 'Could not start audit', description: error?.message, variant: 'destructive' });
        return;
      }

      const aid = data.id as string;
      setAuditId(aid);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const firstQ = getQuestion(0);
        if (firstQ) {
          addMessage('bot', firstQ.text);
          saveMessage(aid, 'bot', firstQ.text);
        }
      }, 700);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on every new message or typing change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, isTyping]);

  const handleAnswer = useCallback(async (optionLabel: string, optionValue: string) => {
    if (!auditId || isComplete) return;

    const question = getQuestion(currentQuestionIndex);
    if (!question) return;

    addMessage('user', optionLabel);
    await saveMessage(auditId, 'user', optionLabel);

    const newAnswers = { ...answers, [question.id]: optionValue };
    setAnswers(newAnswers);

    const nextIndex = getNextQuestionIndex(currentQuestionIndex + 1);

    // Notify parent of progress
    onProgress(nextIndex ?? AUDIT_QUESTIONS.length, newAnswers);

    setIsTyping(true);
    await new Promise(r => setTimeout(r, 800));
    setIsTyping(false);

    const acknowledgment = getAcknowledgment(question.id, optionValue);
    addMessage('bot', acknowledgment);
    await saveMessage(auditId, 'bot', acknowledgment);

    if (nextIndex === null) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 600));
      setIsTyping(false);

      const completionMsg = getCompletionMessage();
      addMessage('bot', completionMsg);
      await saveMessage(auditId, 'bot', completionMsg);

      const result = generateAuditResult(newAnswers);
      await supabase
        .from('audits')
        .update({ status: 'completed', recommendations: result })
        .eq('id', auditId);

      setIsComplete(true);
      setTimeout(onComplete, 1800);
    } else {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 600));
      setIsTyping(false);

      const nextQ = getQuestion(nextIndex);
      if (nextQ) {
        addMessage('bot', nextQ.text);
        await saveMessage(auditId, 'bot', nextQ.text);
        setCurrentQuestionIndex(nextIndex);
      }
    }
  }, [auditId, isComplete, currentQuestionIndex, answers, addMessage, saveMessage, onComplete, onProgress]);

  const currentQuestion = getQuestion(currentQuestionIndex);

  return (
    <div className="flex flex-col h-full bg-white font-sans">

      {/* Messages Feed */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-5 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] mr-3 shrink-0 shadow-sm border border-blue-100 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[72%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white rounded-2xl rounded-br-sm shadow-sm shadow-blue-200/50'
                    : 'bg-[#F4F5F7] text-[#0F172A] rounded-2xl rounded-bl-sm border border-[#E2E8F0]'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="flex justify-start items-center w-full"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] mr-3 shrink-0 shadow-sm border border-blue-100 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F4F5F7] border border-[#E2E8F0] rounded-2xl rounded-bl-sm px-5 py-3.5 flex gap-1.5 shadow-sm">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-[#64748B] rounded-full block"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-2" />
      </div>

      {/* Answer Options as chips */}
      {!isComplete && !isTyping && currentQuestion && messages.length > 0 && (
        <div className="shrink-0 px-5 py-4 border-t border-[#E2E8F0]">
          <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Choose an answer</p>
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options.map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(opt.label, opt.value)}
                className="px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-full text-[12px] font-medium text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/50 transition-all duration-150 outline-none"
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Decorative input bar */}
      <div className="shrink-0 px-5 py-3 bg-[#F4F5F7] border-t border-[#E2E8F0] flex items-center gap-2">
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-[8px] px-3.5 py-2.5">
          <p className="text-[12px] text-[#94A3B8] select-none">
            {isComplete ? 'Audit complete — view your report above' : 'Select an answer above…'}
          </p>
        </div>
        <button
          disabled
          className="shrink-0 w-9 h-9 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center text-[#CBD5E1] cursor-not-allowed"
          aria-label="Send"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
