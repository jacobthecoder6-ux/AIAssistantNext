import { FC } from "react";
import TitleScreen from "./TitleScreen";
import ChatHeader from "./ChatHeader";
import ChatArea from "./ChatArea";
import InputArea from "./InputArea";
import SettingsPanel from "./SettingsPanel";
import { Message } from "../hooks/useChatState";

interface ChatContainerProps {
  messages: Message[];
  chatStarted: boolean;
  isLoading: boolean;
  currentMessage: string;
  apiKey: string;
  selectedModel: string;
  interfaceLanguage: string;
  fontSize: number;
  theme: string;
  chatHistory: Array<{id: string, title: string, timestamp: Date}>;
  isSidebarOpen: boolean;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  onLanguageChange: (lang: string) => void;
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: string) => void;
  onStartChat: () => void;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  onLoadChat: (id: string) => void;
  onToggleSidebar: () => void;
}

const ChatContainer: FC<ChatContainerProps> = ({
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
  onApiKeyChange,
  onModelChange,
  onLanguageChange,
  onFontSizeChange,
  onThemeChange,
  onStartChat,
  onSendMessage,
  onNewChat,
  onClearHistory,
  onLoadChat,
  onToggleSidebar
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      onSendMessage(currentMessage);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row max-w-6xl mx-auto h-screen p-2 md:p-4 transition-colors duration-300`}>
      <div className="relative flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-colors duration-300 dark:bg-gray-800">
        {!chatStarted && (
          <TitleScreen 
            onStartChat={onStartChat} 
          />
        )}

        <ChatHeader 
          onNewChat={onNewChat} 
          onToggleSidebar={onToggleSidebar} 
          showNewChatButton={chatStarted}
        />

        <ChatArea 
          messages={messages} 
          isLoading={isLoading} 
          fontSize={fontSize}
        />

        <InputArea 
          currentMessage={currentMessage}
          onMessageChange={(msg) => onSendMessage(msg)}
          onSubmit={handleSubmit}
          showApiKeyWarning={!apiKey}
        />
      </div>

      <SettingsPanel 
        isOpen={isSidebarOpen}
        onClose={onToggleSidebar}
        apiKey={apiKey}
        onApiKeyChange={onApiKeyChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        interfaceLanguage={interfaceLanguage}
        onLanguageChange={onLanguageChange}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        theme={theme}
        onThemeChange={onThemeChange}
        chatHistory={chatHistory}
        onClearHistory={onClearHistory}
        onLoadChat={onLoadChat}
      />
    </div>
  );
};

export default ChatContainer;
