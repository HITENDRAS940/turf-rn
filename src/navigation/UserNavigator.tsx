import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import TurfListScreen from '../screens/user/TurfListScreen';
import TurfDetailScreen from '../screens/user/TurfDetailScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import PaymentSelectionScreen from '../screens/user/PaymentSelectionScreen';

import { useTheme } from '../contexts/ThemeContext';
import CustomTabBar from '../components/shared/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const TurfStack = () => (
  <Stack.Navigator
    screenOptions={{
      animation: 'slide_from_right',
      animationDuration: 200,
    }}
  >
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
    <Stack.Screen 
      name="PaymentSelection" 
      component={PaymentSelectionScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const UserNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Turfs" 
        component={TurfStack} 
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'TurfList';
            if (routeName === 'TurfDetail' || routeName === 'PaymentSelection') {
              return { display: 'none' };
            }
            return undefined;
          })(route),
        })}
      />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default UserNavigator;
