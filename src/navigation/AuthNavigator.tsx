import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import PhoneEntryScreen from '../screens/auth/PhoneEntryScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import SetNameScreen from '../screens/auth/SetNameScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { user } = useAuth();
  
  // If user exists and is new, go directly to SetName screen
  const initialRouteName = user?.isNewUser ? 'SetName' : 'PhoneEntry';

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetName" component={SetNameScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
