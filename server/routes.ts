import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIResponse, detectLanguageWithAI } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, model, language, apiKey } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      // Get chat history from memory storage
      let chatHistory = [];
      if (req.body.chatId) {
        const chat = await storage.getChatById(req.body.chatId);
        if (chat) {
          chatHistory = chat.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
        }
      }
      
      // Generate AI response
      const response = await generateAIResponse(message, chatHistory, {
        model,
        language,
        apiKey
      });
      
      // Store the message and response if we have a chatId
      if (req.body.chatId) {
        await storage.addMessageToChat(req.body.chatId, {
          type: 'user',
          content: message,
          timestamp: new Date()
        });
        
        await storage.addMessageToChat(req.body.chatId, {
          type: 'bot',
          content: response,
          timestamp: new Date()
        });
      }
      
      res.json({ response });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Detect language endpoint
  app.post('/api/detect-language', async (req, res) => {
    try {
      const { text, apiKey } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      let language = 'en'; // Default to English
      
      // If API key is provided, use AI for detection
      if (apiKey) {
        language = await detectLanguageWithAI(text, apiKey);
      } else {
        // Basic detection for common European languages
        // This is a fallback if no API key is provided
        const lowerText = text.toLowerCase();
        
        if (/[àáâäæãåā]/.test(lowerText)) language = 'fr';
        else if (/[èéêëēėę]/.test(lowerText)) language = 'fr';
        else if (/[ìíîïī]/.test(lowerText)) language = 'es';
        else if (/[òóôöōøõ]/.test(lowerText)) language = 'es';
        else if (/[ùúûüū]/.test(lowerText)) language = 'fr';
        else if (/[ñ]/.test(lowerText)) language = 'es';
        else if (/[ç]/.test(lowerText)) language = 'fr';
        else if (/\b(das|der|die|und|ist|in|zu)\b/.test(lowerText)) language = 'de';
        else if (/\b(el|la|los|las|es|en|por|que)\b/.test(lowerText)) language = 'es';
        else if (/\b(le|la|les|un|une|est|dans|pour)\b/.test(lowerText)) language = 'fr';
      }
      
      res.json({ language });
    } catch (error) {
      console.error('Error in detect-language endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to detect language',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Create new chat endpoint
  app.post('/api/chats', async (req, res) => {
    try {
      const { title = 'New Conversation' } = req.body;
      
      const chatId = await storage.createChat(title);
      
      res.json({ id: chatId });
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });
  
  // Get chat history endpoint
  app.get('/api/chats', async (req, res) => {
    try {
      const chats = await storage.getAllChats();
      
      res.json({ chats });
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });
  
  // Get chat by ID endpoint
  app.get('/api/chats/:id', async (req, res) => {
    try {
      const chat = await storage.getChatById(req.params.id);
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      res.json({ chat });
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ error: 'Failed to fetch chat' });
    }
  });
  
  // Delete chat endpoint
  app.delete('/api/chats/:id', async (req, res) => {
    try {
      await storage.deleteChat(req.params.id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  });
  
  // Clear all chats endpoint
  app.delete('/api/chats', async (req, res) => {
    try {
      await storage.clearAllChats();
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing chats:', error);
      res.status(500).json({ error: 'Failed to clear chats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
