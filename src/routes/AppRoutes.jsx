import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import AuthRoutes from './AuthRoutes';
import DashboardRoutes from './DashboardRoutes';

import useAuth from '../hooks/UseAuth';

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {user ? (
          <Stack.Screen
            name="DashboardRoutes"
            component={DashboardRoutes}
          />
        ) : (
          <Stack.Screen
            name="AuthRoutes"
            component={AuthRoutes}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}