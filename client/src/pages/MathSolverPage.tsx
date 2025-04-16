import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const MathSolverPage = () => {
  const [problem, setProblem] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!problem) {
      toast({
        title: "Error",
        description: "Please enter a math problem",
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
    setSolution('');
    
    try {
      const response = await apiRequest<{ solution: string }>('/api/solve-math', {
        method: 'POST',
        body: JSON.stringify({
          problem,
          apiKey,
          showSteps
        }),
      });
      
      if (response.solution) {
        setSolution(response.solution);
      } else {
        toast({
          title: "Error",
          description: "Failed to solve the math problem. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error solving math problem:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to solve the math problem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleProblems = [
    "Solve the equation: 3x^2 - 6x - 9 = 0",
    "Find the derivative of f(x) = x^3 + 5x^2 - 7x + 2",
    "Integrate ∫ x^2 * sin(x) dx",
    "Find the limit of (x^2 - 1)/(x - 1) as x approaches 1",
    "If I invest $1000 at 5% compound interest annually, how much will I have after 10 years?",
    "A rectangle has a perimeter of 24 cm and an area of 35 cm². Find its dimensions.",
    "Find the probability of getting at least one head when flipping a coin 3 times.",
    "Solve the system of equations: 2x + y = 5 and 3x - 2y = 4"
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Math Solver</h1>
      
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
            <div className="flex items-center justify-between">
              <label htmlFor="problem" className="block text-sm font-medium">
                Math Problem
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showSteps"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showSteps" className="text-sm">
                  Show detailed steps
                </label>
              </div>
            </div>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full p-2 border rounded-md bg-background min-h-[100px]"
              placeholder="Enter your math problem here..."
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Solving...' : 'Solve Problem'}
          </button>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Example Problems</h3>
            <div className="grid grid-cols-1 gap-2">
              {exampleProblems.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setProblem(example)}
                  className="text-left text-sm px-3 py-2 bg-secondary/50 text-secondary-foreground rounded-md hover:bg-secondary/80"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Solution</h2>
          <div className="border rounded-md p-4 bg-background min-h-[500px] prose prose-sm dark:prose-invert max-w-full overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : solution ? (
              <div 
                className="whitespace-pre-wrap" 
                dangerouslySetInnerHTML={{ 
                  __html: solution
                    .replace(/\n/g, '<br/>')
                    .replace(/\$([^$]+)\$/g, '<span class="text-blue-600 dark:text-blue-400 font-mono">$1</span>')
                }} 
              />
            ) : (
              <div className="text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center items-center">
                <p className="text-center mb-4">Enter a math problem and I'll solve it for you</p>
                <p className="text-sm text-center">
                  I can handle algebra, calculus, statistics, geometry, and more!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathSolverPage;