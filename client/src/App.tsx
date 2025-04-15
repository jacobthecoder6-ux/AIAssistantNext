import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import ChatPage from "./pages/ChatPage";
import NotFound from "@/pages/not-found";
import HomePage from "./pages/HomePage";
import Sidebar from "@/components/Sidebar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";

// Create pages for our new routes
const ImageGeneratorPage = () => <div className="flex-1 p-8"><h1 className="text-2xl font-bold">Image Generator - Coming Soon</h1></div>;
const MathSolverPage = () => <div className="flex-1 p-8"><h1 className="text-2xl font-bold">Math Solver - Coming Soon</h1></div>;
const CodeAssistantPage = () => <div className="flex-1 p-8"><h1 className="text-2xl font-bold">Code Assistant - Coming Soon</h1></div>;
const SettingsPage = () => <div className="flex-1 p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>;
const HistoryPage = () => <div className="flex-1 p-8"><h1 className="text-2xl font-bold">Chat History - Coming Soon</h1></div>;
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [location] = useLocation();
  const [prefersDarkMode, setPrefersDarkMode] = useLocalStorage<boolean>("prefersDarkMode", false);
  
  // Check if the current location is the homepage
  const isHomePage = location === "/";

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Toggle dark mode
  const toggleTheme = () => {
    setPrefersDarkMode(!prefersDarkMode);
  };

  // Apply theme based on preference
  useEffect(() => {
    document.documentElement.classList.toggle("dark", prefersDarkMode);
  }, [prefersDarkMode]);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* Only show sidebar on non-homepage routes */}
        {!isHomePage && <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />}
        
        <main className={`flex-1 h-screen overflow-auto`}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/chat" component={ChatPage} />
            <Route path="/image-generator" component={ImageGeneratorPage} />
            <Route path="/math-solver" component={MathSolverPage} />
            <Route path="/code-assistant" component={CodeAssistantPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/about" component={AboutPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
