import { useState, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import useChatState from "../hooks/useChatState";
import { useToast } from "@/hooks/use-toast";

const ChatPage = () => {
  const { toast } = useToast();
  const {
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
    setApiKey,
    setSelectedModel,
    setInterfaceLanguage,
    setFontSize,
    setTheme,
    setChatStarted,
    setIsSidebarOpen,
    startChat,
    sendMessage,
    startNewChat,
    clearHistory,
    loadChat
  } = useChatState();

  // Check for API key in local storage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      toast({
        title: "API Key Required",
        description: "Please add your API key in settings to get real AI responses",
        variant: "destructive"
      });
    }

    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedFontSize = localStorage.getItem('preferred-font-size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
  }, []);

  // Apply theme to document body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ChatContainer
      messages={messages}
      chatStarted={chatStarted}
      isLoading={isLoading}
      currentMessage={currentMessage}
      apiKey={apiKey}
      selectedModel={selectedModel}
      interfaceLanguage={interfaceLanguage}
      fontSize={fontSize}
      theme={theme}
      chatHistory={chatHistory}
      isSidebarOpen={isSidebarOpen}
      onApiKeyChange={setApiKey}
      onModelChange={setSelectedModel}
      onLanguageChange={setInterfaceLanguage}
      onFontSizeChange={setFontSize}
      onThemeChange={setTheme}
      onStartChat={startChat}
      onSendMessage={sendMessage}
      onNewChat={startNewChat}
      onClearHistory={clearHistory}
      onLoadChat={loadChat}
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    />
  );
};

export default ChatPage;
