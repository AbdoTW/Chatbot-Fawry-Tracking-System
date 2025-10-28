# AI Chat Application

A professional full-stack chat application powered by Google's Gemini AI, featuring real-time streaming responses, persistent conversation history, and a modern React interface with TypeScript.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6.3-blue.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Chat** - Integration with Google Gemini 2.5 Flash for intelligent responses
- 💬 **Real-Time Streaming** - Watch AI responses appear word-by-word using Server-Sent Events (SSE)
- 📚 **Conversation Management** - Create, view, and manage multiple chat conversations
- 💾 **Persistent Storage** - All conversations and messages saved to local JSON database
- 📍 **Geolocation Support** - Optional location tracking for user messages

### User Experience
- 🎨 **Modern UI** - Professional gradient design with smooth animations
- 📝 **Markdown Support** - Full markdown rendering with syntax-highlighted code blocks
- 📋 **Code Copy** - One-click code copying from chat responses
- ⌨️ **Keyboard Shortcuts** - Enter to send, Shift+Enter for new lines
- 🔄 **Auto-Scroll** - Automatic scrolling to latest messages
- 💭 **Typing Indicators** - Visual feedback while AI is generating responses
- 📱 **Responsive Design** - Two-column layout with sidebar and chat area

### Technical Features
- ⚡ **Real-Time Updates** - Live message streaming with chunk-by-chunk display
- 🔒 **Secure API Keys** - Environment-based configuration, never exposed to frontend
- 🎯 **TypeScript** - Full type safety across the entire application
- 🎨 **Tailwind CSS** - Utility-first styling for consistent design
- 🔌 **RESTful APIs** - Clean separation between frontend and backend
- 🚀 **Fast Development** - Vite for lightning-fast builds and hot module replacement

---

## 🏗️ Architecture

This application follows a **three-server architecture** for optimal separation of concerns:
```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│                   (React + TypeScript)                       │
│                    Port: 5173 (Vite)                        │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
               │ REST API             │ SSE Stream
               │                      │
       ┌───────▼──────┐      ┌───────▼──────────┐
       │  json-server │      │  Express Server   │
       │  Port: 3000  │      │   Port: 9000      │
       │              │      │                   │
       │ Conversations│      │ Gemini AI Proxy   │
       │ Messages     │      │ Streaming         │
       └──────┬───────┘      └──────┬────────────┘
              │                     │
              ▼                     ▼
          db.json              Gemini API
                              (Google Cloud)
```

### Component Flow
```
User Input → App.tsx → chatApi.ts → Express/json-server
                  ↓
           Components (Sidebar, ChatWindow, Message)
                  ↓
          MarkdownRenderer (with syntax highlighting)
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.6.3** - Type safety
- **Vite 5.4.10** - Build tool and dev server
- **Tailwind CSS 3.4.14** - Utility-first CSS
- **react-markdown 9.0.1** - Markdown rendering
- **react-syntax-highlighter 15.5.0** - Code syntax highlighting
- **lucide-react 0.263.1** - Modern icon library

### Backend
- **Node.js** - Runtime environment
- **Express 4.21.1** - Web server framework
- **json-server 0.17.4** - Mock REST API for data persistence
- **@google/generative-ai 0.21.0** - Official Gemini SDK
- **cors 2.8.5** - Cross-origin resource sharing
- **dotenv 16.4.5** - Environment variable management

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

Check your versions:
```bash
node --version
npm --version
```

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-chat-app.git
cd ai-chat-app
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install Client Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Verify Installation

Check that all packages are installed:
```bash
# Root packages
npm list --depth=0

# Client packages
cd client && npm list --depth=0 && cd ..
```

---

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the **root directory**:
```bash
touch .env
```

### 2. Add Your Gemini API Key

Open `.env` and add:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=9000
```

**⚠️ Important:** Replace `your_actual_api_key_here` with your actual Google Gemini API key.

### 3. Configure User ID (Optional)

The application uses a hardcoded user ID by default: `user-a1b2c3d4e5`

To change it, edit `client/src/types/index.ts`:
```typescript
export const CONSTANTS = {
  HARDCODED_USER_ID: 'your-custom-user-id',
  // ...
}
```

### 4. Database Setup

The `db.json` file contains initial data. You can modify it to add sample conversations:
```json
{
  "conversations": [
    {
      "id": "conv-001",
      "user_id": "user-a1b2c3d4e5",
      "title": "Sample Conversation",
      "last_message": "Hello!",
      "timestamp": "2025-10-27T00:00:00Z"
    }
  ],
  "messages": [
    {
      "id": "msg-001",
      "conversation_id": "conv-001",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-10-27T00:00:00Z"
    }
  ]
}
```

---

## 🎯 Running the Application

You need to run **three servers** simultaneously. Open three terminal windows:

### Terminal 1: json-server (Port 3000)
```bash
npm run json-server
```

Expected output:
```
  \{^_^}/ hi!

  Loading db.json
  Done

  Resources
  http://localhost:3000/conversations
  http://localhost:3000/messages

  Home
  http://localhost:3000
```

### Terminal 2: Express Server (Port 9000)
```bash
npm start
```

Expected output:
```
🚀 Express server running on http://localhost:9000
📡 Gemini API Key configured: true
🔗 CORS enabled for: http://localhost:5173
```

### Terminal 3: React Frontend (Port 5173)
```bash
cd client
npm run dev
```

Expected output:
```
  VITE v5.4.21  ready in 152 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📁 Project Structure
```
ai-chat-app/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── api/
│   │   │   └── chatApi.ts          # API integration layer
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx      # Main chat interface
│   │   │   ├── Layout.tsx          # Two-column layout wrapper
│   │   │   ├── MarkdownRenderer.tsx # Markdown & code highlighting
│   │   │   ├── Message.tsx         # Individual message component
│   │   │   └── Sidebar.tsx         # Conversation list sidebar
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript type definitions
│   │   ├── App.tsx                 # Main app component & state
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Global styles & animations
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── vite.config.ts              # Vite bundler configuration
├── db.json                          # JSON database for conversations/messages
├── server.js                        # Express server for Gemini API
├── package.json                     # Backend dependencies
├── .env                            # Environment variables (API keys)
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `server.js` | Express server that proxies requests to Gemini API with streaming support |
| `db.json` | Local JSON database managed by json-server for data persistence |
| `client/src/App.tsx` | Main React component with state management and business logic |
| `client/src/api/chatApi.ts` | All API calls to json-server and Express server |
| `client/src/types/index.ts` | TypeScript interfaces, types, and utility functions |
| `client/src/components/` | Reusable React components for UI |
| `.env` | Environment variables (never commit this file!) |

---

## 📡 API Documentation

### json-server Endpoints (Port 3000)

#### Conversations

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/conversations` | Get all conversations | `?user_id=xxx` |
| GET | `/conversations/:id` | Get specific conversation | - |
| POST | `/conversations` | Create new conversation | - |
| PATCH | `/conversations/:id` | Update conversation | - |
| DELETE | `/conversations/:id` | Delete conversation | - |

#### Messages

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/messages` | Get all messages | `?conversation_id=xxx` |
| GET | `/messages/:id` | Get specific message | - |
| POST | `/messages` | Create new message | - |
| PATCH | `/messages/:id` | Update message | - |
| DELETE | `/messages/:id` | Delete message | - |

**Example:**
```bash
# Get all conversations for a user
curl "http://localhost:3000/conversations?user_id=user-a1b2c3d4e5"

# Get messages for a conversation
curl "http://localhost:3000/messages?conversation_id=conv-001"
```

### Express Server Endpoints (Port 9000)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/health` | Health check | - |
| POST | `/chat` | Stream AI response | `{ query: string, history: Array }` |

**Example:**
```bash
# Health check
curl http://localhost:9000/health

# Send chat message (streaming response)
curl -X POST http://localhost:9000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Hello, how are you?",
    "history": []
  }'
```

### Frontend API Functions

Located in `client/src/api/chatApi.ts`:
```typescript
// Conversation management
getConversations(userId: string): Promise<Conversation[]>
createConversation(conversation: Conversation): Promise<Conversation>
updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>
deleteConversation(id: string): Promise<void>

// Message management
getMessages(conversationId: string): Promise<Message[]>
saveMessage(message: Message): Promise<Message>
saveMessagePair(user: Message, assistant: Message, convId: string): Promise<{user, assistant}>

// AI streaming
sendMessageStream(query: string, history: GeminiHistoryItem[]): AsyncGenerator<StreamChunk>

// Utilities
getUserLocation(): Promise<{latitude: number, longitude: number}>
testExpressConnection(): Promise<boolean>
testJsonServerConnection(): Promise<boolean>
```

---

## 📖 Usage Guide

### Starting a New Conversation

1. Click the **"New Chat"** button in the sidebar
2. Type your message in the input box at the bottom
3. Press **Enter** or click the **Send** button
4. Watch the AI response stream in real-time
5. The conversation is automatically saved and appears in the sidebar

### Continuing an Existing Conversation

1. Click on any conversation in the sidebar
2. The message history loads automatically
3. Type your message and send
4. New messages are appended to the conversation

### Keyboard Shortcuts

- **Enter** - Send message
- **Shift + Enter** - New line in message
- **Ctrl/Cmd + R** - Refresh page (conversations persist)

### Features in Action

#### Code Blocks
When the AI provides code, hover over it to see the **Copy** button:
```javascript
// Example code from AI
function greet(name) {
  return `Hello, ${name}!`;
}
```

