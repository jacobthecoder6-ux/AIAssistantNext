/**
 * OpenAI API client helper functions for the frontend
 */

// Constants
export const MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4o', name: 'GPT-4o' }, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  { id: 'gpt-4o-vision', name: 'GPT-4o Vision (Images)' }
];

/**
 * Generate system prompt for the AI based on language
 */
export const generateSystemPrompt = (language: string): string => {
  if (language && language !== 'en') {
    return `You are an advanced, helpful, multilingual AI assistant with extensive capabilities including solving complex math problems, writing code, and explaining concepts in detail. You have knowledge of various programming languages and can help with debugging and optimization. The user is communicating in ${language}. Respond in the same language that the user is using. 

For math problems:
1. Break down complex problems into steps
2. Show your work clearly
3. Explain your reasoning
4. Double-check calculations

For coding:
1. Use proper syntax highlighting in code blocks with the appropriate language tag
2. Add comments to explain complex logic
3. Suggest improvements where applicable
4. Consider edge cases and error handling

Always aim to be comprehensive yet concise in your responses. When relevant, include examples to illustrate your points. If you're uncertain about anything, express your uncertainty rather than providing potentially incorrect information.`;
  }
  
  return `You are an advanced, helpful, multilingual AI assistant with extensive capabilities including solving complex math problems, writing code, and explaining concepts in detail. You have knowledge of various programming languages and can help with debugging and optimization. Identify the language the user is communicating in and respond in the same language.

For math problems:
1. Break down complex problems into steps
2. Show your work clearly
3. Explain your reasoning
4. Double-check calculations

For coding:
1. Use proper syntax highlighting in code blocks with the appropriate language tag
2. Add comments to explain complex logic
3. Suggest improvements where applicable
4. Consider edge cases and error handling

Always aim to be comprehensive yet concise in your responses. When relevant, include examples to illustrate your points. If you're uncertain about anything, express your uncertainty rather than providing potentially incorrect information.`;
};

/**
 * Generate system prompt specifically for coding tasks
 */
export const generateCodingSystemPrompt = (language: string, programmingLanguage?: string): string => {
  const languageSpecific = language && language !== 'en' 
    ? `The user is communicating in ${language}. Respond in the same language.` 
    : 'Identify the language the user is communicating in and respond in the same language.';
  
  const programmingSpecific = programmingLanguage 
    ? `The user is looking for help with ${programmingLanguage} programming.`
    : '';
  
  return `You are an expert software developer AI assistant specialized in helping with coding and programming tasks. ${languageSpecific} ${programmingSpecific}

When writing code:
1. Always use proper syntax highlighting with appropriate language tags in code blocks
2. Include detailed comments explaining complex logic
3. Follow best practices and design patterns appropriate for the language
4. Consider edge cases, error handling, and security implications
5. Break down complex solutions into digestible parts
6. Suggest optimizations where applicable

For debugging:
1. Analyze the error messages carefully
2. Suggest specific fixes with explanations
3. Consider alternative approaches when appropriate

Your responses should be comprehensive, accurate, and focused on providing working solutions with educational explanations.`;
};

/**
 * Generate system prompt for math problems
 */
export const generateMathSystemPrompt = (language: string): string => {
  const languageSpecific = language && language !== 'en' 
    ? `The user is communicating in ${language}. Respond in the same language.` 
    : 'Identify the language the user is communicating in and respond in the same language.';
  
  return `You are an expert mathematics AI assistant. ${languageSpecific}

When solving math problems:
1. Break down complex problems into clear, logical steps
2. Show your complete work and calculations
3. Explain your reasoning and methodology
4. Use LaTeX notation for mathematical expressions when appropriate (format: $equation$)
5. Double-check your calculations for accuracy
6. Provide alternative solution methods when applicable
7. Highlight key insights or patterns in the problem

Your goal is to not only provide the correct answer but also help the user understand the mathematical concepts involved. Be precise, methodical, and educational in your approach.`;
};

/**
 * Generate system prompt for image generation requests
 */
