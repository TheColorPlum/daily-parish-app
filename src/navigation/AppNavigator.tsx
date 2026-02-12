import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WelcomeScreen,
  WelcomeInterstitial,
  TodayScreen,
  PrayScreen,
  SettingsScreen,
} from '../screens';
// Note: Support/Donate can be added later as needed
import { useUserLoader } from '../hooks';
import { useUserStore } from '../stores';
import { useTheme } from '../theme';

// Type definitions for navigation
export type AuthStackParamList = {
  Welcome: undefined;
};

export type TabParamList = {
  Today: undefined;
  Prayers: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

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

function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Today') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Prayers') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent.primary, // Green for identity
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 8,
          height: 56 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Prayers" component={PrayScreen} />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: () => null, // Icon only
        }}
      />
    </Tab.Navigator>
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
      <RootStack.Screen name="Main" component={TabNavigator} />
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
