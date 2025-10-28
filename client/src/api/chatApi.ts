import {
  Conversation,
  Message,
  GeminiHistoryItem,
  StreamChunk,
  CONSTANTS,
  ERROR_MESSAGES,
} from '../types';

// =============================================================================
// JSON Server API Calls (Port 3000) - History Management
// =============================================================================

/**
 * Fetch all conversations for a specific user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const response = await fetch(
      `${CONSTANTS.JSON_SERVER_URL}/conversations?user_id=${userId}&_sort=timestamp&_order=desc`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const conversations: Conversation[] = await response.json();
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error(ERROR_MESSAGES.FETCH_CONVERSATIONS_FAILED);
  }
}

/**
 * Fetch all messages for a specific conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const response = await fetch(
      `${CONSTANTS.JSON_SERVER_URL}/messages?conversation_id=${conversationId}&_sort=timestamp&_order=asc`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages: Message[] = await response.json();
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error(ERROR_MESSAGES.FETCH_MESSAGES_FAILED);
  }
}

/**
 * Create a new conversation in json-server
 */
export async function createConversation(
  conversation: Conversation
): Promise<Conversation> {
  try {
    const response = await fetch(`${CONSTANTS.JSON_SERVER_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversation),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const createdConversation: Conversation = await response.json();
    return createdConversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(ERROR_MESSAGES.CREATE_CONVERSATION_FAILED);
  }
}

/**
 * Save a message to json-server
 */
export async function saveMessage(message: Message): Promise<Message> {
  try {
    const response = await fetch(`${CONSTANTS.JSON_SERVER_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const savedMessage: Message = await response.json();
    return savedMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error(ERROR_MESSAGES.SAVE_MESSAGE_FAILED);
  }
}

/**
 * Update a conversation (e.g., update last_message or title)
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
): Promise<Conversation> {
  try {
    const response = await fetch(
      `${CONSTANTS.JSON_SERVER_URL}/conversations/${conversationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedConversation: Conversation = await response.json();
    return updatedConversation;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw new Error('Failed to update conversation');
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    // Delete all messages first
    const messages = await getMessages(conversationId);
    await Promise.all(
      messages.map(msg =>
        fetch(`${CONSTANTS.JSON_SERVER_URL}/messages/${msg.id}`, {
          method: 'DELETE',
        })
      )
    );

    // Delete the conversation
    const response = await fetch(
      `${CONSTANTS.JSON_SERVER_URL}/conversations/${conversationId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error('Failed to delete conversation');
  }
}

// =============================================================================
// Express Server API Calls (Port 9000) - Gemini Streaming
// =============================================================================

/**
 * Send a message and stream the response from Gemini via Express server
 * Returns an async generator that yields text chunks
 */
export async function* sendMessageStream(
  query: string,
  history: GeminiHistoryItem[]
): AsyncGenerator<StreamChunk, void, unknown> {
  try {
    const response = await fetch(`${CONSTANTS.EXPRESS_SERVER_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Read the response as a stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split by newlines to get individual SSE messages
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      // Process complete lines
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            const data: StreamChunk = JSON.parse(jsonStr);

            // Check for errors
            if (data.error) {
              throw new Error(data.message || ERROR_MESSAGES.INVALID_RESPONSE);
            }

            // Yield the chunk
            yield data;

            // If done, exit the loop
            if (data.done) {
              return;
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
            // Continue to next line instead of throwing
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in sendMessageStream:', error);
    
    // Yield an error chunk
    yield {
      text: '',
      done: true,
      error: true,
      message: error instanceof Error ? error.message : ERROR_MESSAGES.STREAM_CONNECTION_FAILED,
    };
  }
}

/**
 * Test connection to Express server
 */
export async function testExpressConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${CONSTANTS.EXPRESS_SERVER_URL}/health`);
    
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Express server connection test failed:', error);
    return false;
  }
}

/**
 * Test connection to json-server
 */
export async function testJsonServerConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${CONSTANTS.JSON_SERVER_URL}/conversations?_limit=1`);
    return response.ok;
  } catch (error) {
    console.error('json-server connection test failed:', error);
    return false;
  }
}

// =============================================================================
// Geolocation API
// =============================================================================

/**
 * Get user's current location using browser Geolocation API
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
            break;
          case error.TIMEOUT:
            errorMessage = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location';
        }
        reject(new Error(errorMessage));
      },
      {
        timeout: CONSTANTS.GEOLOCATION_TIMEOUT,
        enableHighAccuracy: false,
      }
    );
  });
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Batch save user and assistant messages together
 */
export async function saveMessagePair(
  userMessage: Message,
  assistantMessage: Message,
  conversationId: string
): Promise<{ user: Message; assistant: Message }> {
  try {
    // Save both messages in parallel
    const [savedUserMsg, savedAssistantMsg] = await Promise.all([
      saveMessage({ ...userMessage, conversation_id: conversationId }),
      saveMessage({ ...assistantMessage, conversation_id: conversationId }),
    ]);

    // Update conversation with latest message
    await updateConversation(conversationId, {
      last_message: assistantMessage.content,
      timestamp: assistantMessage.timestamp,
    });

    return {
      user: savedUserMsg,
      assistant: savedAssistantMsg,
    };
  } catch (error) {
    console.error('Error saving message pair:', error);
    throw error;
  }
}