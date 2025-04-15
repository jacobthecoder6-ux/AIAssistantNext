import { FC } from "react";

interface ThemeToggleProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ currentTheme, onThemeChange }) => {
  const handleThemeChange = (theme: string) => {
    onThemeChange(theme);
    localStorage.setItem('preferred-theme', theme);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <button 
        className={`theme-option p-2 rounded-lg border-2 transition-colors text-center ${currentTheme === 'light' ? 'border-primary-500' : 'border-transparent hover:border-primary-500'}`}
        onClick={() => handleThemeChange('light')}
      >
        <div className="w-full h-14 mb-2 bg-gray-100 rounded-md shadow-sm"></div>
        Light
      </button>
      
      <button 
        className={`theme-option p-2 rounded-lg border-2 transition-colors text-center ${currentTheme === 'dark' ? 'border-primary-500' : 'border-transparent hover:border-primary-500'}`}
        onClick={() => handleThemeChange('dark')}
      >
        <div className="w-full h-14 mb-2 bg-gray-800 rounded-md shadow-sm"></div>
        Dark
      </button>
      
      <button 
        className={`theme-option p-2 rounded-lg border-2 transition-colors text-center ${currentTheme === 'blue' ? 'border-primary-500' : 'border-transparent hover:border-primary-500'}`}
        onClick={() => handleThemeChange('blue')}
      >
        <div className="w-full h-14 mb-2 bg-blue-50 rounded-md shadow-sm"></div>
        Blue
      </button>
    </div>
  );
};

export default ThemeToggle;
