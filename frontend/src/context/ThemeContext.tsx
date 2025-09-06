import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, THEME_CONFIG } from '@/utils/config';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = THEME_CONFIG.defaultTheme,
  storageKey = THEME_CONFIG.storageKey,
  attribute = THEME_CONFIG.attribute,
  enableSystem = THEME_CONFIG.enableSystem,
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      } else {
        root.setAttribute(attribute, newTheme);
      }
      
      // Also set data attribute for CSS compatibility
      root.setAttribute('data-theme', newTheme);
      
      // Update color-scheme CSS property
      root.style.colorScheme = newTheme;
      
      setResolvedTheme(newTheme);
    }
  };

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Set theme and persist to storage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
    
    const resolved = resolveTheme(newTheme);
    applyTheme(resolved);
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme(enableSystem ? 'system' : 'light');
    } else {
      setTheme('light');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let savedTheme: Theme = defaultTheme;
      
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          savedTheme = stored as Theme;
        }
      } catch (error) {
        console.warn('Failed to read theme from localStorage:', error);
      }
      
      setThemeState(savedTheme);
      const resolved = resolveTheme(savedTheme);
      applyTheme(resolved);
    }
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && enableSystem && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        applyTheme(systemTheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme, enableSystem]);

  // Update resolved theme when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    if (resolved !== resolvedTheme) {
      applyTheme(resolved);
    }
  }, [theme]);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme toggle button component
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme, isDark, isLight, isSystem } = useTheme();

  const getThemeIcon = () => {
    if (isLight) return '☀️';
    if (isDark) return '🌙';
    if (isSystem) return '🖥️';
    return '☀️';
  };

  const getThemeLabel = () => {
    if (isLight) return 'Light mode';
    if (isDark) return 'Dark mode';
    if (isSystem) return 'System mode';
    return 'Theme';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center w-10 h-10 rounded-lg
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500
        ${className}
      `}
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
    >
      <span className="text-lg">{getThemeIcon()}</span>
    </button>
  );
};

export default ThemeContext;