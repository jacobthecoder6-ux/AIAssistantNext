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
        content: "👋 Hello! I'm Unlocked AI, your ultimate multilingual assistant. How can I help you today?",
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

      // Send message to backend API with chat ID for persistence
      const response = await apiRequest<{ response: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          model: selectedModel,
          language: detectedLanguage || interfaceLanguage,
          apiKey,
          chatId: currentChatId,
          provider: 'openai'
        })
      });

      if (response) {
        // Add bot response to chat
        const botMessage: Message = {
          id: uuidv4(),
          type: 'bot',
          content: response.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      }

      // Update chat history with first message as title if this is a new chat
      if (currentChatId) {
        const updatedHistory = chatHistory.map(chat => {
          if (chat.id === currentChatId && chat.title === "New Conversation") {
            // Use first few words of first user message as the title
            const title = message.length > 30 
              ? message.substring(0, 30) + "..." 
              : message;

            // Update the title on the server
            apiRequest('/api/chats/' + currentChatId, {
              method: 'PATCH',
              body: JSON.stringify({ title })
            }).catch(err => console.error("Error updating chat title:", err));

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

  const startNewChat = async () => {
    setMessages([]);
    setIsLoading(true);

    try {
      // Create new chat on the server
      const chatResponse = await apiRequest<{ id: string }>('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ 
          title: "New Conversation"
        })
      });

      if (chatResponse?.id) {
        const newChatId = chatResponse.id;

        // Add welcome message
        const welcomeMessage: Message = {
          id: uuidv4(),
          type: 'bot',
          content: "👋 Welcome! I'm Unlocked AI, your ultimate multilingual assistant. How can I help you today?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);

        // Add the welcome message to the chat
        await apiRequest(`/api/chats/${newChatId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            type: 'bot',
            content: welcomeMessage.content
          })
        }).catch(err => console.error("Error adding welcome message:", err));

        // Create a new chat in history
        const newChat = {
          id: newChatId,
          title: "New Conversation",
          timestamp: new Date()
        };

        // Update local state
        const updatedHistory = [newChat, ...chatHistory];
        setChatHistory(updatedHistory);
        setCurrentChatId(newChatId);

        // Save to localStorage as backup
        localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
      } else {
        throw new Error("Failed to create a new chat");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);

      // Fallback to local-only chat if server fails
      const newChatId = uuidv4();
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "👋 Welcome! I'm Unlocked AI, your ultimate multilingual assistant. How can I help you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

      const newChat = {
        id: newChatId,
        title: "New Conversation",
        timestamp: new Date()
      };

      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      setCurrentChatId(newChatId);
      localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      // Clear chat history on the server
      await apiRequest('/api/chats', {
        method: 'DELETE'
      });

      // Clear local state
      setChatHistory([]);
      localStorage.removeItem('chat-history');

      // Clear current messages and chat ID
      setMessages([]);
      setCurrentChatId(null);

      // Remove all chat-* items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('chat-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const loadChat = async (id: string) => {
    try {
      setIsLoading(true);
      // Fetch chat from the server
      const chatResponse = await apiRequest<{ chat: { 
        id: string; 
        title: string; 
        messages?: Array<{
          id: string;
          type: 'user' | 'bot';
          content: string;
          timestamp: string;
        }>
      } }>(`/api/chats/${id}`);

      if (chatResponse?.chat) {
        // If messages are included in the response, use them
        if (chatResponse.chat.messages && chatResponse.chat.messages.length > 0) {
          setMessages(chatResponse.chat.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } else {
          // If no messages found, try to fetch from localStorage as fallback
          const storedChatData = localStorage.getItem(`chat-${id}`);

          if (storedChatData) {
            const chatData = JSON.parse(storedChatData);
            setMessages(chatData.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })));
          } else {
            // If no stored messages, create a welcome message
            const welcomeMessage: Message = {
              id: uuidv4(),
              type: 'bot',
              content: "Welcome back to this conversation! How can I help you now?",
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          }
        }

        setCurrentChatId(id);
        setIsSidebarOpen(false);

        // Update the timestamp for this chat
        apiRequest('/api/chats/' + id, {
          method: 'PATCH',
          body: JSON.stringify({ timestamp: new Date() })
        }).catch(err => console.error("Error updating chat timestamp:", err));

        // Update local state
        const updatedHistory = chatHistory.map(chat => 
          chat.id === id ? {...chat, timestamp: new Date()} : chat
        );
        setChatHistory(updatedHistory);
        localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "Sorry, there was an error loading this conversation. Let's start fresh!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } finally {
      setIsLoading(false);
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