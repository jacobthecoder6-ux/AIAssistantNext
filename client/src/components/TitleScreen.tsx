import { FC } from "react";

interface TitleScreenProps {
  onStartChat: () => void;
}

const TitleScreen: FC<TitleScreenProps> = ({ onStartChat }) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white text-center">
      <h1 className="text-4xl font-bold mb-4">Ultimate Multilingual AI Chatbot</h1>
      <p className="text-xl mb-8">Ask me anything in any language!</p>
      <div className="flex space-x-4">
        <button 
          onClick={onStartChat}
          className="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-md"
        >
          Start Chatting
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;
