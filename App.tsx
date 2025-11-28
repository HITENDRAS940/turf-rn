import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar 
        barStyle={theme.id === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.surface} 
      />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
