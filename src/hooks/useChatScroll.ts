/**
 * useChatScroll Hook
 * Optimized scroll handling for chat interfaces
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from '@/lib/debounce';
import { CHATBOT_CONFIG } from '@/config/constants';
import type { ChatMessage } from '@/types/models';

export const useChatScroll = (messages: ChatMessage[]) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);

  /**
   * Scroll to bottom smoothly
   */
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Debounced scroll handler to detect if user has scrolled up
   */
  const handleScroll = useMemo(
    () =>
      debounce(() => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

        setIsUserScrolled(!isAtBottom);
      }, CHATBOT_CONFIG.SCROLL_DEBOUNCE_MS),
    []
  );

  /**
   * Auto-scroll when new messages arrive (only if user hasn't scrolled up)
   */
  useEffect(() => {
    if (!isUserScrolled) {
      // Delayed scroll to ensure DOM has updated
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isUserScrolled, scrollToBottom]);

  return {
    containerRef,
    messagesEndRef,
    isUserScrolled,
    handleScroll,
    scrollToBottom,
  };
};
