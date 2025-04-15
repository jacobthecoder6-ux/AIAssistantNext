import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import ExportCodeButton from './ExportCodeButton';

type SidebarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  chatHistory: Array<{id: string, title: string, timestamp: Date}>;
  onLoadChat: (id: string) => void;
  onClearHistory: () => void;
  onNewChat: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, 
  onToggleSidebar,
  theme,
  onThemeChange,
  chatHistory,
  onLoadChat,
  onClearHistory,
  onNewChat
}) => {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [showChatHistory, setShowChatHistory] = useState(true);

  if (!isSidebarOpen && isMobile) {
    return null;
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">AI Chatbot</h2>
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>

          <nav className="space-y-2">
            <Link href="/">
              <a className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${location === '/' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Home
              </a>
            </Link>
            <Link href="/chat">
              <a className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${location === '/chat' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Chat
              </a>
            </Link>
            <Link href="/code-assistant">
              <a className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${location === '/code-assistant' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Code Assistant
              </a>
            </Link>
            <Link href="/image-generator">
              <a className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${location === '/image-generator' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Image Generator
              </a>
            </Link>
            <Link href="/math-solver">
              <a className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${location === '/math-solver' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Math Solver
              </a>
            </Link>
          </nav>

          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowChatHistory(!showChatHistory)}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-left text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Chat History
              </span>
              <svg className={`w-5 h-5 transition-transform ${showChatHistory ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
            {showChatHistory && (
              <div className="mt-2 space-y-1 pl-8">
                {chatHistory.length > 0 ? (
                  <>
                    {chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => onLoadChat(chat.id)}
                        className="w-full text-left px-2 py-1 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 truncate"
                      >
                        {chat.title}
                      </button>
                    ))}
                    <button
                      onClick={onClearHistory}
                      className="w-full text-left px-2 py-1 text-sm text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Clear History
                    </button>
                  </>
                ) : (
                  <p className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                    No chat history yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Theme</label>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="p-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="pt-2">
            <ExportCodeButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;