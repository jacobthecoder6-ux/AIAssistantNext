import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const ImageGeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [size, setSize] = useState('1024x1024');
  const { toast } = useToast();

  const sizes = [
    { value: '1024x1024', label: '1024×1024 (Square)' },
    { value: '1792x1024', label: '1792×1024 (Landscape)' },
    { value: '1024x1792', label: '1024×1792 (Portrait)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter an image description",
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
    
    try {
      const response = await apiRequest<{ imageUrl: string }>('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          apiKey,
          size
        }),
      });
      
      if (response.imageUrl) {
        setImageUrl(response.imageUrl);
        setGeneratedPrompts(prev => [prompt, ...prev].slice(0, 10));
      } else {
        toast({
          title: "Error",
          description: "Failed to generate image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const promptSuggestions = [
    "A futuristic city with flying cars and holographic billboards",
    "A peaceful Japanese garden with cherry blossoms and a koi pond",
    "A magical forest with glowing mushrooms and fairy lights",
    "An astronaut standing on Mars with Earth visible in the sky",
    "A cozy cabin in the mountains during winter with snow falling",
    "A steampunk-inspired mechanical dragon",
    "An underwater scene with colorful coral reefs and tropical fish",
    "A fantasy castle on a floating island among the clouds"
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Image Generator</h1>
      
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
            <label htmlFor="size" className="block text-sm font-medium">
              Image Size
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              {sizes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="prompt" className="block text-sm font-medium">
              Image Description
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border rounded-md bg-background min-h-[120px]"
              placeholder="Describe the image you want to generate in detail..."
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                >
                  {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
                </button>
              ))}
            </div>
          </div>
          
          {generatedPrompts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Recently Generated</h3>
              <div className="flex flex-wrap gap-2">
                {generatedPrompts.map((genPrompt, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(genPrompt)}
                    className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                  >
                    {genPrompt.length > 30 ? genPrompt.substring(0, 30) + '...' : genPrompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Image</h2>
          <div className="border rounded-md p-2 bg-background aspect-square flex items-center justify-center overflow-hidden">
            {isLoading ? (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            ) : imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="max-w-full max-h-full object-contain"
                onError={() => {
                  toast({
                    title: "Error",
                    description: "Failed to load the generated image",
                    variant: "destructive",
                  });
                }} 
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                <p className="mb-4">Your generated image will appear here</p>
                <p className="text-sm">For best results, be detailed and specific in your description</p>
              </div>
            )}
          </div>
          
          {imageUrl && (
            <div className="text-center">
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
              <p className="text-xs text-gray-500 mt-1">
                Remember: Generated images are temporary and may expire
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorPage;