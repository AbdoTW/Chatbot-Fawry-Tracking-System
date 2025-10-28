require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Express server is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY 
  });
});

// Main chat endpoint with streaming
app.post('/chat', async (req, res) => {
  try {
    const { query, history = [] } = req.body;

    // Validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });


    // Start chat with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // Send message and stream response
    const result = await chat.sendMessageStream(query);

    // Process stream chunks
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      
      if (chunkText) {
        // Send chunk to frontend in SSE format
        const data = JSON.stringify({ text: chunkText, done: false });
        res.write(`data: ${data}\n\n`);
      }
    }

    // Send completion signal
    const finalData = JSON.stringify({ text: '', done: true });
    res.write(`data: ${finalData}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    
    // Send error to client
    const errorData = JSON.stringify({ 
      error: true, 
      message: error.message || 'Failed to process request',
      done: true 
    });
    res.write(`data: ${errorData}\n\n`);
    res.end();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📡 Gemini API Key configured: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`🔗 CORS enabled for: http://localhost:5173`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Express server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Express server...');
  process.exit(0);
});