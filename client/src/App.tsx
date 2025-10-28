import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import {
  Conversation,
  Message,
  Location,
  CONSTANTS,
  generateConversationId,
  generateMessageId,
  generateConversationTitle,
  getCurrentTimestamp,
  convertMessagesToGeminiHistory,
} from './types';
import {
  getConversations,
  getMessages,
  createConversation,
  saveMessagePair,
  sendMessageStream,
  getUserLocation,
} from './api/chatApi';

function App() {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    requestUserLocation();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId && activeConversationId !== 'new-chat') {
      loadMessages(activeConversationId);
    } else if (activeConversationId === 'new-chat') {
      setCurrentMessages([]);
    }
  }, [activeConversationId]);

  /**
   * Load all conversations for the current user
   */
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const fetchedConversations = await getConversations(CONSTANTS.HARDCODED_USER_ID);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Add error message to chat
      setCurrentMessages([{
        id: generateMessageId(),
        conversation_id: 'error',
        role: 'error',
        content: 'Failed to load conversations. Please refresh the page.',
        timestamp: getCurrentTimestamp(),
      }]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  /**
   * Load messages for a specific conversation
   */
  const loadMessages = async (conversationId: string) => {
    try {
      const fetchedMessages = await getMessages(conversationId);
      setCurrentMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setCurrentMessages([{
        id: generateMessageId(),
        conversation_id: conversationId,
        role: 'error',
        content: 'Failed to load messages. Please try again.',
        timestamp: getCurrentTimestamp(),
      }]);
    }
  };

  /**
   * Request user's geolocation
   */
  const requestUserLocation = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      console.log('User location obtained:', location);
    } catch (error) {
      console.warn('Location access denied or unavailable:', error);
      // Continue without location - it's optional
    }
  };

  /**
   * Handle creating a new chat
   */
  const handleNewChat = useCallback(() => {
    setActiveConversationId('new-chat');
    setCurrentMessages([]);
  }, []);

  /**
   * Handle selecting an existing conversation
   */
  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const trimmedContent = content.trim();
    let conversationId = activeConversationId;
    let isNewConversation = false;

    // Create new conversation if needed
    if (!conversationId || conversationId === 'new-chat') {
      isNewConversation = true;
      conversationId = generateConversationId();

      try {
        const newConversation: Conversation = {
          id: conversationId,
          user_id: CONSTANTS.HARDCODED_USER_ID,
          title: generateConversationTitle(trimmedContent),
          last_message: trimmedContent,
          timestamp: getCurrentTimestamp(),
        };

        await createConversation(newConversation);
        
        // Update local state
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(conversationId);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        setCurrentMessages(prev => [...prev, {
          id: generateMessageId(),
          conversation_id: 'error',
          role: 'error',
          content: 'Failed to create conversation. Please try again.',
          timestamp: getCurrentTimestamp(),
        }]);
        return;
      }
    }

    // Create user message
    const userMessage: Message = {
      id: generateMessageId(),
      conversation_id: conversationId,
      role: 'user',
      content: trimmedContent,
      timestamp: getCurrentTimestamp(),
      location: userLocation || undefined,
    };

    // Add user message to UI immediately
    setCurrentMessages(prev => [...prev, userMessage]);

    // Add typing indicator
    const typingIndicatorId = 'typing-indicator';
    setCurrentMessages(prev => [...prev, {
      id: typingIndicatorId,
      conversation_id: conversationId!,
      role: 'typing',
      content: '',
      timestamp: getCurrentTimestamp(),
    }]);

    setIsStreaming(true);

    try {
      // Prepare history for Gemini (exclude typing indicator)
      const history = convertMessagesToGeminiHistory(currentMessages);

      // Create assistant message placeholder
      const assistantMessageId = generateMessageId();
      let assistantContent = '';

      // Remove typing indicator and add assistant message
      setCurrentMessages(prev => [
        ...prev.filter(m => m.id !== typingIndicatorId),
        {
          id: assistantMessageId,
          conversation_id: conversationId!,
          role: 'assistant',
          content: '',
          timestamp: getCurrentTimestamp(),
        }
      ]);

      // Stream the response
      const stream = sendMessageStream(trimmedContent, history);

      for await (const chunk of stream) {
        if (chunk.error) {
          throw new Error(chunk.message || 'Streaming failed');
        }

        if (chunk.text) {
          assistantContent += chunk.text;
          
          // Update assistant message content
          setCurrentMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.id === assistantMessageId) {
              lastMessage.content = assistantContent;
            }
            return updated;
          });
        }

        if (chunk.done) {
          break;
        }
      }

      // Save both messages to json-server
      const assistantMessage: Message = {
        id: assistantMessageId,
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent,
        timestamp: getCurrentTimestamp(),
      };

      try {
        await saveMessagePair(userMessage, assistantMessage, conversationId);
        
        // Update conversation list with latest message
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId
            ? { ...conv, last_message: assistantContent, timestamp: getCurrentTimestamp() }
            : conv
        ));
      } catch (saveError) {
        console.error('Failed to save messages:', saveError);
        // Messages are still visible in UI, just not persisted
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator if still present
      setCurrentMessages(prev => prev.filter(m => m.id !== typingIndicatorId));
      
      // Add error message
      setCurrentMessages(prev => [...prev, {
        id: generateMessageId(),
        conversation_id: conversationId!,
        role: 'error',
        content: '❌ Failed to send message. Please try again.',
        timestamp: getCurrentTimestamp(),
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  // Get current conversation title
  const currentConversationTitle = conversations.find(
    c => c.id === activeConversationId
  )?.title || (activeConversationId === 'new-chat' ? 'New Conversation' : '');

  return (
    <Layout>
      {/* Sidebar - 320px fixed width */}
      <div className="w-80 flex-shrink-0">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat Window - flexible width */}
      <div className="flex-1">
        <ChatWindow
          messages={currentMessages}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
          conversationTitle={currentConversationTitle}
        />
      </div>
    </Layout>
  );
}

export default App;