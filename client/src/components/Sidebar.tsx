import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Home,
  MessageSquare,
  Settings,
  Code,
  FileCode,
  BookOpen,
  PanelLeft,
  Maximize2,
  X,
  Database,
  Image,
  Calculator,
  ChevronRight,
  Info,
  Github
} from 'lucide-react';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
  const [location] = useLocation();
  const [codeExplorerOpen, setCodeExplorerOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <MessageSquare size={20} />, label: 'Chat', path: '/chat' },
    { icon: <Image size={20} />, label: 'Image Generator', path: '/image-generator' },
    { icon: <Calculator size={20} />, label: 'Math Solver', path: '/math-solver' },
    { icon: <Code size={20} />, label: 'Code Assistant', path: '/code-assistant' }
  ];

  const utilityItems = [
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    { icon: <Database size={20} />, label: 'Chat History', path: '/history' },
    { icon: <Info size={20} />, label: 'About', path: '/about' },
    { icon: <Github size={20} />, label: 'Source Code', onClick: () => setCodeExplorerOpen(!codeExplorerOpen) }
  ];

  const projectFiles = [
    { name: 'App.tsx', type: 'file', path: '/client/src/App.tsx' },
    { name: 'main.tsx', type: 'file', path: '/client/src/main.tsx' },
    { name: 'components', type: 'folder', children: [
      { name: 'ChatContainer.tsx', type: 'file', path: '/client/src/components/ChatContainer.tsx' },
      { name: 'ChatArea.tsx', type: 'file', path: '/client/src/components/ChatArea.tsx' },
      { name: 'ChatMessage.tsx', type: 'file', path: '/client/src/components/ChatMessage.tsx' },
      { name: 'InputArea.tsx', type: 'file', path: '/client/src/components/InputArea.tsx' },
      { name: 'Sidebar.tsx', type: 'file', path: '/client/src/components/Sidebar.tsx' }
    ]},
    { name: 'pages', type: 'folder', children: [
      { name: 'HomePage.tsx', type: 'file', path: '/client/src/pages/HomePage.tsx' },
      { name: 'ChatPage.tsx', type: 'file', path: '/client/src/pages/ChatPage.tsx' },
      { name: 'not-found.tsx', type: 'file', path: '/client/src/pages/not-found.tsx' }
    ]},
    { name: 'lib', type: 'folder', children: [
      { name: 'openai.ts', type: 'file', path: '/client/src/lib/openai.ts' },
      { name: 'anthropic.ts', type: 'file', path: '/client/src/lib/anthropic.ts' },
      { name: 'queryClient.ts', type: 'file', path: '/client/src/lib/queryClient.ts' },
      { name: 'themeUtils.ts', type: 'file', path: '/client/src/lib/themeUtils.ts' }
    ]},
    { name: 'server', type: 'folder', children: [
      { name: 'index.ts', type: 'file', path: '/server/index.ts' },
      { name: 'routes.ts', type: 'file', path: '/server/routes.ts' },
      { name: 'storage.ts', type: 'file', path: '/server/storage.ts' },
      { name: 'db.ts', type: 'file', path: '/server/db.ts' }
    ]},
    { name: 'shared', type: 'folder', children: [
      { name: 'schema.ts', type: 'file', path: '/shared/schema.ts' }
    ]}
  ];

  const renderFileTree = (files: any[], level = 0) => {
    return files.map((file, index) => (
      <div key={index}>
        <div 
          className={`flex items-center pl-${level * 4 + 4} py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-sm`}
          onClick={() => {}}
        >
          {file.type === 'folder' ? (
            <>
              <ChevronRight size={16} className="mr-1" />
              <FileCode size={16} className="mr-2 text-blue-500" />
            </>
          ) : (
            <FileCode size={16} className="mr-2 text-gray-500" />
          )}
          <span>{file.name}</span>
        </div>
        {file.type === 'folder' && file.children && renderFileTree(file.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className={`${expanded ? 'w-60' : 'w-16'} h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-sm`}>
      <div className="flex justify-between items-center p-4">
        {expanded ? (
          <>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <PanelLeft size={18} />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={onToggle} className="w-full">
            <Maximize2 size={18} />
          </Button>
        )}
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="space-y-1">
            {navItems.map((item, i) => (
              <TooltipProvider key={i} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.path}>
                      <Button
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className={`w-full justify-${expanded ? 'start' : 'center'} px-2`}
                      >
                        {item.icon}
                        {expanded && <span className="ml-2">{item.label}</span>}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {utilityItems.map((item, i) => (
              <TooltipProvider key={i} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {item.onClick ? (
                      <Button
                        variant={item.label === 'Source Code' && codeExplorerOpen ? "secondary" : "ghost"}
                        className={`w-full justify-${expanded ? 'start' : 'center'} px-2`}
                        onClick={item.onClick}
                      >
                        {item.icon}
                        {expanded && <span className="ml-2">{item.label}</span>}
                      </Button>
                    ) : (
                      <Link href={item.path}>
                        <Button
                          variant={isActive(item.path) ? "secondary" : "ghost"}
                          className={`w-full justify-${expanded ? 'start' : 'center'} px-2`}
                        >
                          {item.icon}
                          {expanded && <span className="ml-2">{item.label}</span>}
                        </Button>
                      </Link>
                    )}
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </ScrollArea>

      {codeExplorerOpen && (
        <div className={`absolute z-10 ${expanded ? 'left-60' : 'left-16'} top-0 w-80 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden transition-all`}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">Project Code Explorer</h3>
            <Button variant="ghost" size="icon" onClick={() => setCodeExplorerOpen(false)}>
              <X size={18} />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-56px)]">
            <div className="p-2">
              {renderFileTree(projectFiles)}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Sidebar;