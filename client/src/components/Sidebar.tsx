import React from 'react';
import { Link, useLocation } from 'wouter';

const Sidebar = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Chat', path: '/chat' },
    { label: 'Image Generator', path: '/image-generator' },
    { label: 'Math Solver', path: '/math-solver' },
    { label: 'Code Assistant', path: '/code-assistant' },
    { label: 'Settings', path: '/settings' },
    { label: 'Chat History', path: '/history' },
    { label: 'About', path: '/about' }
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">AI Assistant</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link href={item.path}>
                <div className={`block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isActive(item.path) 
                    ? 'bg-gray-100 dark:bg-gray-800 font-medium' 
                    : ''
                }`}>
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 AI Assistant</p>
          <p>PostgreSQL + OpenAI + Anthropic</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;