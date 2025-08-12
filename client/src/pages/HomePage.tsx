import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supportedLanguages } from '@/lib/languageUtils';
import { MODELS } from '@/lib/openai';
import { Check, Brain, Globe, Bot, Settings, ChevronRight, Sparkles, Key, Menu, Moon, Sun, InfoIcon, Github, Laptop } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const HomePage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-7-sonnet-20250219');
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic'>('openai');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('auth-password');
    const savedEmail = localStorage.getItem('auth-email');
    const isUnlockedStored = localStorage.getItem('is-unlocked');
    const isPremium = localStorage.getItem('premium-account');
    
    if (savedPassword && savedEmail && isUnlockedStored === 'true' && isPremium === 'true') {
      setIsSignedIn(true);
      setPassword(savedPassword);
      setEmail(savedEmail);
      setIsUnlocked(true);
    }
  }, []);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showApiKeyInputs, setShowApiKeyInputs] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

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

  // Function to validate and start chat
  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      toast({
        title: "Configuration Error",
        description: "Google OAuth client ID is not configured. Please contact the administrator.",
        variant: "destructive"
      });
    }
  }, []);

  const startChat = () => {
    // Check if user has premium account
    const isPremium = localStorage.getItem('premium-account') === 'true';
    
    if (isPremium) {
      // Premium users get automatic access - no API key needed
      localStorage.setItem('preferred-language', selectedLanguage);
      localStorage.setItem('preferred-model', selectedModel);
      localStorage.setItem('preferred-anthropic-model', anthropicModel);
      localStorage.setItem('preferred-ai-provider', aiProvider);
      setLocation('/chat');
      return;
    }

    // Non-premium users need API keys
    const hasRequiredKey = (aiProvider === 'openai' && openaiApiKey) || 
                          (aiProvider === 'anthropic' && anthropicApiKey);

    if (!hasRequiredKey) {
      setShowApiKeyInputs(true);
      return;
    }

    // Validate 7-character word format for API keys
    const currentKey = aiProvider === 'openai' ? openaiApiKey : anthropicApiKey;
    if (!/^[a-zA-Z0-9]{7}$/.test(currentKey)) {
      toast({
        title: "Invalid API Key Format",
        description: "API key must be exactly 7 alphanumeric characters",
        variant: "destructive"
      });
      return;
    }

    // Store preferences and API keys
    localStorage.setItem('preferred-language', selectedLanguage);
    localStorage.setItem('preferred-model', selectedModel);
    localStorage.setItem('preferred-anthropic-model', anthropicModel);
    localStorage.setItem('preferred-ai-provider', aiProvider);

    if (openaiApiKey) {
      localStorage.setItem('api-key', openaiApiKey);
    }

    if (anthropicApiKey) {
      localStorage.setItem('anthropic-api-key', anthropicApiKey);
    }

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

    const storedOpenAIKey = localStorage.getItem('api-key');
    if (storedOpenAIKey) setOpenaiApiKey(storedOpenAIKey);

    const storedAnthropicKey = localStorage.getItem('anthropic-api-key');
    if (storedAnthropicKey) setAnthropicApiKey(storedAnthropicKey);
  }, []);

  // Theme toggling
  const setAppTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('preferred-theme', newTheme);

    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('preferred-theme') as 'light' | 'dark' | 'system' | null;
    if (storedTheme) {
      setAppTheme(storedTheme);
    }
  }, []);

  // Sign out functionality
  const handleSignOut = () => {
    localStorage.removeItem('auth-password');
    localStorage.removeItem('auth-email');
    localStorage.removeItem('is-unlocked');
    localStorage.removeItem('premium-account');
    setIsSignedIn(false);
    setIsUnlocked(false);
    setPassword('');
    setEmail('');
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center">
              <Brain className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-bold text-xl">UnlockedAI v1</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* User Profile Dropdown - Only for Premium Users */}
              {isSignedIn && localStorage.getItem('premium-account') === 'true' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full mr-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {email ? email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Premium Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2 space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-6 px-2 text-xs"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {showPassword ? password : '•'.repeat(password.length)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Password Dialog */}
              {!isSignedIn && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mr-2">
                      <Key className="h-4 w-4 mr-2" />
                      {isUnlocked ? 'Unlocked' : 'Unlock Features'}
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Premium Account</DialogTitle>
                    <DialogDescription>
                      Enter your email and create a 7-letter password to unlock premium features and get automatic access to the AI Chatbot.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create 7-letter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={7}
                        title="Must be exactly 7 letters (uppercase and lowercase allowed)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="submit" onClick={async () => {
                        // Validate email
                        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                          toast({
                            title: "Invalid Email Format", 
                            description: "Please enter a valid email address",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Validate 7-character password format with only letters (uppercase and lowercase allowed)
                        if (!/^[a-zA-Z]{7}$/.test(password)) {
                          toast({
                            title: "Invalid Password Format", 
                            description: "Password must be exactly 7 letters (uppercase and lowercase allowed)",
                            variant: "destructive",
                          });
                          return;
                        }

                        try {
                          const response = await fetch('/api/create-premium-account', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password }),
                          });

                          if (response.ok) {
                            setIsUnlocked(true);
                            setIsSignedIn(true);
                            localStorage.setItem('is-unlocked', 'true');
                            localStorage.setItem('auth-email', email);
                            localStorage.setItem('auth-password', password);
                            localStorage.setItem('premium-account', 'true');
                            toast({
                              title: "Premium Account Created",
                              description: "Welcome! Redirecting to AI Chatbot..."
                            });
                            // Auto-navigate to chat after a short delay
                            setTimeout(() => {
                              setLocation('/chat');
                            }, 1500);
                          } else {
                            const data = await response.json();
                            toast({
                              title: "Error",
                              description: data.error || "Failed to create premium account",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to create premium account",
                            variant: "destructive",
                          });
                        }
                      }}>Create Premium Account</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              )}

              {/* Show unlock button for signed in users who aren't premium yet */}
              {isSignedIn && localStorage.getItem('premium-account') !== 'true' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mr-2">
                      <Key className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Upgrade to Premium</DialogTitle>
                      <DialogDescription>
                        Create a premium account to get unlimited access to AI features without requiring API keys.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="upgrade-email">Email Address</Label>
                        <Input
                          id="upgrade-email"
                          type="email"
                          placeholder="Enter your email..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="upgrade-password">Password</Label>
                        <Input
                          id="upgrade-password"
                          type="password"
                          placeholder="Create 7-letter password..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          maxLength={7}
                          title="Must be exactly 7 letters (uppercase and lowercase allowed)"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit" onClick={async () => {
                          // Validate email
                          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            toast({
                              title: "Invalid Email Format", 
                              description: "Please enter a valid email address",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Validate 7-character password format with only letters (uppercase and lowercase allowed)
                          if (!/^[a-zA-Z]{7}$/.test(password)) {
                            toast({
                              title: "Invalid Password Format", 
                              description: "Password must be exactly 7 letters (uppercase and lowercase allowed)",
                              variant: "destructive",
                            });
                            return;
                          }

                          try {
                            const response = await fetch('/api/create-premium-account', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ email, password }),
                            });

                            if (response.ok) {
                              setIsUnlocked(true);
                              localStorage.setItem('is-unlocked', 'true');
                              localStorage.setItem('auth-email', email);
                              localStorage.setItem('auth-password', password);
                              localStorage.setItem('premium-account', 'true');
                              toast({
                                title: "Premium Account Created",
                                description: "Welcome! You now have premium access."
                              });
                            } else {
                              const data = await response.json();
                              toast({
                                title: "Error",
                                description: data.error || "Failed to create premium account",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to create premium account",
                              variant: "destructive",
                            });
                          }
                        }}>Upgrade to Premium</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {theme === 'light' && <Sun className="h-4 w-4" />}
                    {theme === 'dark' && <Moon className="h-4 w-4" />}
                    {theme === 'system' && <Laptop className="h-4 w-4" />}
                    <span className="ml-2 hidden md:inline">Theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAppTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAppTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAppTheme('system')}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl w-full"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
              The Ultimate AI Assistant
            </h1>
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-100 max-w-2xl mx-auto font-medium">
              Experience the power of advanced AI with support for multiple languages and models. Your ultimate multilingual companion.
            </p>
          </motion.div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Model Selection Card */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow border-2 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <Brain className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold dark:text-white">Choose Your AI</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label className="font-medium text-sm dark:text-gray-200">AI Provider</label>
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
                      <label className="font-medium text-sm dark:text-gray-200">OpenAI Model</label>
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
                      <label className="font-medium text-sm dark:text-gray-200">Anthropic Model</label>
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
              <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow border-2 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <Globe className="w-6 h-6 text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold dark:text-white">Choose Your Language</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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
              <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow border-2 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
                  <h2 className="text-xl font-semibold dark:text-white">Key Features</h2>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="dark:text-gray-200">Advanced multilingual capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="dark:text-gray-200">Multiple AI models from OpenAI and Anthropic</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="dark:text-gray-200">Intelligent context awareness</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="dark:text-gray-200">Customizable chat experience</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="dark:text-gray-200">Conversation history and export</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="dark:text-gray-200">Dark and light theme support</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>

          {/* API Key Inputs Section */}
          {showApiKeyInputs && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="p-6 shadow-lg border-2 border-blue-400 dark:bg-gray-800/50 dark:border-blue-500">
                <div className="flex items-center mb-4">
                  <Key className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold dark:text-white">Enter Your API Key</h2>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To use {aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} AI, please enter your 7-character key below. This key will be stored locally in your browser.
                </p>

                <div className="space-y-4">
                  {aiProvider === 'openai' && (
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="Enter 7-character key..."
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        maxLength={7}
                        className="font-mono"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have a key? Get a 7-character key from <a href="https://jacobthecoder6-ux.github.io/ai-keys-website/KEYS%20AND%20PASSWORDS.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">AI Keys Website</a>
                      </p>
                    </div>
                  )}

                  {aiProvider === 'anthropic' && (
                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                      <Input
                        id="anthropic-key"
                        type="password"
                        placeholder="Enter 7-character key..."
                        value={anthropicApiKey}
                        onChange={(e) => setAnthropicApiKey(e.target.value)}
                        maxLength={7}
                        className="font-mono"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have a key? Get a 7-character key from <a href="https://jacobthecoder6-ux.github.io/ai-keys-website/KEYS%20AND%20PASSWORDS.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">AI Keys Website</a>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={startChat} 
                      disabled={!((aiProvider === 'openai' && openaiApiKey) || (aiProvider === 'anthropic' && anthropicApiKey))}
                      className="flex-1"
                    >
                      Start Chatting
                    </Button>
                    <Button onClick={() => setShowApiKeyInputs(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Start and Sign Up Buttons */}
          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <Button 
              onClick={startChat} 
              size="lg" 
              className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {localStorage.getItem('premium-account') === 'true' ? 'Enter Premium AI Chat' : 
               isUnlocked ? 'Enter Unlocked AI' : 'Start Chatting Now'}
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {!isSignedIn && (
              <div className="flex flex-col gap-4">
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
                <GoogleLogin
                  useOneTap
                  onSuccess={async (credentialResponse) => {
                    try {
                      const password = prompt("Please create a 7-character word password for your account:");
                      if (!password) {
                        toast({
                          title: "Error",
                          description: "7-character password is required",
                          variant: "destructive",
                        });
                        return;
                      }

                      // Validate 7-character password format with only letters
                      if (!/^[a-zA-Z]{7}$/.test(password)) {
                        toast({
                          title: "Invalid Password Format",
                          description: "Password must be exactly 7 letters only",
                          variant: "destructive",
                        });
                        return;
                      }

                      const result = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          token: credentialResponse.credential,
                          password: password 
                        }),
                      });

                      if (result.ok) {
                        toast({
                          title: "Success",
                          description: "Successfully signed in with Google!",
                        });
                        setIsSignedIn(true);
                        localStorage.setItem('auth-password', password);
                      } else {
                        const data = await result.json();
                        throw new Error(data.error || 'Failed to sign in');
                      }
                    } catch (error) {
                      console.error('Sign in error:', error);
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to sign in with Google",
                        variant: "destructive",
                      });
                    }
                  }}
                  onError={() => {
                    console.error('Google sign in error');
                    toast({
                      title: "Error",
                      description: "Failed to sign in with Google",
                      variant: "destructive",
                    });
                  }}
                />
              </GoogleOAuthProvider>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="group px-8 py-6 text-lg">
                    Sign Up with Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign Up with Email</DialogTitle>
                    <DialogDescription>
                      Create an account using your email address
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('email') as string;
                    const password = formData.get('password') as string;

                    // Validate 7-character password format with only letters
                    if (!/^[a-zA-Z]{7}$/.test(password)) {
                      toast({
                        title: "Invalid Password Format", 
                        description: "Password must be exactly 7 letters only",
                        variant: "destructive",
                      });
                      return;
                    }

                    try {
                      const result = await fetch('/api/auth/email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                      });

                      if (result.ok) {
                        toast({
                          title: "Success",
                          description: "Successfully signed up! You can now use your email and password to access features.",
                        });
                        localStorage.setItem('auth-email', email);
                        localStorage.setItem('auth-password', password);
                      } else {
                        const data = await result.json();
                        throw new Error(data.error || 'Failed to sign up');
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to sign up",
                        variant: "destructive",
                      });
                    }
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email..."
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Create 7-letter password..."
                          maxLength={7}
                          pattern="^[a-zA-Z]{7}$"
                          title="Must be exactly 7 letters (uppercase and lowercase allowed)"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Sign Up</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;