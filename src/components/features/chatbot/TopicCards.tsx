/**
 * TopicCards Component
 * Quick action cards for common chatbot queries
 */

import { BarChart3, Wrench, Briefcase, Phone, MessageSquare } from 'lucide-react';

const TOPIC_CARDS = [
  {
    id: 'audit',
    icon: BarChart3,
    title: 'Operations Intelligence Audit',
    description: 'Diagnose bottlenecks and quantify ROI opportunities',
    message: "I'm interested in Operations Audit",
  },
  {
    id: 'strategy',
    icon: Wrench,
    title: 'Automation Infrastructure Design',
    description: 'Get detailed technical blueprints for implementation',
    message: 'I want to learn about Automation Strategy',
  },
  {
    id: 'implementation',
    icon: Briefcase,
    title: 'Turnkey Implementation',
    description: 'Full-service build, test, deploy, and train',
    message: 'Tell me about Implementation Services',
  },
  {
    id: 'consultation',
    icon: Phone,
    title: 'Book a Free Consultation',
    description: 'Speak with our automation experts',
    message: "I'd like to book a consultation",
  },
  {
    id: 'other',
    icon: MessageSquare,
    title: 'Other Questions',
    description: 'Ask us anything about automation',
    message: null,
  },
];

interface TopicCardsProps {
  onCardClick: (message: string | null) => void;
  isMobile?: boolean;
}

export const TopicCards = ({ onCardClick, isMobile = false }: TopicCardsProps) => {
  return (
    <div
      className={`grid ${
        isMobile ? 'grid-cols-1 gap-2.5' : 'grid-cols-2 gap-3'
      } mt-4 animate-in fade-in duration-500`}
    >
      {TOPIC_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card.message)}
            className={`bg-white border-2 border-[#E5E7EB] rounded-xl ${
              isMobile ? 'p-3.5' : 'p-4'
            } cursor-pointer transition-all duration-250 hover:border-[#0066FF] hover:bg-[#F0F7FF] ${
              isMobile ? '' : 'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,102,255,0.15)]'
            } text-left flex flex-col gap-2 ${
              isMobile ? '' : 'col-span-2 last:col-span-2'
            }`}
          >
            <Icon className="w-8 h-8 text-[#0066FF] mb-1" />
            <div className="text-[15px] font-semibold text-[#1a1a2e] leading-tight">
              {card.title}
            </div>
            <div className="text-[13px] text-[#6B7280] leading-snug">{card.description}</div>
          </button>
        );
      })}
    </div>
  );
};
