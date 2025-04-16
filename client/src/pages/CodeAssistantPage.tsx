import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const CodeAssistantPage = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [task, setTask] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c#', label: 'C#' },
    { value: 'c++', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'rust', label: 'Rust' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'shell', label: 'Shell/Bash' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      toast({
        title: "Error",
        description: "Please enter some code or describe what you want to create",
        variant: "destructive",
      });
      return;
    }
    
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await apiRequest<{ result: string }>('/api/code-assistance', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language,
          task: task || "Explain this code and suggest improvements",
          apiKey,
        }),
      });

      if (response.result) {
        setResult(response.result);
      } else {
        toast({
          title: "Error",
          description: "Failed to process code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!task || !language || !apiKey) {
      toast({
        title: "Error",
        description: "Please enter a task description, select a language, and provide your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await apiRequest<{ result: string }>('/api/code-assistance', {
        method: 'POST',
        body: JSON.stringify({
          code: `// Generate ${language} code for: ${task}`,
          language,
          task: `Generate complete working code for: ${task}. The code should be well-structured, documented, and follow best practices.`,
          apiKey,
        }),
      });

      if (response.result) {
        setResult(response.result);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Code Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="Enter your password..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task" className="block text-sm font-medium">
              Task Description
            </label>
            <textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full p-2 border rounded-md bg-background min-h-[80px]"
              placeholder="Describe what you want to do with the code (e.g., 'Debug this function', 'Optimize this algorithm', 'Explain this code')"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="language" className="block text-sm font-medium">
                Programming Language
              </label>
              <button
                onClick={handleGenerateNewCode}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                disabled={isLoading}
              >
                Generate New Code
              </button>
            </div>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium">
              Code
            </label>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2 border rounded-md bg-background font-mono text-sm min-h-[300px]"
              placeholder="Paste your code here or describe what you want to create..."
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Analyze & Improve Code'}
          </button>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Result</h2>
          <div className="border rounded-md p-4 bg-background min-h-[500px] prose prose-sm dark:prose-invert max-w-full overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: result.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>') }} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Results will appear here. You can:
                <ul className="list-disc pl-5 mt-2">
                  <li>Analyze existing code for improvements</li>
                  <li>Debug problematic code</li>
                  <li>Generate completely new code from a description</li>
                  <li>Get explanations for complex code</li>
                  <li>Optimize code for better performance</li>
                </ul>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeAssistantPage;