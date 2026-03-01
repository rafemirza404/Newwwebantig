"use client";

/**
 * Chatbot Component (Optimized)
 * Refactored for better performance and maintainability
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { useChatScroll } from '@/hooks/useChatScroll';
import { webhookService } from '@/services/api/webhooks';
import { storageService } from '@/services/storage/localStorage';
import { ENV } from '@/config/env';
import { CHATBOT_CONFIG } from '@/config/constants';
import { ChatMessage } from './ChatMessage';
import { TopicCards } from './TopicCards';
const agentblueLogo = '/agentblue-logo.png';
import type { ChatMessage as ChatMessageType } from '@/types/models';

const WELCOME_MESSAGE: ChatMessageType = {
  text: "Hi there! 👋 Welcome to AgentBlue.\n\nWe don't just automate your business—we architect operational excellence.\n\nHow can we help you today?",
  isBot: true,
  timestamp: Date.now(),
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTopicCards, setShowTopicCards] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const lastMessageTimeRef = useRef<number>(0);
  const sessionId = useMemo(() => storageService.getChatSessionId(), []);

  const { containerRef, messagesEndRef, isUserScrolled, handleScroll, scrollToBottom } =
    useChatScroll(messages);

  /**
   * Show welcome message when chat opens
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([WELCOME_MESSAGE]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  /**
   * Prevent body scroll on mobile when chat is open
   */
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  /**
   * Show new message notification if user scrolled up
   */
  useEffect(() => {
    if (isUserScrolled && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isBot) {
        setHasNewMessage(true);
      }
    }
  }, [messages, isUserScrolled]);

  /**
   * Send message to chatbot
   */
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      const trimmedMessage = messageText.trim();
      if (!trimmedMessage) return;

      // Message throttling
      const now = Date.now();
      if (now - lastMessageTimeRef.current < 1000) {
        return;
      }
      lastMessageTimeRef.current = now;

      // Add user message
      const userMessage: ChatMessageType = {
        text: trimmedMessage,
        isBot: false,
        timestamp: now,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      try {
        const response = await webhookService.sendChatMessage({
          message: trimmedMessage,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
        });

        const botResponse =
          response.data?.response ||
          response.data?.output ||
          response.data?.message ||
          'Thanks for your message! Our team will get back to you soon.';

        const botMessage: ChatMessageType = {
          text: botResponse,
          isBot: true,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Chatbot error:', error);

        const errorMessage: ChatMessageType = {
          text: `I'm having trouble connecting right now. Please try again in a moment, or email us at ${ENV.app.contactEmail}`,
          isBot: true,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId]
  );

  /**
   * Handle topic card click
   */
  const handleTopicCardClick = useCallback(
    (message: string | null) => {
      if (message === null) {
        setShowTopicCards(false);
        return;
      }

      setShowTopicCards(false);
      handleSendMessage(message);
    },
    [handleSendMessage]
  );

  /**
   * Handle send button click
   */
  const handleSend = useCallback(() => {
    handleSendMessage(inputValue);
  }, [inputValue, handleSendMessage]);

  /**
   * Handle enter key press
   */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /**
   * Handle close
   */
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Escape key to close
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Closed state
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-[52px] h-[52px] bg-[#0066FF] rounded-full shadow-[0_4px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_6px_28px_rgba(0,102,255,0.4)] hover:scale-105 transition-all duration-300 z-[9998] flex items-center justify-center"
        aria-label="Open chat support"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <>
      {/* Desktop Chat Modal */}
      <div className="hidden md:flex fixed bottom-[90px] right-6 w-[360px] max-w-[360px] h-[580px] max-h-[580px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] z-[9999] flex-col animate-in slide-in-from-bottom-4 fade-in duration-300 overflow-hidden">
        {/* Header */}
        <div className="h-[80px] bg-white px-6 py-5 flex items-center justify-between border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src={agentblueLogo}
                alt="AgentBlue"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-[#1a1a2e] font-semibold text-lg leading-tight">
                {ENV.app.name}
              </h3>
              <p className="text-[#6B7280] text-[13px] mt-1">
                We architect operational excellence
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors flex items-center justify-center"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="relative flex-1">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="absolute inset-0 bg-[#F8F9FA] p-5 overflow-y-auto scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.2) transparent',
            }}
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} logo={agentblueLogo} />
              ))}

              {/* Topic Cards */}
              {showTopicCards && messages.length === 1 && messages[0].isBot && (
                <TopicCards onCardClick={handleTopicCardClick} />
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in duration-200">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center p-1 mr-2 flex-shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                    <img src={agentblueLogo} alt="Bot" className="w-full h-full object-contain" />
                  </div>
                  <div className="max-w-[80px] bg-[#F3F4F6] px-5 py-3 rounded-2xl rounded-tl-[4px]">
                    <div className="flex gap-1.5 items-center">
                      {[0, 200, 400].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms`, animationDuration: '1.4s' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* New Message Notification */}
          {hasNewMessage && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <button
                onClick={() => {
                  setHasNewMessage(false);
                  scrollToBottom();
                }}
                className="bg-[#0066FF] text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-[#0052CC] transition-all flex items-center gap-2"
              >
                <span>↓</span> New message
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="h-[80px] bg-white px-5 py-4 border-t border-[#E5E7EB] flex gap-3 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 h-12 bg-white border-2 border-[#E5E7EB] rounded-3xl px-5 text-sm text-[#1a1a2e] placeholder:text-[#9CA3AF] outline-none transition-all duration-200 focus:border-[#0066FF] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)]"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-[#0066FF] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,102,255,0.3)] disabled:bg-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Chat */}
      <div className="md:hidden fixed inset-0 bg-white z-[10000] flex flex-col animate-in slide-in-from-bottom duration-350">
        {/* Header */}
        <div className="h-[70px] bg-white px-5 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center">
              <img src={agentblueLogo} alt="AgentBlue" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-[#1a1a2e] font-semibold text-base leading-tight">
                {ENV.app.name}
              </h3>
              <p className="text-[#6B7280] text-xs mt-0.5">
                We architect operational excellence
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg p-1.5 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="relative flex-1">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="absolute inset-0 bg-[#F8F9FA] p-4 overflow-y-auto scroll-smooth"
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} logo={agentblueLogo} />
              ))}

              {/* Topic Cards - Mobile */}
              {showTopicCards && messages.length === 1 && messages[0].isBot && (
                <TopicCards onCardClick={handleTopicCardClick} isMobile />
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in duration-200">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center p-1 mr-3 flex-shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                    <img src={agentblueLogo} alt="Bot" className="w-full h-full object-contain" />
                  </div>
                  <div className="max-w-[80px] bg-[#F3F4F6] px-5 py-3 rounded-2xl rounded-tl-[4px]">
                    <div className="flex gap-1.5 items-center">
                      {[0, 200, 400].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms`, animationDuration: '1.4s' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* New Message Notification - Mobile */}
          {hasNewMessage && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <button
                onClick={() => {
                  setHasNewMessage(false);
                  scrollToBottom();
                }}
                className="bg-[#0066FF] text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-[#0052CC] transition-all flex items-center gap-2"
              >
                <span>↓</span> New message
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white px-4 py-3 border-t border-[#E5E7EB] flex gap-3 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 h-11 bg-white border-2 border-[#E5E7EB] rounded-3xl px-5 text-base text-[#1a1a2e] placeholder:text-[#9CA3AF] outline-none transition-all duration-200 focus:border-[#0066FF] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)]"
            style={{ fontSize: '16px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-[#0066FF] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 disabled:bg-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
