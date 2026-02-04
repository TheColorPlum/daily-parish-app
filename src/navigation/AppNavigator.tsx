import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '@clerk/clerk-expo';
import {
  WelcomeScreen,
  TodayScreen,
  HistoryScreen,
  HistoryDetailScreen,
  SettingsScreen,
  ProfileScreen,
  ComponentDemo,
} from '../screens';
import { DrawerContent } from './DrawerContent';
import { useUserLoader } from '../hooks';
import { useTheme } from '../theme';
import type { HistoryItem } from '../types';

// Type definitions for navigation
export type AuthStackParamList = {
  Welcome: undefined;
};

export type DrawerParamList = {
  Today: undefined;
  History: undefined;
  Settings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  HistoryDetail: { item: HistoryItem };
  ComponentDemo: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function AuthNavigator() {
  const { colors } = useTheme();
  
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

function DrawerNavigator() {
  const { colors } = useTheme();
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.bg.surface,
          width: 280,
        },
        sceneStyle: { backgroundColor: colors.bg.surface },
      }}
    >
      <Drawer.Screen name="Today" component={TodayScreen} />
      <Drawer.Screen name="History" component={HistoryScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();
  
  // Load user profile on auth
  useUserLoader();
  
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.surface },
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="Main" component={DrawerNavigator} />
      <RootStack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
      <RootStack.Screen name="ComponentDemo" component={ComponentDemo} />
    </RootStack.Navigator>
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
