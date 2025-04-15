import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';

// Define the type for chat messages
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Creates an Anthropic client with the provided API key
 */
const createAnthropicClient = (apiKey: string) => {
  return new Anthropic({
    apiKey
  });
};

/**
 * Generates a response from the Anthropic API
 */
export const generateAnthropicResponse = async (
  message: string, 
  chatHistory: Array<{role: string, content: string}> = [],
  options: {
    model?: string;
    language?: string;
    apiKey: string;
  }
) => {
  try {
    const { model = DEFAULT_MODEL, language, apiKey } = options;
    
    if (!apiKey) {
      throw new Error("API key is required");
    }
    
    const anthropic = createAnthropicClient(apiKey);
    
    // Create system message based on detected language
    const systemMessage = language && language !== 'en'
      ? `You are Claude, a helpful, multilingual AI assistant. The user is communicating in ${language}. Respond in the same language that the user is using. Be helpful, concise, and friendly.`
      : `You are Claude, a helpful, multilingual AI assistant. Identify the language the user is communicating in and respond in the same language. Be helpful, concise, and friendly.`;
    
    // Format messages for Anthropic API
    const formattedMessages: ChatMessage[] = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    const response = await anthropic.messages.create({
      model,
      system: systemMessage,
      messages: [...formattedMessages, { role: 'user', content: message }],
      max_tokens: 1024,
    });
    
    const content = response.content[0];
    if ('text' in content) {
      return content.text;
    } else {
      return "Error: Unexpected response format from Claude.";
    }
  } catch (error: any) {
    console.error("Error generating Anthropic response:", error);
    
    // Return a user-friendly error message
    if (error.status === 401) {
      return "Error: Invalid API key. Please check your Anthropic API key in settings.";
    } else if (error.status === 429) {
      return "Error: You've reached your Anthropic API rate limit. Please try again later.";
    } else {
      return "Error: Unable to generate a response from Claude. Please try again later.";
    }
  }
};

/**
 * Detects language using Anthropic
 */
export const detectLanguageWithAnthropic = async (text: string, apiKey: string): Promise<string> => {
  try {
    const anthropic = createAnthropicClient(apiKey);
    
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      system: "You are a language detection expert. Analyze the given text and respond only with the ISO 639-1 language code (2 letters). For example, 'en' for English, 'es' for Spanish, etc.",
      messages: [
        {
          role: "user",
          content: `Detect the language of this text: "${text}"`
        }
      ],
      max_tokens: 10,
    });
    
    let languageCode = '';
    const content = response.content[0];
    if ('text' in content) {
      languageCode = content.text.trim().toLowerCase();
    }
    
    // Validate that it's a 2-letter code
    if (languageCode && /^[a-z]{2}$/.test(languageCode)) {
      return languageCode;
    }
    
    return 'en'; // Default to English if detection fails
  } catch (error) {
    console.error("Error detecting language with Anthropic:", error);
    return 'en'; // Default to English on error
  }
};