import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface Chatbot {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  welcomeMessage: string;
  exampleQuestions: string[];
  type: string;
}

const SpecializedChatbotPage = () => {
  const [match, params] = useRoute('/chatbot/:id');
  const chatbotId = params?.id;
  const { toast } = useToast();
  
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chatbot data
  useEffect(() => {
    const fetchChatbot = async () => {
      if (!chatbotId) return;
      
      try {
        const response = await apiRequest<{ chatbot: Chatbot }>(`/api/chatbots/${chatbotId}`);
        
        if (response?.chatbot) {
          setChatbot(response.chatbot);
          
          // Add welcome message
          setMessages([{
            id: uuidv4(),
            type: 'bot',
            content: response.chatbot.welcomeMessage,
            timestamp: new Date()
          }]);
        } else {
          toast({
            title: "Error",
            description: "Could not find the specified chatbot",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading chatbot:", error);
        toast({
          title: "Error",
          description: "Failed to load chatbot data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatbot();
  }, [chatbotId, toast]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || !chatbot) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsSending(true);
    
    try {
      // Send message to the specialized chatbot endpoint
      const response = await apiRequest<{ response: string }>('/api/chatbot-message', {
        method: 'POST',
        body: JSON.stringify({
          message: currentMessage,
          chatbotId,
          systemPrompt: chatbot.systemPrompt,
          chatHistory: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      });
      
      if (response?.response) {
        const botMessage: Message = {
          id: uuidv4(),
          type: 'bot',
          content: response.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("No response received");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "I'm sorry, I encountered an error processing your message. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get a response from the chatbot",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setCurrentMessage(question);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading chatbot...</span>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Chatbot Not Found</h1>
        <p>Sorry, we couldn't find the requested chatbot.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen max-w-4xl">
      <header className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <h1 className="text-xl font-bold">{chatbot.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{chatbot.description}</p>
      </header>

      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {chatbot.exampleQuestions.length > 0 && messages.length < 3 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {chatbot.exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(question)}
                className="text-sm bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600"
              >
                {question.length > 40 ? question.substring(0, 37) + '...' : question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            disabled={isSending}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-400"
            disabled={!currentMessage.trim() || isSending}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpecializedChatbotPage;