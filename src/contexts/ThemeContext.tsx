import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    navy: string;
    gray: string;
    lightGray: string;
    red: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Ocean Blue',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      navy: '#1E293B',
      gray: '#6B7280',
      lightGray: '#F3F4F6',
      red: '#DC2626',
    },
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10B981',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#6B7280',
      border: '#D1FAE5',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      navy: '#064E3B',
      gray: '#6B7280',
      lightGray: '#F3F4F6',
      red: '#DC2626',
    },
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    colors: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#8B5CF6',
      background: '#FAFAF9',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      text: '#581C87',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      navy: '#581C87',
      gray: '#6B7280',
      lightGray: '#F3F4F6',
      red: '#DC2626',
    },
  },
  dark: {
    id: 'dark',
    name: 'Professional Dark',
    colors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#60A5FA',
      background: '#0F172A',
      surface: '#1E293B',
      card: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#475569',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#EF4444',
      navy: '#F8FAFC',
      gray: '#94A3B8',
      lightGray: '#475569',
      red: '#EF4444',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@turf_booking_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.default);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId && themes[savedThemeId]) {
        setCurrentTheme(themes[savedThemeId]);
      }
    } catch (error) {
      console.log('Error loading saved theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    if (themes[themeId]) {
      setCurrentTheme(themes[themeId]);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    }
  };

  const availableThemes = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme, availableThemes }}>
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
