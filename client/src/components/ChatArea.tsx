import { FC, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { Message } from "../hooks/useChatState";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  fontSize: number;
}

const ChatArea: FC<ChatAreaProps> = ({ messages, isLoading, fontSize }) => {
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 transition-colors">
      {messages.map((message, index) => (
        <ChatMessage 
          key={index} 
          message={message} 
          fontSize={fontSize}
        />
      ))}
      
      {isLoading && (
        <div className="flex items-start max-w-3xl mx-auto">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 dark:bg-primary-700 dark:text-white">
            <i className="fas fa-robot"></i>
          </div>
          <div className="ml-3 bg-white dark:bg-gray-700 px-4 py-3 rounded-lg shadow-sm dark:text-white">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
