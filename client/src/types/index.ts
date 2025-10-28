// User types
export interface User {
  id: string; // UUID format: "user-a1b2c3d4e5"
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

// Conversation types (stored in json-server)
export interface Conversation {
  id: string; // Format: "conv-001"
  user_id: string;
  title: string;
  last_message: string;
  timestamp: string; // ISO 8601 format
}

// Message types (stored in json-server)
export interface Message {
  id: string; // Format: "msg-001" or "temp-123456789"
  conversation_id: string;
  role: 'user' | 'assistant' | 'error' | 'typing';
  content: string;
  timestamp: string; // ISO 8601 format
  location?: Location; // Optional, only for user messages
}

// API Request/Response types

// Request body for Express /chat endpoint
export interface ChatRequest {
  query: string;
  history: GeminiHistoryItem[];
  conversationId?: string;
}

// Gemini history format
export interface GeminiHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

// Stream chunk received from Express server
export interface StreamChunk {
  text: string;
  done: boolean;
  error?: boolean;
  message?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form input types
export interface MessageInput {
  content: string;
  conversationId: string | null;
}

// Component prop types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  conversationTitle?: string;
}

export interface MessageProps {
  message: Message;
  isLatest?: boolean;
}

export interface MarkdownRendererProps {
  content: string;
}

// Utility types
export type MessageRole = Message['role'];
export type ConversationId = string | null;
export type UserId = string;

// State management types
export interface AppState {
  userId: UserId;
  conversations: Conversation[];
  activeConversationId: ConversationId;
  currentMessages: Message[];
  isStreaming: boolean;
  isLoadingConversations: boolean;
  userLocation: Location | null;
  error: string | null;
}

// Action types for state management (if using useReducer)
export type AppAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: ConversationId }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: string }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'SET_LOADING_CONVERSATIONS'; payload: boolean }
  | { type: 'SET_USER_LOCATION'; payload: Location | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'CLEAR_MESSAGES' };

// Helper type guards
export function isUserMessage(message: Message): boolean {
  return message.role === 'user';
}

export function isAssistantMessage(message: Message): boolean {
  return message.role === 'assistant';
}

export function isErrorMessage(message: Message): boolean {
  return message.role === 'error';
}

export function isTypingMessage(message: Message): boolean {
  return message.role === 'typing';
}

// Utility functions for type conversion
export function convertMessagesToGeminiHistory(messages: Message[]): GeminiHistoryItem[] {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
}

// Generate unique IDs
export function generateTempId(prefix: string = 'temp'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Extract conversation title from first message
export function generateConversationTitle(firstMessage: string, maxLength: number = 50): string {
  const cleaned = firstMessage.trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength).trim() + '...';
}

// Validate UUID format
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Format display timestamp
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Error messages
export const ERROR_MESSAGES = {
  FETCH_CONVERSATIONS_FAILED: 'Failed to load conversations. Please refresh the page.',
  FETCH_MESSAGES_FAILED: 'Failed to load messages. Please try again.',
  SEND_MESSAGE_FAILED: '❌ Failed to send message. Please try again.',
  CREATE_CONVERSATION_FAILED: 'Failed to create conversation. Please try again.',
  SAVE_MESSAGE_FAILED: 'Failed to save message. Your message may not be saved.',
  GEOLOCATION_DENIED: 'Location access denied. Continuing without location data.',
  GEOLOCATION_UNAVAILABLE: 'Location unavailable. Continuing without location data.',
  GEOLOCATION_TIMEOUT: 'Location request timed out. Continuing without location data.',
  STREAM_CONNECTION_FAILED: 'Connection to server failed. Please check your internet connection.',
  INVALID_RESPONSE: 'Received invalid response from server. Please try again.',
} as const;

// Constants
export const CONSTANTS = {
  HARDCODED_USER_ID: 'user-a1b2c3d4e5',
  JSON_SERVER_URL: 'http://localhost:3000',
  EXPRESS_SERVER_URL: 'http://localhost:9000',
  TYPING_INDICATOR_ID: 'typing-indicator',
  MAX_CONVERSATION_TITLE_LENGTH: 50,
  GEOLOCATION_TIMEOUT: 5000, // 5 seconds
  AUTO_SCROLL_DELAY: 100, // milliseconds
} as const;