import { FC, useState, useRef } from "react";

interface InputAreaProps {
  currentMessage: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  showApiKeyWarning: boolean;
}

const InputArea: FC<InputAreaProps> = ({ 
  currentMessage, 
  onMessageChange, 
  onSubmit, 
  showApiKeyWarning 
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMessageChange(message);
    setMessage("");
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore - WebkitSpeechRecognition is not in the standard lib.d.ts
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input 
              ref={inputRef}
              id="user-input" 
              type="text" 
              placeholder="Type your message here..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
            <button 
              type="button" 
              onClick={handleVoiceInput}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
            >
              <i className="fas fa-microphone"></i>
            </button>
          </div>
          <button 
            type="submit" 
            className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
        
        {showApiKeyWarning && (
          <div className="mt-2 text-center text-amber-600 dark:text-amber-400 text-sm">
            <p>⚠️ Please add your API key in settings to get real AI responses</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputArea;
