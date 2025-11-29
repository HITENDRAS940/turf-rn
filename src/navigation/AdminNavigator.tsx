import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import DashboardScreen from '../screens/admin/DashboardScreen';
import TurfManagementScreen from '../screens/admin/TurfManagementScreen';
import AllBookingsScreen from '../screens/admin/AllBookingsScreen';
import AdminMoreScreen from '../screens/admin/AdminMoreScreen';
import AdminTurfDetailScreen from '../screens/admin/AdminTurfDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import CustomTabBar from '../components/shared/CustomTabBar';

// Turfs Stack Navigator
const TurfsStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="TurfManagementList" component={TurfManagementScreen} />
      <Stack.Screen name="AdminTurfDetail" component={AdminTurfDetailScreen} />
    </Stack.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Turfs" component={TurfsStack} />
      <Tab.Screen name="Bookings" component={AllBookingsScreen} />
      <Tab.Screen name="More" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
