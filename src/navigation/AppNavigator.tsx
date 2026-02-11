import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '@clerk/clerk-expo';
import {
  WelcomeScreen,
  WelcomeInterstitial,
  TodayScreen,
  PrayScreen,
  SettingsScreen,
  SupportScreen,
} from '../screens';
import { DrawerContent } from './DrawerContent';
import { useUserLoader } from '../hooks';
import { useUserStore } from '../stores';
import { useTheme } from '../theme';

// Type definitions for navigation
export type AuthStackParamList = {
  Welcome: undefined;
};

export type DrawerParamList = {
  Today: undefined;
  History: undefined;  // Prayer journal
  Settings: undefined;
  Support: undefined;
};

export type RootStackParamList = {
  Main: undefined;
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
      <Drawer.Screen name="History" component={PrayScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Support" component={SupportScreen} />
    </Drawer.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();
  const { hasSeenWelcome } = useUserStore();
  const [showInterstitial, setShowInterstitial] = useState(!hasSeenWelcome);
  
  // Load user profile on auth
  useUserLoader();
  
  // Show welcome interstitial for first-time users
  if (showInterstitial) {
    return (
      <WelcomeInterstitial onComplete={() => setShowInterstitial(false)} />
    );
  }
  
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.surface },
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="Main" component={DrawerNavigator} />
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
