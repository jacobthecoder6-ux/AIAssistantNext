/**
 * Anthropic API client helper functions for the frontend
 */

// Constants
export const ANTHROPIC_MODELS = [
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' }, // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
];

/**
 * Generate system prompt for the AI based on language
 */
export const generateAnthropicSystemPrompt = (language: string): string => {
  if (language && language !== 'en') {
    return `You are Claude, a helpful, multilingual AI assistant. The user is communicating in ${language}. Respond in the same language that the user is using. Be helpful, concise, and friendly.`;
  }
  
  return `You are Claude, a helpful, multilingual AI assistant. Identify the language the user is communicating in and respond in the same language. Be helpful, concise, and friendly.`;
};

/**
 * Formats the chat history for submission to the Anthropic API
 */
export const formatAnthropicChatHistory = (messages: Array<{type: string, content: string}>) => {
  return messages.map(message => ({
    role: message.type === 'user' ? 'user' : 'assistant',
    content: message.content
  }));
};