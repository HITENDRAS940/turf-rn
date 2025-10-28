import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import TurfListScreen from '../screens/user/TurfListScreen';
import TurfDetailScreen from '../screens/user/TurfDetailScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import UserDebugScreen from '../screens/UserDebugScreen';
import ThemeShowcaseScreen from '../screens/ThemeShowcaseScreen';

import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserDebug" 
        component={UserDebugScreen}
        options={{ 
          title: 'Debug Info',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#FFFFFF',
        }}
      />
      <Stack.Screen 
        name="ThemeShowcase" 
        component={ThemeShowcaseScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const TurfStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TurfList" 
      component={TurfListScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TurfDetail" 
      component={TurfDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const UserNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Turfs') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 80, // Increased height to accommodate extra padding
          paddingBottom: 28, // Extra padding for phones with home indicator
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Turfs" component={TurfStack} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default UserNavigator;
