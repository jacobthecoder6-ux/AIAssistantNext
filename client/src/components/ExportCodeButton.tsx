import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const ExportCodeButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectCode, setProjectCode] = useState('');
  const { toast } = useToast();

  const handleExportClick = async () => {
    setIsLoading(true);
    try {
      // Fetch project code structure from backend
      const response = await apiRequest<{ code: string }>('/api/export-code', {
        method: 'GET'
      });
      
      if (response.code) {
        setProjectCode(response.code);
        setIsModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to export project code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error exporting code:", error);
      toast({
        title: "Error",
        description: "Failed to export project code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(projectCode)
      .then(() => {
        toast({
          title: "Success",
          description: "Project code copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy code to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([projectCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'ai-chatbot-project.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Success",
      description: "Project code downloaded as JSON file",
    });
  };

  return (
    <>
      <button
        onClick={handleExportClick}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export Project Code</span>
          </>
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Code Export</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-auto flex-grow">
              <p className="mb-4">
                This is the complete code for your AI chatbot project. You can copy it to clipboard or download it as a JSON file.
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[50vh]">
                <pre className="text-sm whitespace-pre-wrap break-words">{projectCode}</pre>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleDownloadCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportCodeButton;