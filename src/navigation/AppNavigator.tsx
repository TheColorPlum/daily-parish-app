import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@clerk/clerk-expo';
import {
  WelcomeScreen,
  TodayScreen,
  HistoryScreen,
  SettingsScreen,
} from '../screens';
import { colors } from '../theme';

// Type definitions for navigation
export type AuthStackParamList = {
  Welcome: undefined;
};

export type MainStackParamList = {
  Today: undefined;
  History: undefined;
  Settings: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.surface },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.surface },
        animation: 'slide_from_right',
      }}
    >
      <MainStack.Screen name="Today" component={TodayScreen} />
      <MainStack.Screen name="History" component={HistoryScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { isSignedIn, isLoaded } = useAuth();

  // Don't render anything until Clerk has loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
