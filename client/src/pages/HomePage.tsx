import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supportedLanguages } from '@/lib/languageUtils';
import { MODELS } from '@/lib/openai';
import { Check, Brain, Globe, Bot, Settings, ChevronRight, Sparkles } from 'lucide-react';

const HomePage = () => {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-7-sonnet-20250219');
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic'>('openai');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Function to start chat
  const startChat = () => {
    // Store preferences
    localStorage.setItem('preferred-language', selectedLanguage);
    localStorage.setItem('preferred-model', selectedModel);
    localStorage.setItem('preferred-anthropic-model', anthropicModel);
    localStorage.setItem('preferred-ai-provider', aiProvider);

    // Navigate to chat page
    setLocation('/chat');
  };

  // Load preferences on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferred-language');
    if (storedLanguage) setSelectedLanguage(storedLanguage);
    
    const storedModel = localStorage.getItem('preferred-model');
    if (storedModel) setSelectedModel(storedModel);
    
    const storedAnthropicModel = localStorage.getItem('preferred-anthropic-model');
    if (storedAnthropicModel) setAnthropicModel(storedAnthropicModel);
    
    const storedProvider = localStorage.getItem('preferred-ai-provider');
    if (storedProvider && (storedProvider === 'openai' || storedProvider === 'anthropic')) {
      setAiProvider(storedProvider as 'openai' | 'anthropic');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl w-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            The Ultimate AI Assistant
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the power of advanced AI with support for multiple languages and models. Your ultimate multilingual companion.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Model Selection Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">Choose Your AI</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="font-medium text-sm">AI Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={aiProvider === 'openai' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('openai')}
                      className="justify-start"
                    >
                      <Check className={`w-4 h-4 mr-2 ${aiProvider === 'openai' ? 'opacity-100' : 'opacity-0'}`} />
                      OpenAI
                    </Button>
                    <Button 
                      variant={aiProvider === 'anthropic' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('anthropic')}
                      className="justify-start"
                    >
                      <Check className={`w-4 h-4 mr-2 ${aiProvider === 'anthropic' ? 'opacity-100' : 'opacity-0'}`} />
                      Anthropic
                    </Button>
                  </div>
                </div>

                {aiProvider === 'openai' && (
                  <div className="flex flex-col space-y-2">
                    <label className="font-medium text-sm">OpenAI Model</label>
                    <div className="grid grid-cols-1 gap-2">
                      {MODELS.map(model => (
                        <Button 
                          key={model.id}
                          variant={selectedModel === model.id ? 'default' : 'outline'}
                          onClick={() => setSelectedModel(model.id)}
                          className="justify-start"
                        >
                          <Check className={`w-4 h-4 mr-2 ${selectedModel === model.id ? 'opacity-100' : 'opacity-0'}`} />
                          {model.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {aiProvider === 'anthropic' && (
                  <div className="flex flex-col space-y-2">
                    <label className="font-medium text-sm">Anthropic Model</label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant={anthropicModel === 'claude-3-7-sonnet-20250219' ? 'default' : 'outline'}
                        onClick={() => setAnthropicModel('claude-3-7-sonnet-20250219')}
                        className="justify-start"
                      >
                        <Check className={`w-4 h-4 mr-2 ${anthropicModel === 'claude-3-7-sonnet-20250219' ? 'opacity-100' : 'opacity-0'}`} />
                        Claude 3.7 Sonnet
                      </Button>
                      <Button 
                        variant={anthropicModel === 'claude-3-opus-20240229' ? 'default' : 'outline'}
                        onClick={() => setAnthropicModel('claude-3-opus-20240229')}
                        className="justify-start"
                      >
                        <Check className={`w-4 h-4 mr-2 ${anthropicModel === 'claude-3-opus-20240229' ? 'opacity-100' : 'opacity-0'}`} />
                        Claude 3 Opus
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Language Selection Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Globe className="w-6 h-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Choose Your Language</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Our AI understands and responds in multiple languages. Select your preferred language:
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-2">
                  {supportedLanguages.map(language => (
                    <Button 
                      key={language.code}
                      variant={selectedLanguage === language.code ? 'default' : 'outline'}
                      onClick={() => setSelectedLanguage(language.code)}
                      className="justify-start"
                    >
                      <Check className={`w-4 h-4 mr-2 ${selectedLanguage === language.code ? 'opacity-100' : 'opacity-0'}`} />
                      <span className="mr-2">{language.flag}</span>
                      {language.name}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
                <h2 className="text-xl font-semibold">Key Features</h2>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced multilingual capabilities</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Multiple AI models from OpenAI and Anthropic</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Intelligent context awareness</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Customizable chat experience</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Conversation history and export</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Dark and light theme support</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Start Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <Button 
            onClick={startChat} 
            size="lg" 
            className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Start Chatting Now
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;