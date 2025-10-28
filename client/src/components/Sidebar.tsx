import React from 'react';
import { SidebarProps, formatTimestamp } from '../types';
import { MessageSquarePlus, MessageSquare, Loader2, Trash2 } from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isLoading,
}) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Chat</h1>
            {/* <p className="text-xs text-gray-400">Powered by Gemini</p> */}
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageSquarePlus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {isLoading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
              <MessageSquare size={28} className="text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mb-1">No conversations yet</p>
            <p className="text-xs text-gray-500">Start a new chat to begin</p>
          </div>
        ) : (
          // Conversations list
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              
              return (
                <div
                  key={conversation.id}
                  className={`group relative rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg'
                      : 'bg-gray-700/30 hover:bg-gray-700/50'
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare
                        size={18}
                        className={`flex-shrink-0 mt-0.5 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm font-medium truncate mb-1 ${
                            isActive ? 'text-white' : 'text-gray-200'
                          }`}
                        >
                          {conversation.title}
                        </h3>
                        <p
                          className={`text-xs truncate ${
                            isActive ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {conversation.last_message}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isActive ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          {formatTimestamp(conversation.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Delete button (hidden by default, shown on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement delete functionality in Phase 6
                      console.log('Delete conversation:', conversation.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
      </div>
    </div>
  );
};