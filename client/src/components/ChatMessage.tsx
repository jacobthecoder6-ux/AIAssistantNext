import { FC } from "react";
import { Message } from "../hooks/useChatState";

interface ChatMessageProps {
  message: Message;
  fontSize: number;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, fontSize }) => {
  const { type, content } = message;
  
  if (type === 'user') {
    return (
      <div className="message user-message">
        <div className="flex items-start max-w-3xl mx-auto justify-end">
          <div 
            className="mr-3 bg-primary-500 text-white px-4 py-3 rounded-lg shadow-sm max-w-[80%]"
          >
            <p style={{ fontSize: `${fontSize}px` }}>{content}</p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="message bot-message">
        <div className="flex items-start max-w-3xl mx-auto">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 dark:bg-primary-700 dark:text-white">
            <i className="fas fa-robot"></i>
          </div>
          <div className="ml-3 bg-white dark:bg-gray-700 px-4 py-3 rounded-lg shadow-sm dark:text-white max-w-[80%]">
            <p style={{ fontSize: `${fontSize}px` }}>{content}</p>
          </div>
        </div>
      </div>
    );
  }
};

export default ChatMessage;
