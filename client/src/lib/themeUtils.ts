/**
 * Sets the theme for the application
 */
export const setAppTheme = (theme: string) => {
  // Remove all theme classes
  document.body.classList.remove('dark', 'blue-theme');
  document.body.setAttribute('data-theme', theme);
  
  // Apply selected theme
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.add('bg-gray-900');
    document.body.classList.remove('bg-gray-100', 'bg-blue-50');
  } else if (theme === 'blue') {
    document.body.classList.add('blue-theme');
    document.body.classList.add('bg-blue-50');
    document.body.classList.remove('bg-gray-100', 'bg-gray-900');
  } else {
    // Light theme (default)
    document.body.classList.add('bg-gray-100');
    document.body.classList.remove('bg-gray-900', 'bg-blue-50');
  }
};

/**
 * Defines the CSS color variables for each theme
 */
export const themeColors = {
  light: {
    background: '#f9fafb',
    foreground: '#111827',
    card: '#ffffff',
    cardForeground: '#111827',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#10b981',
    secondaryForeground: '#ffffff',
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    accent: '#dbeafe',
    accentForeground: '#1e40af',
    border: '#e5e7eb',
    input: '#e5e7eb',
    ring: '#93c5fd'
  },
  dark: {
    background: '#111827',
    foreground: '#f9fafb',
    card: '#1f2937',
    cardForeground: '#f9fafb',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#10b981',
    secondaryForeground: '#ffffff',
    muted: '#374151',
    mutedForeground: '#9ca3af',
    accent: '#1e3a8a',
    accentForeground: '#dbeafe',
    border: '#374151',
    input: '#374151',
    ring: '#1e40af'
  },
  blue: {
    background: '#ebf5ff',
    foreground: '#1e3a8a',
    card: '#ffffff',
    cardForeground: '#1e3a8a',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#10b981',
    secondaryForeground: '#ffffff',
    muted: '#dbeafe',
    mutedForeground: '#1e3a8a',
    accent: '#bfdbfe',
    accentForeground: '#1e3a8a',
    border: '#bfdbfe',
    input: '#bfdbfe',
    ring: '#93c5fd'
  }
};
