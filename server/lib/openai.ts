import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

/**
 * Creates an OpenAI client with the provided API key
 */
const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({ apiKey });
};

/**
 * Generates a response from the OpenAI API
 */
export const generateAIResponse = async (
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
    
    const openai = createOpenAIClient(apiKey);
    
    // Create system message based on detected language
    const systemMessage = language && language !== 'en'
      ? `You are a helpful, multilingual AI assistant. The user is communicating in ${language}. Respond in the same language that the user is using. Be helpful, concise, and friendly.`
      : `You are a helpful, multilingual AI assistant. Identify the language the user is communicating in and respond in the same language. Be helpful, concise, and friendly.`;
    
    // Combine system message, chat history, and current message
    const messages = [
      { role: "system", content: systemMessage },
      ...chatHistory,
      { role: "user", content: message }
    ];
    
    const response = await openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800,
    });
    
    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    
    // Return a user-friendly error message
    if (error.response?.status === 401) {
      return "Error: Invalid API key. Please check your API key in settings.";
    } else if (error.response?.status === 429) {
      return "Error: You've reached your API rate limit. Please try again later.";
    } else {
      return "Error: Unable to generate a response. Please try again later.";
    }
  }
};

/**
 * Detects language using AI
 */
export const detectLanguageWithAI = async (text: string, apiKey: string): Promise<string> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a language detection expert. Analyze the given text and respond only with the ISO 639-1 language code (2 letters). For example, 'en' for English, 'es' for Spanish, etc."
        },
        {
          role: "user",
          content: `Detect the language of this text: "${text}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 10,
    });
    
    const languageCode = response.choices[0].message.content?.trim().toLowerCase();
    
    // Validate that it's a 2-letter code
    if (languageCode && /^[a-z]{2}$/.test(languageCode)) {
      return languageCode;
    }
    
    return 'en'; // Default to English if detection fails
  } catch (error) {
    console.error("Error detecting language with AI:", error);
    return 'en'; // Default to English on error
  }
};