#### Markdown Support
The AI can use **bold**, *italic*, and other markdown formatting:
- Bullet lists
- Numbered lists
- Links
- Tables
- Blockquotes

#### Location Tracking
If you allow location access, your messages will include coordinates visible in the timestamp area.

---

## 🔧 Development

### Development Mode

Run all servers with hot-reload:
```bash
# Terminal 1
npm run json-server

# Terminal 2
npm run dev  # Uses nodemon for auto-restart

# Terminal 3
cd client && npm run dev
```

### Building for Production
```bash
cd client
npm run build
```

This creates an optimized build in `client/dist/`.

### Type Checking
```bash
cd client
npx tsc --noEmit
```

### Code Linting
```bash
cd client
npm run lint
```

### Testing APIs Manually

Create a test file `test-api.sh`:
```bash
#!/bin/bash
echo "Testing json-server..."
curl http://localhost:3000/conversations

echo "\nTesting Express server..."
curl http://localhost:9000/health

echo "\nTesting chat endpoint..."
curl -X POST http://localhost:9000/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Hello","history":[]}'
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

### Viewing Real-Time Database Changes

Watch `db.json` for live updates:
```bash
watch -n 1 cat db.json
```

Or with prettier formatting (requires `jq`):
```bash
watch -n 1 'cat db.json | jq .'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Port already in use"

**Problem:** One of the ports (3000, 5173, 9000) is already occupied.

**Solution:**
```bash
# Find and kill the process
# For port 3000
lsof -ti:3000 | xargs kill -9

# For port 9000
lsof -ti:9000 | xargs kill -9

# For port 5173
lsof -ti:5173 | xargs kill -9
```

Or change the port in the respective config file.

#### 2. "Gemini API Key not configured"

**Problem:** `.env` file is missing or API key is incorrect.

**Solution:**
1. Ensure `.env` exists in the root directory
2. Check that `GEMINI_API_KEY` is set correctly
3. Restart the Express server after updating `.env`

#### 3. "Failed to load conversations"

**Problem:** json-server is not running or `db.json` is corrupted.

**Solution:**
```bash
# Verify json-server is running
curl http://localhost:3000/conversations

# If corrupted, reset db.json to minimal structure
echo '{"conversations":[],"messages":[]}' > db.json

# Restart json-server
npm run json-server
```

#### 4. "Network Error" in browser

**Problem:** CORS issue or server not running.

**Solution:**
1. Check all three servers are running
2. Verify URLs in `client/src/types/index.ts`:
```typescript
export const CONSTANTS = {
  JSON_SERVER_URL: 'http://localhost:3000',
  EXPRESS_SERVER_URL: 'http://localhost:9000',
  // ...
}
```
3. Check browser console (F12) for specific errors

#### 5. "Module not found" errors

**Problem:** Dependencies not installed correctly.

**Solution:**
```bash
# Reinstall root dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall client dependencies
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

#### 6. TypeScript errors in IDE

**Problem:** IDE not recognizing TypeScript types.

**Solution:**
```bash
cd client
# Restart TypeScript server in VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or regenerate types
npx tsc --noEmit
```

### Debugging Tips

1. **Check server logs** - Each terminal shows real-time logs
2. **Browser DevTools** - Press F12 → Network tab to see API calls
3. **React DevTools** - Install React DevTools browser extension
4. **Console logs** - Check `console.log` outputs in browser and terminals

### Getting Help

If you encounter issues not covered here:

1. Check the browser console (F12) for errors
2. Check terminal outputs for all three servers
3. Verify all prerequisites are installed
4. Review the [API Documentation](#-api-documentation)
5. Create an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

## 🔒 Security Considerations

### API Key Protection

- ✅ **Never** commit `.env` file to version control
- ✅ API key is only used server-side (never exposed to frontend)
- ✅ Add `.env` to `.gitignore`

### CORS Configuration

The Express server only allows requests from `http://localhost:5173` by default. For production:
```javascript
// server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}));
```

### Data Privacy

- User messages and conversations are stored locally in `db.json`
- Location data is optional and can be disabled
- No data is sent to third parties except Google Gemini API

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the 'dist' folder
```

Update `CONSTANTS` in `client/src/types/index.ts` with production URLs.

### Backend Deployment (Heroku/Railway)

1. Use a production database (PostgreSQL, MongoDB)
2. Set environment variables on hosting platform
3. Update CORS origin to match frontend URL

---

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes | - |
| `PORT` | Express server port | No | 9000 |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Test all API endpoints before committing
- Ensure no TypeScript errors (`npx tsc --noEmit`)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) - AI model
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool
- [json-server](https://github.com/typicode/json-server) - Mock API

---

## 📞 Support

For questions or issues:
- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-chat-app/issues)
- 📖 Documentation: [Project Wiki](https://github.com/yourusername/ai-chat-app/wiki)

---

**Made with ❤️ using React, TypeScript, and Google Gemini AI**