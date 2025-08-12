import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIResponse, detectLanguageWithAI, generateImage, generateCodeAssistance, solveMathProblem } from "./lib/openai";
import { generateAnthropicResponse, detectLanguageWithAnthropic } from "./lib/anthropic";
import * as fs from 'fs';
import * as path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // Password validation endpoint
  app.post('/api/validate-password', async (req, res) => {
    try {
      const { password } = req.body;

      // Validate 7-letter format with only letters (uppercase and lowercase allowed)
      if (!/^[a-zA-Z]{7}$/.test(password)) {
        return res.status(400).json({ error: 'Password must be exactly 7 letters (uppercase and lowercase allowed)' });
      }

      // Accept any 7-letter password that meets the format requirement
      res.json({ valid: true });
    } catch (error) {
      console.error('Password validation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, model, language, provider = 'openai' } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }


      // Get chat history from memory storage
      let chatHistory: Array<{role: string, content: string}> = [];
      if (req.body.chatId) {
        const chat = await storage.getChatById(req.body.chatId);
        if (chat) {
          chatHistory = chat.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
        }
      }

      // Generate response based on selected provider
      let response = '';
      if (provider === 'anthropic') {
        const anthropicResponse = await generateAnthropicResponse(message, chatHistory, {
          model,
          language,
        });
        response = anthropicResponse || 'Error: Unable to generate response from Anthropic';
      } else {
        const openaiResponse = await generateAIResponse(message, chatHistory, {
          model,
          language,
        });
        response = openaiResponse || 'Error: Unable to generate response from OpenAI';
      }

      // Store the message and response if we have a chatId
      if (req.body.chatId) {
        await storage.addMessageToChat(req.body.chatId, {
          type: 'user',
          content: message,
          timestamp: new Date()
        });

        await storage.addMessageToChat(req.body.chatId, {
          type: 'bot',
          content: response || 'Error: Unable to generate response',
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
      const { text, provider = 'openai' } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      let language = 'en'; // Default to English

      // If API key is provided, use AI for detection based on provider
      if (provider === 'anthropic') {
        language = await detectLanguageWithAnthropic(text);
      } else if (provider === 'openai') {
        language = await detectLanguageWithAI(text);
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
      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }
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
      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }
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
      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      await storage.clearAllChats();

      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing chats:', error);
      res.status(500).json({ error: 'Failed to clear chats' });
    }
  });

  // Image generation endpoint
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, size = '1024x1024' } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const imageUrl = await generateImage(prompt, process.env.OPENAI_API_KEY || '', size);

      res.json({ imageUrl });
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).json({ 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Code assistance endpoint
  app.post('/api/code-assistance', async (req, res) => {
    try {
      const { code, language, task } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const result = await generateCodeAssistance(code, language, task, process.env.OPENAI_API_KEY || '');

      if (req.body.chatId) {
        // Record the interaction in chat history
        await storage.addMessageToChat(req.body.chatId, {
          type: 'user',
          content: `Code assistance request for ${language}: ${task}\n\`\`\`${language}\n${code}\n\`\`\``,
          timestamp: new Date(),
          codeBlocks: { language, code }
        });

        await storage.addMessageToChat(req.body.chatId, {
          type: 'bot',
          content: result,
          timestamp: new Date()
        });
      }

      // Store the code snippet for future reference
      if (req.body.userId) {
        await storage.createCodeSnippet?.({
          userId: req.body.userId,
          title: task || 'Code Snippet',
          description: 'Created via Code Assistant',
          language: language || 'text',
          code,
          tags: ['generated'],
        });
      }

      res.json({ result });
    } catch (error) {
      console.error('Error with code assistance:', error);
      res.status(500).json({ 
        error: 'Failed to process code',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Math solver endpoint
  app.post('/api/solve-math', async (req, res) => {
    try {
      const { problem, showSteps = true } = req.body;

      if (!problem) {
        return res.status(400).json({ error: 'Math problem is required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const solution = await solveMathProblem(problem, process.env.OPENAI_API_KEY || '', showSteps);

      if (req.body.chatId) {
        // Record the interaction in chat history
        await storage.addMessageToChat(req.body.chatId, {
          type: 'user',
          content: `Math problem: ${problem}`,
          timestamp: new Date()
        });

        await storage.addMessageToChat(req.body.chatId, {
          type: 'bot',
          content: solution,
          timestamp: new Date()
        });
      }

      res.json({ solution });
    } catch (error) {
      console.error('Error solving math problem:', error);
      res.status(500).json({ 
        error: 'Failed to solve math problem',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Code snippet storage and retrieval endpoints
  app.post('/api/code-snippets', async (req, res) => {
    try {
      const { userId, title, description, language, code, tags } = req.body;

      if (!userId || !code || !language) {
        return res.status(400).json({ error: 'UserId, code, and language are required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const snippet = await storage.createCodeSnippet?.({
        userId,
        title: title || 'Untitled Snippet',
        description: description || '',
        language,
        code,
        tags: tags || [],
      });

      res.json({ snippet });
    } catch (error) {
      console.error('Error saving code snippet:', error);
      res.status(500).json({ error: 'Failed to save code snippet' });
    }
  });

  app.get('/api/code-snippets', async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      const language = req.query.language as string;

      if (!userId && !language) {
        return res.status(400).json({ error: 'Either userId or language is required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      let snippets;
      if (userId) {
        snippets = await storage.getCodeSnippets?.(userId);
      } else if (language) {
        snippets = await storage.getCodeSnippetsByLanguage?.(language);
      }

      res.json({ snippets: snippets || [] });
    } catch (error) {
      console.error('Error fetching code snippets:', error);
      res.status(500).json({ error: 'Failed to fetch code snippets' });
    }
  });

  // Specialized chatbot endpoints

  // Create specialized chatbot
  app.post('/api/chatbots', async (req, res) => {
    try {
      const { 
        type, 
        name, 
        description, 
        systemPrompt, 
        welcomeMessage, 
        exampleQuestions = [] 
      } = req.body;

      if (!name || !systemPrompt) {
        return res.status(400).json({ error: 'Name and systemPrompt are required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Create the chatbot
      const chatbot = await storage.createSpecializedChatbot({
        type: type || 'custom',
        name,
        description: description || 'Custom Chatbot',
        systemPrompt,
        welcomeMessage: welcomeMessage || 'Hello! How can I help you today?',
        exampleQuestions: Array.isArray(exampleQuestions) ? exampleQuestions : [],
      });

      res.json({ 
        id: chatbot.id,
        name: chatbot.name
      });
    } catch (error) {
      console.error('Error creating specialized chatbot:', error);
      res.status(500).json({ error: 'Failed to create specialized chatbot' });
    }
  });

  // Get specialized chatbot
  app.get('/api/chatbots/:id', async (req, res) => {
    try {
      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      const chatbot = await storage.getSpecializedChatbotById(req.params.id);

      if (!chatbot) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }

      res.json({ chatbot });
    } catch (error) {
      console.error('Error fetching specialized chatbot:', error);
      res.status(500).json({ error: 'Failed to fetch specialized chatbot' });
    }
  });

  // List all specialized chatbots
  app.get('/api/chatbots', async (req, res) => {
    try {
      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      const chatbots = await storage.getAllSpecializedChatbots();
      res.json({ chatbots });
    } catch (error) {
      console.error('Error fetching specialized chatbots:', error);
      res.status(500).json({ error: 'Failed to fetch specialized chatbots' });
    }
  });

  // Send message to specialized chatbot
  app.post('/api/chatbot-message', async (req, res) => {
    try {
      const { message, chatbotId, systemPrompt, chatHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Get the chatbot
      const chatbot = await storage.getSpecializedChatbotById(chatbotId);

      if (!chatbot) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }

      // Use environment API key
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      // Format chat history with system prompt
      const formattedHistory = [
        { role: 'system', content: chatbot.systemPrompt || systemPrompt },
        ...chatHistory
      ];

      // Generate response
      const response = await generateAIResponse(message, formattedHistory, {
        model: 'gpt-4o',
        apiKey
      });

      // Store the message and response
      await storage.addSpecializedChatbotMessage(chatbotId, {
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      await storage.addSpecializedChatbotMessage(chatbotId, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      res.json({ response });
    } catch (error) {
      console.error('Error sending message to specialized chatbot:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Export project code endpoint
  app.get('/api/export-code', async (req, res) => {
    try {
      const password = req.headers.authorization?.split(' ')[1] || req.body.password;

      if (!password) {
        return res.status(400).json({ error: 'Password is required to use this feature' });
      }

      // Replace this with your actual password
      const VALID_PASSWORD = "your-secure-password";

      if (password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      // Create a structured representation of the project files and their contents
      const projectStructure = {
        name: "AI Chatbot Project",
        description: "A multilingual AI chatbot with code assistance, image generation, math solving, and specialized chatbot creation capabilities",
        version: "1.0.0",
        license: "MIT",
        author: "Created by Replit",
        features: [
          "Multilingual interface and AI responses",
          "Code generation, analysis, and improvement",
          "Image generation with DALL-E",
          "Math problem solving with step-by-step solutions",
          "Chat history storage",
          "Theme customization",
          "Specialized chatbot creation (therapist, financial advisor, etc.)"
        ],
        components: {
          frontend: {
            pages: [
              "HomePage", "ChatPage", "CodeAssistantPage", "ImageGeneratorPage", 
              "MathSolverPage", "ChatbotBuilderPage", "SpecializedChatbotPage"
            ],
            components: [
              "ChatContainer", "ChatHeader", "ChatArea", "InputArea", 
              "Sidebar", "SettingsPanel", "ExportCodeButton"
            ],
            libs: [
              "openai.ts", "anthropic.ts", "queryClient.ts", "languageUtils.ts"
            ]
          },
          backend: {
            routes: [
              "/api/chat", "/api/detect-language", "/api/chats", 
              "/api/generate-image", "/api/code-assistance", "/api/solve-math",
              "/api/code-snippets", "/api/export-code", "/api/chatbots", "/api/chatbot-message"
            ],
            services: [
              "openai.ts", "anthropic.ts", "storage.ts", "db.ts"
            ],
            database: {
              models: [
                "users", "chats", "messages", "code_snippets", 
                "prompt_templates", "specialized_chatbots", "specialized_chatbot_messages"
              ]
            }
          }
        },
        installation: {
          steps: [
            "1. Clone the repository",
            "2. Run 'npm install' to install dependencies",
            "3. Set up a PostgreSQL database",
            "4. Set environment variables (DATABASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY, APP_PASSWORD)",
            "5. Run 'npm run dev' to start the application"
          ]
        },
        environmentVariables: [
          "DATABASE_URL - PostgreSQL connection string",
          "OPENAI_API_KEY - OpenAI API key for AI features",
          "ANTHROPIC_API_KEY - Anthropic API key for Claude features",
          "APP_PASSWORD - Application password for authentication"
        ],
        aiIntegration: {
          supportedModels: {
            openai: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
            anthropic: ["claude-3-7-sonnet-20250219", "claude-3-opus", "claude-3-sonnet"]
          },
          features: {
            chat: "General conversation with context-aware responses",
            codeAssistance: "Generate, debug, and optimize code across multiple languages",
            imageGeneration: "Create detailed images from text descriptions",
            mathSolving: "Solve complex mathematical problems with step-by-step solutions",
            specializedChatbots: "Create and use specialized chatbots for therapy, financial advice, etc."
          }
        }
      };

      res.json({ code: JSON.stringify(projectStructure, null, 2) });
    } catch (error) {
      console.error('Error exporting project code:', error);
      res.status(500).json({ error: 'Failed to export project code' });
    }
  });

  // Email authentication endpoint
  app.post('/api/auth/email', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Store the email and password
      await storage.storeUserPassword(email, password);

      res.json({ success: true });
    } catch (error) {
      console.error('Error in email auth:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Google authentication endpoint
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      // Verify Google token
      const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
      const data = await response.json();

      if (!data.email) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }

      // Store user info and password
      await storage.storeUserPassword(data.email, password);

      res.json({ 
        success: true,
        email: data.email,
        name: data.name
      });
    } catch (error) {
      console.error('Error in Google auth:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Add password validation endpoint
  app.post('/api/validate-password', async (req, res) => {
    const password = req.body.password;

    // Validate 7-character password format with only letters (uppercase and lowercase allowed)
    if (!/^[a-zA-Z]{7}$/.test(password)) {
      return res.status(400).json({ error: 'Password must be exactly 7 letters (uppercase and lowercase allowed)' });
    }

    // Accept any password that meets the 7-letter format requirement
    return res.json({ success: true });
  });


  const httpServer = createServer(app);
  return httpServer;
}