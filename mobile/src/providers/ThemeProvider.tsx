import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme context type
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component that manages the app's theme (light/dark mode).
 * Provides theme context to all child components.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get device color scheme
  const deviceColorScheme = useColorScheme();
  
  // Initialize state
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        
        if (storedTheme !== null) {
          // Use stored preference
          setIsDark(storedTheme === 'dark');
        } else {
          // Use device preference
          setIsDark(deviceColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to device preference
        setIsDark(deviceColorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemePreference();
  }, [deviceColorScheme]);
  
  // Save theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      const saveThemePreference = async () => {
        try {
          await AsyncStorage.setItem('@theme_preference', isDark ? 'dark' : 'light');
        } catch (error) {
          console.error('Error saving theme preference:', error);
        }
      };
      
      saveThemePreference();
    }
  }, [isDark, isLoading]);
  
  // Toggle theme
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };
  
  // Set theme explicitly
  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };
  
  // Context value
  const contextValue: ThemeContextType = {
    isDark,
    toggleTheme,
    setTheme,
  };
  
  // Render provider
  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use the theme context.
 * @returns ThemeContextType
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
