import React, { useRef, useEffect, useState } from 'react';
import { ChatWindowProps } from '../types';
import { Message } from './Message';
import { Send, Loader2 } from 'lucide-react';

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  conversationTitle,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isStreaming) return;

    onSendMessage(trimmedValue);
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {conversationTitle || 'New Conversation'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {messages.length > 0
              ? `${messages.filter(m => m.role !== 'typing').length} messages`
              : 'Start a conversation'}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Send size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Start a Conversation
              </h2>
              <p className="text-gray-500 max-w-md">
                Ask me anything! I'm here to help with information, coding, creative writing, and more.
              </p>
            </div>
          ) : (
            // Messages list
            <div className="space-y-6">
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'Waiting for response...' : 'Type your message... (Shift+Enter for new line)'}
              disabled={isStreaming}
              rows={1}
              className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-5 py-3.5 pr-14 text-[15px] leading-relaxed text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              style={{ maxHeight: '200px' }}
            />
            
            {/* Send button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="absolute right-3 bottom-3.5 p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
              title="Send message (Enter)"
            >
              {isStreaming ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
          
          {/* Helper text */}
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};