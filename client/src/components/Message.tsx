import React from 'react';
import { MessageProps, formatTimestamp } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { User, Bot, MapPin, AlertCircle } from 'lucide-react';

export const Message: React.FC<MessageProps> = ({ message, isLatest = false }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isTyping = message.role === 'typing';

  // Typing indicator component
  if (isTyping) {
    return (
      <div className="flex items-start gap-3 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 max-w-3xl">
          <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 px-5 py-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error message component
  if (isError) {
    return (
      <div className="flex items-start gap-3 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-md">
          <AlertCircle size={18} className="text-white" />
        </div>
        <div className="flex-1 max-w-3xl">
          <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm shadow-sm px-5 py-4">
            <p className="text-sm text-red-800 leading-relaxed">{message.content}</p>
          </div>
          <div className="mt-1.5 px-1 text-xs text-gray-400">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 animate-fade-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-purple-500 to-blue-500'
        }`}
      >
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 rounded-tl-sm'
          } px-5 py-4 ${isLatest && !isUser ? 'shadow-md' : ''}`}
        >
          {isUser ? (
            // User message - plain text
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            // Assistant message - markdown
            <div className={isLatest ? 'animate-pulse-slow' : ''}>
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>

        {/* Timestamp and location */}
        <div
          className={`mt-1.5 px-1 flex items-center gap-2 text-xs text-gray-400 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{formatTimestamp(message.timestamp)}</span>
          {message.location && (
            <>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {message.location.latitude.toFixed(4)}, {message.location.longitude.toFixed(4)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};