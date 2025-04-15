/**
 * OpenAI API client helper functions for the frontend
 */

// Constants
export const MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4o', name: 'GPT-4o' }, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
];

/**
 * Generate system prompt for the AI based on language
 */
export const generateSystemPrompt = (language: string): string => {
  if (language && language !== 'en') {
    return `You are a helpful, multilingual AI assistant. The user is communicating in ${language}. Respond in the same language that the user is using. Be helpful, concise, and friendly.`;
  }
  
  return `You are a helpful, multilingual AI assistant. Identify the language the user is communicating in and respond in the same language. Be helpful, concise, and friendly.`;
};

/**
 * Formats the chat history for submission to the OpenAI API
 */
export const formatChatHistory = (messages: Array<{type: string, content: string}>) => {
  return messages.map(message => ({
    role: message.type === 'user' ? 'user' : 'assistant',
    content: message.content
  }));
};
