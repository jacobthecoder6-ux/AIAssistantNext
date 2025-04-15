import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { detectLanguage } from "../lib/languageUtils";
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [interfaceLanguage, setInterfaceLanguage] = useState("en");
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light");
  const [chatHistory, setChatHistory] = useState<Array<{id: string, title: string, timestamp: Date}>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('chat-history');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        // Convert string dates back to Date objects
        const processedHistory = parsedHistory.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        }));
        setChatHistory(processedHistory);
      } catch (error) {
        console.error("Failed to parse chat history:", error);
      }
    }
  }, []);

  const startChat = () => {
    setChatStarted(true);
    if (messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "👋 Hello! I'm your multilingual AI assistant. I can help answer questions, provide information, or just chat in multiple languages. What would you like to talk about today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Create a new chat in history
      const newChatId = uuidv4();
      const newChat = {
        id: newChatId,
        title: "New Conversation",
        timestamp: new Date()
      };
      
      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      setCurrentChatId(newChatId);
      
      // Save to localStorage
      localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    
    try {
      // Detect language of the user message
      const detectedLanguage = await detectLanguage(message);
      
      // Send message to backend API
      const response = await apiRequest('POST', '/api/chat', {
        message,
        model: selectedModel,
        language: detectedLanguage || interfaceLanguage,
        apiKey
      });
      
      const data = await response.json();
      
      // Add bot response to chat
      const botMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update chat history with first message as title if this is a new chat
      if (currentChatId) {
        const updatedHistory = chatHistory.map(chat => {
          if (chat.id === currentChatId && chat.title === "New Conversation") {
            // Use first few words of first user message as the title
            const title = message.length > 30 
              ? message.substring(0, 30) + "..." 
              : message;
            
            return { ...chat, title, timestamp: new Date() };
          }
          return chat;
        });
        
        setChatHistory(updatedHistory);
        localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "Sorry, there was an error processing your request. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    
    // Add welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "👋 Starting a new conversation! How can I assist you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Create a new chat in history
      const newChatId = uuidv4();
      const newChat = {
        id: newChatId,
        title: "New Conversation",
        timestamp: new Date()
      };
      
      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      setCurrentChatId(newChatId);
      
      // Save to localStorage
      localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
    }, 300);
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chat-history');
  };

  const loadChat = async (id: string) => {
    try {
      // In a real app, you would fetch the chat from the server
      // For now, just retrieve from localStorage
      const storedChatData = localStorage.getItem(`chat-${id}`);
      
      if (storedChatData) {
        const chatData = JSON.parse(storedChatData);
        setMessages(chatData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        // If no stored messages, just create a welcome message
        const welcomeMessage: Message = {
          id: uuidv4(),
          type: 'bot',
          content: "Welcome back to this conversation! How can I help you now?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      setCurrentChatId(id);
      setIsSidebarOpen(false);
      
      // Update the timestamp for this chat
      const updatedHistory = chatHistory.map(chat => 
        chat.id === id ? {...chat, timestamp: new Date()} : chat
      );
      setChatHistory(updatedHistory);
      localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
      
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  // Save current chat messages whenever they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`chat-${currentChatId}`, JSON.stringify({
        id: currentChatId,
        messages
      }));
    }
  }, [messages, currentChatId]);

  return {
    messages,
    chatStarted,
    isLoading,
    currentMessage,
    apiKey,
    selectedModel,
    interfaceLanguage,
    fontSize,
    theme,
    chatHistory,
    isSidebarOpen,
    setMessages,
    setChatStarted,
    setIsLoading,
    setCurrentMessage,
    setApiKey,
    setSelectedModel,
    setInterfaceLanguage,
    setFontSize,
    setTheme,
    setChatHistory,
    setIsSidebarOpen,
    startChat,
    sendMessage,
    startNewChat,
    clearHistory,
    loadChat
  };
};

export default useChatState;
