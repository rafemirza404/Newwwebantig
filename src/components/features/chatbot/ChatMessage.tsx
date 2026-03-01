/**
 * ChatMessage Component
 * Displays individual chat message
 */

import type { ChatMessage as ChatMessageType } from '@/types/models';

interface ChatMessageProps {
  message: ChatMessageType;
  logo: string;
}

export const ChatMessage = ({ message, logo }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {message.isBot && (
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center p-1 mr-2 md:mr-2 flex-shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <img src={logo} alt="Bot" className="w-full h-full object-contain" />
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[85%] px-4 py-3 whitespace-pre-line text-sm leading-relaxed ${
          message.isBot
            ? 'bg-[#F3F4F6] text-[#1a1a2e] rounded-2xl rounded-tl-[4px]'
            : 'bg-[#0066FF] text-white rounded-2xl rounded-tr-[4px]'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};
