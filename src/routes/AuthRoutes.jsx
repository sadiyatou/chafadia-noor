// src/routes/AuthRoutes.jsx

import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

// AUTH SCREENS
import LoadingScreen from '../app/auth/LoadingScreen';
import LoginScreen from '../app/auth/login';
import CreateAccountScreen from '../app/auth/CreateAccount';
import ForgotPasswordScreen from '../app/auth/ForgotPassword';

const Stack =
  createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="Loading"

      screenOptions={{
        headerShown: false,

        animation: 'slide_from_right',
      }}
    >
      {/* LOADING SCREEN */}
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
      />

      {/* LOGIN SCREEN */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      {/* CREATE ACCOUNT SCREEN */}
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
      />

      {/* FORGOT PASSWORD SCREEN */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}