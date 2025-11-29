import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import ManagerNavigator from './ManagerNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isAdmin, isManager, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Determine which navigator to show
  const getNavigator = () => {
    // No user - show auth flow
    if (!user) {
      return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }
    
    // New user who needs to set name - stay in auth flow
    if (user.isNewUser && user.role === 'ROLE_USER') {
      return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }
    
    // Admin user - show admin interface
    if (isAdmin) {
      return <Stack.Screen name="Admin" component={AdminNavigator} />;
    }

    // Manager user - show manager interface
    if (isManager) {
      return <Stack.Screen name="Manager" component={ManagerNavigator} />;
    }
    
    // Regular user - show user interface
    return <Stack.Screen name="User" component={UserNavigator} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        {getNavigator()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;