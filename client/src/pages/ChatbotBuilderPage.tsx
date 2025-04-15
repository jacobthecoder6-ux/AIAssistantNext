import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type ChatbotType = 'therapist' | 'financial-advisor' | 'language-tutor' | 'fitness-coach' | 'career-counselor' | 'custom';

interface ChatbotTemplate {
  type: ChatbotType;
  name: string;
  description: string;
  systemPrompt: string;
  welcomeMessage: string;
  exampleQuestions: string[];
}

const CHATBOT_TEMPLATES: Record<ChatbotType, ChatbotTemplate> = {
  'therapist': {
    type: 'therapist',
    name: 'Therapy Assistant',
    description: 'A supportive therapy assistant that provides empathetic listening and helpful feedback.',
    systemPrompt: `You are a supportive therapy assistant. Your role is to provide empathetic responses, helpful feedback, and guide users through emotional challenges. 
    You should:
    - Practice active listening through your responses
    - Show empathy and understanding
    - Help users explore their feelings and thoughts
    - Suggest constructive ways to manage challenges
    - Avoid giving medical advice or diagnosing conditions
    - Remind users that you're not a replacement for professional therapy when appropriate`,
    welcomeMessage: "Hello, I'm here to provide a supportive space for you to talk about whatever is on your mind. How are you feeling today?",
    exampleQuestions: [
      "I've been feeling anxious lately, how can I manage this?",
      "How can I improve my relationship with family members?",
      "I'm having trouble sleeping due to stress",
      "How can I build better boundaries with people?",
      "I'm struggling with negative thoughts about myself"
    ]
  },
  'financial-advisor': {
    type: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'A knowledgeable financial assistant that helps with budgeting, investments, and financial planning.',
    systemPrompt: `You are a helpful financial advisor assistant. Your role is to provide general financial guidance and information.
    You should:
    - Help with basic budgeting and financial planning concepts
    - Explain financial terms and products in simple language
    - Discuss general investment strategies and concepts
    - Provide educational information about personal finance
    - Avoid giving specific investment recommendations
    - Remind users that you're not a replacement for professional financial advice`,
    welcomeMessage: "Hello! I'm here to help you with general financial questions and guidance. What would you like to know about managing your finances?",
    exampleQuestions: [
      "How can I create a monthly budget?",
      "What's the difference between a Roth IRA and Traditional IRA?",
      "How should I prioritize paying down debt?",
      "What are some ways to start investing with little money?",
      "How can I improve my credit score?"
    ]
  },
  'language-tutor': {
    type: 'language-tutor',
    name: 'Language Tutor',
    description: 'A patient language tutor that helps with learning new languages, grammar, and conversation practice.',
    systemPrompt: `You are a helpful language tutor. Your role is to assist users in learning languages through instruction, correction, and conversation practice.
    You should:
    - Help with vocabulary, grammar, and pronunciation
    - Correct language errors gently but accurately
    - Engage in conversation practice at the user's level
    - Explain language concepts clearly with examples
    - Provide cultural context when relevant
    - Adjust difficulty based on the user's proficiency level`,
    welcomeMessage: "¡Hola! Hello! Bonjour! I'm your language tutor assistant. What language would you like to practice today?",
    exampleQuestions: [
      "Can you help me practice basic Spanish conversation?",
      "What's the difference between 'por' and 'para' in Spanish?",
      "How do I form past tense in French?",
      "Can you check if this sentence is grammatically correct?",
      "What are some common phrases for traveling in Italy?"
    ]
  },
  'fitness-coach': {
    type: 'fitness-coach',
    name: 'Fitness Coach',
    description: 'A motivational fitness coach that provides exercise guidance, nutrition tips, and wellness advice.',
    systemPrompt: `You are a supportive fitness coach assistant. Your role is to help users with general fitness questions, exercise guidance, and healthy habit formation.
    You should:
    - Provide general information about exercise and nutrition
    - Suggest workout ideas and techniques
    - Motivate users to pursue their fitness goals
    - Discuss general wellness and healthy lifestyle habits
    - Avoid giving medical advice or very specific exercise prescriptions
    - Remind users to consult healthcare providers before starting new fitness regimens`,
    welcomeMessage: "Hi there! I'm your fitness coach assistant. I'm here to help you reach your health and fitness goals. What would you like to work on today?",
    exampleQuestions: [
      "What are some good exercises for beginners?",
      "How can I stay motivated to exercise regularly?",
      "What should I eat before and after workouts?",
      "How can I build a simple home workout routine?",
      "What's a good way to improve flexibility?"
    ]
  },
  'career-counselor': {
    type: 'career-counselor',
    name: 'Career Counselor',
    description: 'A helpful career assistant that provides guidance on job searching, resume building, and professional development.',
    systemPrompt: `You are a supportive career counselor assistant. Your role is to help users with career development, job searching, and professional skills.
    You should:
    - Provide guidance on resume and cover letter writing
    - Suggest interview preparation strategies
    - Help users explore potential career paths
    - Offer advice on professional development
    - Discuss workplace challenges and communication
    - Provide general job search strategies and resources`,
    welcomeMessage: "Hello! I'm your career counselor assistant. I'm here to help with your professional development and career questions. What would you like guidance on today?",
    exampleQuestions: [
      "How can I improve my resume?",
      "What should I prepare for a job interview?",
      "I'm thinking of changing careers, how should I start?",
      "How can I ask for a raise or promotion?",
      "What skills are most in-demand in today's job market?"
    ]
  },
  'custom': {
    type: 'custom',
    name: 'Custom Chatbot',
    description: 'Create your own custom chatbot with personalized behavior and knowledge.',
    systemPrompt: '',
    welcomeMessage: '',
    exampleQuestions: []
  }
};

const ChatbotBuilderPage = () => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ChatbotType>('therapist');
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [customWelcomeMessage, setCustomWelcomeMessage] = useState('');
  const [customExampleQuestions, setCustomExampleQuestions] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdChatbotId, setCreatedChatbotId] = useState<string | null>(null);

  const handleTypeChange = (type: ChatbotType) => {
    setSelectedType(type);
    
    if (type === 'custom') {
      setCustomName('');
      setCustomDescription('');
      setCustomSystemPrompt('');
      setCustomWelcomeMessage('');
      setCustomExampleQuestions('');
    }
  };

  const handleCreateChatbot = async () => {
    setIsCreating(true);
    
    try {
      let chatbotTemplate = CHATBOT_TEMPLATES[selectedType];
      
      // If custom, use the custom values
      if (selectedType === 'custom') {
        chatbotTemplate = {
          type: 'custom',
          name: customName || 'Custom Chatbot',
          description: customDescription || 'Custom chatbot with personalized responses',
          systemPrompt: customSystemPrompt || 'You are a helpful AI assistant.',
          welcomeMessage: customWelcomeMessage || 'Hello! How can I help you today?',
          exampleQuestions: customExampleQuestions.split('\n').filter(q => q.trim() !== '')
        };
      }
      
      // Create a new chatbot
      const response = await apiRequest<{ id: string, name: string }>('/api/chatbots', {
        method: 'POST',
        body: JSON.stringify(chatbotTemplate)
      });
      
      if (response && response.id) {
        setCreatedChatbotId(response.id);
        toast({
          title: "Success!",
          description: `Your ${chatbotTemplate.name} chatbot has been created!`,
        });
      }
    } catch (error) {
      console.error("Error creating chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to create chatbot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartChatting = () => {
    if (createdChatbotId) {
      window.location.href = `/chatbot/${createdChatbotId}`;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create Your Specialized Chatbot</h1>
      
      {!createdChatbotId ? (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Choose a Chatbot Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(CHATBOT_TEMPLATES).map(([type, template]) => (
                <div 
                  key={type}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'}`}
                  onClick={() => handleTypeChange(type as ChatbotType)}
                >
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {selectedType === 'custom' && (
            <div className="mb-8 space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold">Customize Your Chatbot</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Chatbot Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Study Buddy, Cooking Assistant"
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Brief description of what your chatbot does"
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">System Prompt (Instructions for the AI)</label>
                <textarea
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder="Instructions that define how your chatbot should behave..."
                  rows={5}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Welcome Message</label>
                <textarea
                  value={customWelcomeMessage}
                  onChange={(e) => setCustomWelcomeMessage(e.target.value)}
                  placeholder="The first message your chatbot will say to users"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Example Questions (One per line)</label>
                <textarea
                  value={customExampleQuestions}
                  onChange={(e) => setCustomExampleQuestions(e.target.value)}
                  placeholder="List questions users might ask your chatbot (one per line)"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          )}
          
          {selectedType !== 'custom' && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">{CHATBOT_TEMPLATES[selectedType].name} Details</h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-lg">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{CHATBOT_TEMPLATES[selectedType].description}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-lg">Welcome Message</h3>
                <p className="text-gray-600 dark:text-gray-300 italic">"{CHATBOT_TEMPLATES[selectedType].welcomeMessage}"</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Example Questions</h3>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
                  {CHATBOT_TEMPLATES[selectedType].exampleQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={handleCreateChatbot}
              disabled={isCreating || (selectedType === 'custom' && !customSystemPrompt)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Chatbot'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your Chatbot is Ready!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Your specialized chatbot has been created and is ready to use.</p>
          <button
            onClick={handleStartChatting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Chatting
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatbotBuilderPage;