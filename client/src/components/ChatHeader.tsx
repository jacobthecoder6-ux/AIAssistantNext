import { FC } from "react";

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
  showNewChatButton: boolean;
}

const ChatHeader: FC<ChatHeaderProps> = ({ 
  onNewChat, 
  onToggleSidebar,
  showNewChatButton
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white dark:bg-gray-900">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-full hover:bg-primary-600 dark:hover:bg-gray-700 transition-colors"
        >
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="font-semibold">UnlockedAI v1</h2>
      </div>
      <div className="flex items-center space-x-2">
        {showNewChatButton && (
          <button 
            onClick={onNewChat}
            className="px-3 py-1 rounded-md bg-secondary-500 hover:bg-secondary-600 text-white transition-colors text-sm"
          >
            <i className="fas fa-plus mr-1"></i> New Chat
          </button>
        )}
        <div className="relative">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-primary-600 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
