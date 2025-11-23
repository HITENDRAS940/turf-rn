import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ManageAdminsScreen from '../screens/manager/ManageAdminsScreen';
import CreateAdminScreen from '../screens/manager/CreateAdminScreen';
import ManagerTurfListScreen from '../screens/manager/ManagerTurfListScreen';
import AdminDetailScreen from '../screens/manager/AdminDetailScreen';

const Stack = createNativeStackNavigator();

const ManagerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
      <Stack.Screen name="ManageAdmins" component={ManageAdminsScreen} />
      <Stack.Screen name="CreateAdmin" component={CreateAdminScreen} />
      <Stack.Screen name="AdminDetail" component={AdminDetailScreen} />
      <Stack.Screen name="ManagerTurfList" component={ManagerTurfListScreen} />
    </Stack.Navigator>
  );
};

export default ManagerNavigator;
