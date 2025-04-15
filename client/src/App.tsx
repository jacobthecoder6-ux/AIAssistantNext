import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Page components
import ChatPage from "./pages/ChatPage";
import NotFound from "@/pages/not-found";
import HomePage from "./pages/HomePage";
import ImageGeneratorPage from "./pages/ImageGeneratorPage";
import MathSolverPage from "./pages/MathSolverPage";
import CodeAssistantPage from "./pages/CodeAssistantPage";

// UI components
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/toaster";

// About page component
const AboutPage = () => (
  <div className="flex-1 p-8">
    <h1 className="text-2xl font-bold mb-4">About AI Assistant</h1>
    <p className="mb-2">AI Assistant is an advanced multilingual chatbot that integrates OpenAI and Anthropic APIs.</p>
    <p className="mb-2">Features include:</p>
    <ul className="list-disc pl-5 mb-4">
      <li>Multi-language support</li>
      <li>Code generation and debugging</li>
      <li>Math problem solving</li>
      <li>Image generation</li>
      <li>Persistent chat history</li>
      <li>Customizable UI with light/dark themes</li>
    </ul>
    <p>Built with React, TypeScript, and Express with PostgreSQL database.</p>
  </div>
);

function App() {
  const { toast } = useToast();
  const [location] = useLocation();
  const isHomePage = location === "/";
  
  // Theme settings
  const [theme, setTheme] = useLocalStorage<string>("theme", "light");
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Chat history
  const [chatHistory, setChatHistory] = useState<Array<{id: string, title: string, timestamp: Date}>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await apiRequest<{ chats: Array<{id: string, title: string, timestamp: string}> }>('/api/chats');
        
        if (response.chats) {
          // Convert string timestamps to Date objects
          const chatsWithDates = response.chats.map(chat => ({
            ...chat,
            timestamp: new Date(chat.timestamp)
          }));
          
          // Sort by most recent first
          chatsWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          setChatHistory(chatsWithDates);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    
    fetchChatHistory();
  }, []);
  
  // Create a new chat
  const handleNewChat = async () => {
    try {
      const response = await apiRequest<{ id: string }>('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.id) {
        setCurrentChatId(response.id);
        
        // Add new chat to history
        setChatHistory(prev => [{
          id: response.id,
          title: 'New Chat',
          timestamp: new Date()
        }, ...prev]);
        
        // Navigate to chat page
        window.location.href = '/chat';
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    }
  };
  
  // Load existing chat
  const handleLoadChat = (id: string) => {
    setCurrentChatId(id);
    window.location.href = '/chat';
  };
  
  // Clear all chat history
  const handleClearHistory = async () => {
    try {
      await apiRequest('/api/chats', {
        method: 'DELETE'
      });
      
      setChatHistory([]);
      setCurrentChatId(null);
      
      toast({
        title: "Success",
        description: "Chat history cleared"
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive"
      });
    }
  };
  
  // Toggle sidebar visibility
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {!isHomePage && (
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          theme={theme}
          onThemeChange={setTheme}
          chatHistory={chatHistory}
          onLoadChat={handleLoadChat}
          onClearHistory={handleClearHistory}
          onNewChat={handleNewChat}
        />
      )}
      
      <main className={`flex-1 h-screen overflow-auto ${!isHomePage && isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/chat">
            <ChatPage 
              currentChatId={currentChatId}
              onToggleSidebar={handleToggleSidebar}
            />
          </Route>
          <Route path="/image-generator" component={ImageGeneratorPage} />
          <Route path="/math-solver" component={MathSolverPage} />
          <Route path="/code-assistant" component={CodeAssistantPage} />
          <Route path="/about" component={AboutPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
