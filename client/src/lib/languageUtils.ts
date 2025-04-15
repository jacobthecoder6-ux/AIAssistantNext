import { apiRequest } from "@/lib/queryClient";

// List of supported languages with their codes
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

// Interface elements translated to different languages
export const translations: Record<string, Record<string, string>> = {
  'en': {
    'welcome': '👋 Hello! I\'m your multilingual AI assistant. I can help answer questions, provide information, or just chat in multiple languages. What would you like to talk about today?',
    'newChat': 'New Chat',
    'send': 'Send',
    'settings': 'Settings',
    'apiKeyRequired': 'Please add your API key in settings to get real AI responses',
    'typeMessage': 'Type your message here...',
    'chatHistory': 'Chat History',
    'clearAll': 'Clear All',
    'theme': 'Theme',
    'fontSize': 'Font Size',
    'interfaceLanguage': 'Interface Language',
    'aiModel': 'AI Model',
    'apiKey': 'API Key',
    'enterApiKey': 'Enter your API key',
    'apiKeyStoredLocally': 'Your API key is stored locally and never sent to our servers',
    'light': 'Light',
    'dark': 'Dark',
    'blue': 'Blue',
    'newConversation': 'New Conversation',
    'startingNewConversation': '👋 Starting a new conversation! How can I assist you today?',
    'errorProcessingRequest': 'Sorry, there was an error processing your request. Please try again later.',
  },
  'es': {
    'welcome': '👋 ¡Hola! Soy tu asistente de IA multilingüe. Puedo ayudarte a responder preguntas, proporcionar información o simplemente chatear en varios idiomas. ¿De qué te gustaría hablar hoy?',
    'newChat': 'Nuevo Chat',
    'send': 'Enviar',
    'settings': 'Ajustes',
    'apiKeyRequired': 'Por favor, añade tu clave API en los ajustes para obtener respuestas reales de IA',
    'typeMessage': 'Escribe tu mensaje aquí...',
    // ... add more translations as needed
  },
  // Add more languages as needed
};

/**
 * Detects the language of the input text
 * In a real implementation, this would call a language detection service
 * For now, we'll use a simple method based on common letters/characters
 */
export const detectLanguage = async (text: string): Promise<string | null> => {
  try {
    // In a real app, this would be a call to a language detection API
    // For now, we'll use a simplified approach
    
    // Clean the text for analysis
    const cleanText = text.toLowerCase().trim();
    
    // Check for languages with distinctive characters
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(cleanText)) {
      // Japanese/Chinese characters
      if (/[\u3040-\u309f\u30a0-\u30ff]/.test(cleanText)) {
        return 'ja'; // Japanese specific kana
      }
      if (/[\uac00-\ud7af\u1100-\u11ff]/.test(cleanText)) {
        return 'ko'; // Korean
      }
      return 'zh'; // Chinese
    }
    
    if (/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufefc]/.test(cleanText)) {
      return 'ar'; // Arabic
    }
    
    if (/[\u0900-\u097f]/.test(cleanText)) {
      return 'hi'; // Hindi
    }
    
    if (/[\u0400-\u04ff]/.test(cleanText)) {
      return 'ru'; // Cyrillic (Russian)
    }
    
    // For European languages, check common letter patterns
    const letterFreq: Record<string, number> = {};
    
    // Count letter frequencies
    for (const char of cleanText) {
      if (/[a-z]/.test(char)) {
        letterFreq[char] = (letterFreq[char] || 0) + 1;
      }
    }
    
    // Common letter patterns by language
    const patterns = {
      en: ['e', 't', 'a', 'o', 'i', 'n'],
      es: ['e', 'a', 'o', 's', 'r', 'n', 'ñ'],
      fr: ['e', 's', 'a', 'i', 't', 'n'],
      de: ['e', 'n', 'i', 's', 'r', 'a'],
      it: ['e', 'i', 'a', 'o', 'n', 't'],
      pt: ['e', 'a', 'o', 's', 'r', 'i']
    };
    
    // Check for language-specific words or patterns
    if (/\b(the|and|is|in|to|of|a)\b/.test(cleanText)) return 'en';
    if (/\b(el|la|los|las|de|en|es|por|que)\b/.test(cleanText)) return 'es';
    if (/\b(le|la|les|de|en|est|pour|que|et)\b/.test(cleanText)) return 'fr';
    if (/\b(der|die|das|und|ist|in|zu|den)\b/.test(cleanText)) return 'de';
    if (/\b(il|la|gli|e|di|che|per|un)\b/.test(cleanText)) return 'it';
    if (/\b(o|a|os|as|um|uma|de|em|por|que)\b/.test(cleanText)) return 'pt';
    
    // Default to English if can't determine
    return 'en';
  } catch (error) {
    console.error("Error detecting language:", error);
    return null;
  }
};

/**
 * Gets translation for a key in the specified language
 */
export const getTranslation = (key: string, language: string = 'en'): string => {
  if (!translations[language] || !translations[language][key]) {
    return translations['en'][key] || key;
  }
  return translations[language][key];
};
