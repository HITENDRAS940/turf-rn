import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import DashboardScreen from '../screens/admin/DashboardScreen';
import TurfManagementScreen from '../screens/admin/TurfManagementScreen';
import AllBookingsScreen from '../screens/admin/AllBookingsScreen';
import AdminMoreScreen from '../screens/admin/AdminMoreScreen';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Turfs') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 80, // Increased height to accommodate extra padding
          paddingBottom: 28, // Extra padding for phones with home indicator
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Turfs" component={TurfManagementScreen} />
      <Tab.Screen name="Bookings" component={AllBookingsScreen} />
      <Tab.Screen name="More" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
