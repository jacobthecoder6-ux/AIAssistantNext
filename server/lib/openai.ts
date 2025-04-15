import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_VISION_MODEL = "gpt-4o-vision-preview"; // for image analysis
const DEFAULT_IMAGE_MODEL = "dall-e-3"; // for image generation

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
      ? `You are an advanced, helpful, multilingual AI assistant with extensive capabilities including solving complex math problems, writing code, and explaining concepts in detail. You have knowledge of various programming languages and can help with debugging and optimization. The user is communicating in ${language}. Respond in the same language that the user is using.

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

Always aim to be comprehensive yet concise in your responses. When relevant, include examples to illustrate your points.`
      : `You are an advanced, helpful, multilingual AI assistant with extensive capabilities including solving complex math problems, writing code, and explaining concepts in detail. You have knowledge of various programming languages and can help with debugging and optimization. Identify the language the user is communicating in and respond in the same language.

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

Always aim to be comprehensive yet concise in your responses. When relevant, include examples to illustrate your points.`;
    
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
      max_tokens: 1500,
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

/**
 * Generate an image using DALL-E
 */
export const generateImage = async (
  prompt: string,
  apiKey: string,
  size: string = "1024x1024"
): Promise<string> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    // Enhanced prompt engineering for better results
    const enhancedPrompt = `High quality, detailed image of: ${prompt}. Professional, photorealistic style with vibrant colors and natural lighting.`;
    
    const response = await openai.images.generate({
      model: DEFAULT_IMAGE_MODEL,
      prompt: enhancedPrompt,
      n: 1,
      size: size as any,
      quality: "standard",
      style: "vivid",
    });
    
    return response.data[0].url || '';
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    // Return error message
    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your API key in settings.");
    } else if (error.response?.status === 429) {
      throw new Error("You've reached your API rate limit. Please try again later.");
    } else {
      throw new Error("Unable to generate image. Please try again later.");
    }
  }
};

/**
 * Generate code assistance
 */
export const generateCodeAssistance = async (
  code: string,
  language: string,
  task: string,
  apiKey: string
): Promise<string> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    // Determine what type of code assistance is needed
    const taskLower = task.toLowerCase();
    let systemPrompt = "";
    
    if (taskLower.includes("debug") || taskLower.includes("fix") || taskLower.includes("error")) {
      systemPrompt = `You are an expert software developer specialized in ${language} programming. 
Your task is to debug the provided code. Analyze the code for errors, identify the issues, and provide a fixed version.
Format your response in these sections:
1. ANALYSIS - Briefly explain what the code is supposed to do and identify the issues
2. FIXED CODE - Provide the complete fixed code with proper syntax highlighting
3. EXPLANATION - Explain what was wrong and how your fixes address the issues`;
    } else if (taskLower.includes("optimize") || taskLower.includes("improve") || taskLower.includes("performance")) {
      systemPrompt = `You are an expert software developer specialized in ${language} programming. 
Your task is to optimize the provided code for better performance and readability.
Format your response in these sections:
1. ANALYSIS - Briefly explain what the code does and identify optimization opportunities
2. OPTIMIZED CODE - Provide the complete optimized code with proper syntax highlighting
3. IMPROVEMENTS - Explain specific optimizations and why they improve the code`;
    } else if (taskLower.includes("explain") || taskLower.includes("understand")) {
      systemPrompt = `You are an expert software developer specialized in ${language} programming.
Your task is to explain the provided code in detail.
Format your response in these sections:
1. OVERVIEW - High-level explanation of what the code does
2. LINE-BY-LINE - Detailed explanation of important sections
3. SUGGESTIONS - Any best practices or improvements that could be made`;
    } else if (taskLower.includes("test") || taskLower.includes("unit test")) {
      systemPrompt = `You are an expert software developer specialized in ${language} programming.
Your task is to create unit tests for the provided code.
Format your response in these sections:
1. ANALYSIS - Briefly explain what the code does and what should be tested
2. TEST CODE - Provide complete test code with proper syntax highlighting
3. TEST CASES - Explain what each test case is verifying`;
    } else {
      // Default case for general code enhancement
      systemPrompt = `You are an expert software developer specialized in ${language} programming.
Your task is to improve the provided code in terms of readability, maintainability, and adherence to best practices.
Format your response in these sections:
1. ANALYSIS - Briefly explain what the code does
2. IMPROVED CODE - Provide the complete improved code with proper syntax highlighting
3. ENHANCEMENTS - Explain your changes and why they improve the code`;
    }
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is my ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTask: ${task}` }
    ];
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messages as any,
      temperature: 0.5,
      max_tokens: 2000,
    });
    
    return response.choices[0].message.content || "Failed to generate code assistance.";
  } catch (error: any) {
    console.error("Error generating code assistance:", error);
    
    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your API key in settings.");
    } else if (error.response?.status === 429) {
      throw new Error("You've reached your API rate limit. Please try again later.");
    } else {
      throw new Error("Unable to provide code assistance. Please try again later.");
    }
  }
};

/**
 * Solve a math problem
 */
export const solveMathProblem = async (
  problem: string,
  apiKey: string,
  showSteps: boolean = true
): Promise<string> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    const systemPrompt = showSteps 
      ? `You are an expert mathematics AI assistant. Your task is to solve the given math problem with detailed steps.
Format your response in these sections:
1. PROBLEM STATEMENT - Restate the problem in mathematical terms
2. APPROACH - Explain the mathematical approach or formula you'll use
3. STEP-BY-STEP SOLUTION - Show all work with clear explanations of each step
4. FINAL ANSWER - Clearly state the final answer
5. VERIFICATION - Verify the answer by checking or using an alternative method

Use LaTeX notation for mathematical expressions when appropriate (format: $equation$).`
      : `You are an expert mathematics AI assistant. Your task is to solve the given math problem concisely.
Format your response with:
1. PROBLEM STATEMENT - Restate the problem in mathematical terms
2. FINAL ANSWER - Clearly state the final answer with minimal explanation`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: problem }
    ];
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messages as any,
      temperature: 0.3,
      max_tokens: 1500,
    });
    
    return response.choices[0].message.content || "Failed to solve the math problem.";
  } catch (error: any) {
    console.error("Error solving math problem:", error);
    
    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your API key in settings.");
    } else if (error.response?.status === 429) {
      throw new Error("You've reached your API rate limit. Please try again later.");
    } else {
      throw new Error("Unable to solve the math problem. Please try again later.");
    }
  }
};
