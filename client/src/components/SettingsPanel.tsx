import { FC, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { formatDistanceToNow } from "date-fns";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  interfaceLanguage: string;
  onLanguageChange: (lang: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  chatHistory: Array<{id: string, title: string, timestamp: Date}>;
  onClearHistory: () => void;
  onLoadChat: (id: string) => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose,
  apiKey,
  onApiKeyChange,
  selectedModel,
  onModelChange,
  interfaceLanguage,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
  chatHistory,
  onClearHistory,
  onLoadChat
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  // Class for mobile/desktop layout
  const panelClasses = isOpen 
    ? "md:w-80 bg-white dark:bg-gray-900 shadow-lg rounded-lg transition-all duration-300 dark:text-white overflow-hidden" 
    : "hidden";

  // Mobile specific classes
  const mobileClasses = window.innerWidth < 768 && isOpen 
    ? "fixed inset-0 z-50" 
    : "";

  const handleDecreaseFont = () => {
    const newSize = Math.max(fontSize - 1, 12);
    onFontSizeChange(newSize);
    localStorage.setItem('preferred-font-size', newSize.toString());
  };

  const handleIncreaseFont = () => {
    const newSize = Math.min(fontSize + 1, 20);
    onFontSizeChange(newSize);
    localStorage.setItem('preferred-font-size', newSize.toString());
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    onFontSizeChange(size);
    localStorage.setItem('preferred-font-size', size.toString());
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    onApiKeyChange(key);
    localStorage.setItem('api-key', key);
  };

  return (
    <div className={`${panelClasses} ${mobileClasses}`}>
      <div className="p-4 bg-primary-500 dark:bg-gray-800 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Settings</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-primary-600 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]">
        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="font-medium block">Theme</label>
          <ThemeToggle 
            currentTheme={theme} 
            onThemeChange={onThemeChange} 
          />
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <label htmlFor="font-size" className="font-medium block">Font Size</label>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleDecreaseFont}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              <i className="fas fa-minus"></i>
            </button>
            <input 
              type="range" 
              id="font-size" 
              min="12" 
              max="20" 
              value={fontSize} 
              onChange={handleFontSizeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <button 
              onClick={handleIncreaseFont}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              <i className="fas fa-plus"></i>
            </button>
            <span className="w-8 text-center">{fontSize}</span>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label htmlFor="language-select" className="font-medium block">Interface Language</label>
          <select 
            id="language-select"
            value={interfaceLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="ko">🇰🇷 한국어</option>
          </select>
        </div>

        {/* AI Model Selection */}
        <div className="space-y-3">
          <label htmlFor="model-select" className="font-medium block">AI Model</label>
          <select 
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </div>

        {/* API Key */}
        <div className="space-y-3">
          <label htmlFor="api-key" className="font-medium block">API Key</label>
          <div className="relative">
            <input 
              type={showApiKey ? "text" : "password"}
              id="api-key" 
              placeholder="Enter your API key" 
              value={apiKey}
              onChange={handleApiKeyChange}
              className="w-full p-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button 
              onClick={toggleApiKeyVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <i className={`fas ${showApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your API key is stored locally and never sent to our servers</p>
        </div>

        {/* Chat History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium block">Chat History</label>
            <button 
              onClick={onClearHistory}
              className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {chatHistory.length > 0 ? (
              chatHistory.map((chat) => (
                <button 
                  key={chat.id}
                  onClick={() => onLoadChat(chat.id)}
                  className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-between transition-colors"
                >
                  <div className="truncate flex-1">{chat.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 py-2">No chat history</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