export const generateImageSystemPrompt = (language: string): string => {
  const languageSpecific = language && language !== 'en' 
    ? `The user is communicating in ${language}. Respond in the same language.` 
    : 'Identify the language the user is communicating in and respond in the same language.';
  
  return `You are an AI assistant specialized in helping users create detailed image generation prompts. ${languageSpecific}

When a user requests an image:
1. Help refine their image generation request into a detailed prompt
2. Suggest adding details about style, perspective, lighting, colors, and mood
3. If appropriate, offer multiple prompt variations for different artistic styles
4. Explain your suggestions to help them learn how to craft better prompts

You'll respond with both the refined image generation prompt and an explanation of your choices. Remember that detailed, specific prompts typically yield better results than vague ones.`;
};

/**
 * Detect if a message is asking for code help
 */
export const isCodeRelatedQuery = (message: string): boolean => {
  const codeKeywords = [
    'code', 'function', 'program', 'programming', 'developer', 'development',
    'bug', 'debug', 'error', 'javascript', 'python', 'java', 'c++', 'typescript',
    'html', 'css', 'react', 'node', 'express', 'algorithm', 'api', 'database',
    'sql', 'nosql', 'mongodb', 'postgresql', 'firebase', 'aws', 'azure',
    'cloud', 'server', 'client', 'frontend', 'backend', 'fullstack', 'framework'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for code block syntax
  if (lowerMessage.includes('```') || lowerMessage.includes('`')) {
    return true;
  }
  
  // Check for keywords
  return codeKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Detect if a message is asking for math help
 */
export const isMathRelatedQuery = (message: string): boolean => {
  const mathKeywords = [
    'solve', 'calculate', 'equation', 'expression', 'formula', 'math', 'mathematics',
    'algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'probability',
    '+', '-', '*', '/', '=', '>', '<', '≥', '≤', '≠', '^', 'square root', 'sqrt',
    'derivative', 'integral', 'function', 'graph', 'plot', 'curve', 'line',
    'matrix', 'vector', 'determinant', 'eigenvalue', 'eigenvector'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for mathematical notation
  if (/[\+\-\*\/\=\>\<\^\√\∫\∑\π]/.test(message) || 
      message.includes('$') || // LaTeX delimiter
      /\d+\s*[\+\-\*\/\^]\s*\d+/.test(message)) { // Simple arithmetic pattern
    return true;
  }
  
  // Check for keywords
  return mathKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Detect if a message is asking for image generation
 */
export const isImageGenerationQuery = (message: string): boolean => {
  const imageKeywords = [
    'generate image', 'create image', 'draw', 'picture', 'photo', 'image', 
    'illustration', 'artwork', 'design', 'generate a picture', 'create a picture', 
    'make an image', 'visualize', 'render', 'dall-e', 'midjourney', 'stable diffusion'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords
  return imageKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Get the appropriate system prompt based on message content
 */
export const getContextualSystemPrompt = (message: string, language: string): string => {
  if (isCodeRelatedQuery(message)) {
    return generateCodingSystemPrompt(language);
  } else if (isMathRelatedQuery(message)) {
    return generateMathSystemPrompt(language);
  } else if (isImageGenerationQuery(message)) {
    return generateImageSystemPrompt(language);
  } else {
    return generateSystemPrompt(language);
  }
};

/**
 * Formats the chat history for submission to the OpenAI API
 */
export const formatChatHistory = (messages: Array<{type: string, content: string}>, language: string = 'en') => {
  if (messages.length === 0) return [];
  
  // Get the last user message to determine the context
  const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
  
  // Add appropriate system message based on the latest user query
  if (lastUserMessage) {
    const systemPrompt = getContextualSystemPrompt(lastUserMessage.content, language);
    return [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages.map(message => ({
        role: message.type === 'user' ? 'user' : 'assistant',
        content: message.content
      }))
    ];
  }
  
  // Default system message if no user message is found
  return [
    {
      role: 'system',
      content: generateSystemPrompt(language)
    },
    ...messages.map(message => ({
      role: message.type === 'user' ? 'user' : 'assistant',
      content: message.content
    }))
  ];
};
