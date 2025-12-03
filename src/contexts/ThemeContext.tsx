import React, { createContext, useContext, ReactNode } from 'react';

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
    shadow: string;
  };
}

export const theme: Theme = {
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
    shadow: '#000000',
  },
};

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({ theme });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
