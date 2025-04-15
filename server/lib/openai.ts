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
    
    // Advanced prompt engineering for superior image generation
    let enhancedPrompt = prompt;
    
    // Check if the prompt already has detailed instructions
    // If not, enhance it with better descriptors
    if (!prompt.toLowerCase().includes("style:") && 
        !prompt.toLowerCase().includes("quality:") &&
        !prompt.toLowerCase().includes("resolution:")) {
      
      // Determine style based on prompt content
      let style = "vivid"; // Default style
      let quality = "hd"; // Default to high quality
      
      // Check prompt for style hints
      if (prompt.toLowerCase().includes("photo") || 
          prompt.toLowerCase().includes("realistic") ||
          prompt.toLowerCase().includes("photograph")) {
        style = "natural";
        enhancedPrompt = `Ultra-detailed, professional photograph of ${prompt}. Masterfully composed with perfect lighting, shot on a high-end DSLR camera with shallow depth of field where appropriate. 8K resolution with impeccable details.`;
      } 
      else if (prompt.toLowerCase().includes("painting") || 
               prompt.toLowerCase().includes("artistic") || 
               prompt.toLowerCase().includes("art")) {
        style = "vivid";
        enhancedPrompt = `Breathtaking artistic rendering of ${prompt}. Rich in detail and expression, with dynamic composition and expert use of color theory. Museum-quality artwork with visible brushstrokes and texture.`;
      } 
      else if (prompt.toLowerCase().includes("3d") || 
               prompt.toLowerCase().includes("render") || 
               prompt.toLowerCase().includes("cgi")) {
        style = "vivid";
        enhancedPrompt = `Hyper-realistic 3D rendering of ${prompt}. Created with cutting-edge CGI technology, featuring perfect lighting, physically accurate materials, and photorealistic textures. Ray-traced with global illumination and ambient occlusion.`;
      } 
      else if (prompt.toLowerCase().includes("cartoon") || 
               prompt.toLowerCase().includes("animation") || 
               prompt.toLowerCase().includes("animated")) {
        style = "vivid";
        enhancedPrompt = `Professional animation-style illustration of ${prompt}. Vibrant colors with clean lines, expressive characters, and detailed background elements. Studio-quality design with modern animation aesthetics.`;
      } 
      else {
        // General enhancement for other types of prompts
        enhancedPrompt = `Stunning, detailed visualization of ${prompt}. Professional quality with perfect composition, dramatic lighting, and rich details. Created with state-of-the-art techniques for maximum visual impact.`;
      }
    }
    
    console.log(`Generating image with prompt: ${enhancedPrompt}`);
    
    const response = await openai.images.generate({
      model: DEFAULT_IMAGE_MODEL,
      prompt: enhancedPrompt,
      n: 1,
      size: size as any,
      quality: "hd",  // Always use HD quality for better results
      style: "vivid", // Default style, but our prompt engineering handles specific styles better
    });
    
    return response.data[0].url || '';
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    // Return error message
    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your API key in settings.");
    } else if (error.response?.status === 429) {
      throw new Error("You've reached your API rate limit. Please try again later.");
    } else if (error.message?.includes("content_policy_violation")) {
      throw new Error("Your image prompt violates content policy. Please modify your request to comply with OpenAI's content policy.");
    } else {
      throw new Error("Unable to generate image. Please try again with a different description or check your API key.");
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
    
    // Check if this is a code generation request
    const isGenerationRequest = 
      code.includes("Generate") || 
      task.toLowerCase().includes("generate") || 
      task.toLowerCase().includes("create") || 
      task.toLowerCase().includes("build") ||
      task.toLowerCase().includes("implement") ||
      task.toLowerCase().includes("develop");
    
    // Determine what type of code assistance is needed
    const taskLower = task.toLowerCase();
    let systemPrompt = "";
    
    if (isGenerationRequest) {
      // Enhanced prompt for complex code generation
      systemPrompt = `You are an elite software architect and developer with deep expertise in ${language} programming and software engineering. 
Your task is to generate high-quality, production-ready code based on the user's requirements.

You excel at creating complex software solutions that:
1. Are well-structured with proper design patterns
2. Handle error cases thoroughly
3. Include proper logging, validation, and security best practices
4. Are optimized for performance and maintainability
5. Follow language-specific best practices and conventions

Format your response in these sections:
1. ARCHITECTURE - Describe the overall structure and approach
2. COMPLETE CODE - Provide all necessary files and code with proper syntax highlighting, including imports and dependencies
3. TESTING APPROACH - Suggest how to test this implementation
4. USAGE EXAMPLES - Show how to use the code
5. POTENTIAL EXTENSIONS - Briefly suggest ways to extend or enhance this implementation

Your code should be comprehensive, fully-functional, and handle edge cases.`;
      
      // Increase tokens for complex generation
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `I need you to generate ${language} code for the following task:\n\n${task}\n\nAdditional context or requirements:\n${code}` }
        ] as any,
        temperature: 0.4,
        max_tokens: 4000, // Increased for complex code generation
      });
      
      return response.choices[0].message.content || "Failed to generate code.";
      
    } else if (taskLower.includes("debug") || taskLower.includes("fix") || taskLower.includes("error")) {
      systemPrompt = `You are an elite software developer and debugger specialized in ${language} programming. 
Your task is to debug the provided code with the diligence of a senior developer. Analyze the code for errors, identify all issues (including subtle bugs and edge cases), and provide a fully fixed version.

Format your response in these sections:
1. ANALYSIS - Explain what the code is supposed to do and comprehensively identify all issues
2. ROOT CAUSES - Identify the underlying causes of the issues, not just symptoms
3. FIXED CODE - Provide the complete fixed code with proper syntax highlighting
4. EXPLANATION - Explain what was wrong and how your fixes address each issue
5. PREVENTION - Suggest how to prevent similar issues in the future`;
    } else if (taskLower.includes("optimize") || taskLower.includes("improve") || taskLower.includes("performance")) {
      systemPrompt = `You are an elite software performance engineer specialized in ${language} programming. 
Your task is to optimize the provided code for maximum efficiency and readability.

Format your response in these sections:
1. PERFORMANCE ANALYSIS - Identify all performance bottlenecks and inefficiencies
2. OPTIMIZATION STRATEGY - Explain your approach to optimization
3. OPTIMIZED CODE - Provide the complete optimized code with proper syntax highlighting
4. BENCHMARKS - Discuss expected performance improvements
5. TRADE-OFFS - Explain any trade-offs made between performance, readability, and maintainability`;
    } else if (taskLower.includes("explain") || taskLower.includes("understand")) {
      systemPrompt = `You are an elite software educator specialized in ${language} programming.
Your task is to explain the provided code with exceptional clarity and depth.

Format your response in these sections:
1. EXECUTIVE SUMMARY - Explain what the code accomplishes in simple terms
2. ARCHITECTURE - Explain the overall structure and design patterns used
3. DETAILED WALKTHROUGH - Provide a comprehensive line-by-line or section-by-section explanation
4. ADVANCED CONCEPTS - Explain any complex algorithms, patterns, or language features used
5. BEST PRACTICES - Evaluate adherence to best practices and suggest improvements`;
    } else if (taskLower.includes("test") || taskLower.includes("unit test")) {
      systemPrompt = `You are an elite software test engineer specialized in ${language} programming.
Your task is to create comprehensive test coverage for the provided code.

Format your response in these sections:
1. TEST STRATEGY - Outline the overall testing approach
2. TEST CASES - Identify all scenarios that should be tested, including edge cases
3. COMPLETE TEST CODE - Provide thorough test code with proper syntax highlighting
4. MOCKING STRATEGY - Explain how to mock dependencies
5. COVERAGE ANALYSIS - Discuss expected test coverage and any areas difficult to test`;
    } else {
      // Default case for general code enhancement
      systemPrompt = `You are an elite software architect specialized in ${language} programming.
Your task is to analyze and enhance the provided code to professional standards.

Format your response in these sections:
1. CODE REVIEW - Thoroughly assess code quality, architecture, and potential issues
2. IMPROVED CODE - Provide the complete improved code with proper syntax highlighting
3. ENHANCEMENTS - Explain all modifications and how they improve the code
4. ARCHITECTURAL SUGGESTIONS - Propose any structural improvements
5. NEXT STEPS - Suggest future improvements beyond the current enhancements`;
    }
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is my ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTask: ${task}` }
    ];
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messages as any,
      temperature: 0.4,
      max_tokens: 3000, // Increased token limit for more comprehensive responses
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
