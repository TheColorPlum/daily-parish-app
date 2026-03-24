import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
  NotificationTimeScreen,
  OnboardingCompletionScreen,
} from '../screens';
import { LightACandleScreen } from '../features/light-a-candle';
import { LibraryScreen } from '../features/library';
import { MiniPlayer } from '../components/MiniPlayer';
// Note: Support/Donate can be added later as needed
import { useUserLoader } from '../hooks';
import { useUserStore, useUserStoreHydrated } from '../stores';
import { useTheme } from '../theme';

// Type definitions for navigation
export type AuthStackParamList = {
  Welcome: undefined;
};

export type TabParamList = {
  Today: undefined;
  Library: undefined;
  Prayers: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  LightACandle: undefined;
  OnboardingNotificationTime: undefined;
  OnboardingCompletion: { time?: string };
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
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            
            if (route.name === 'Today') {
              iconName = focused ? 'today' : 'today-outline';
            } else if (route.name === 'Library') {
              iconName = focused ? 'book' : 'book-outline';
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
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Prayers" component={PrayScreen} />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarLabel: () => null, // Icon only
          }}
        />
      </Tab.Navigator>
      
      {/* Mini-player docked above tab bar */}
      <MiniPlayer />
    </>
  );
}

function MainNavigator() {
  const { colors } = useTheme();
  const isHydrated = useUserStoreHydrated();
  const { hasSeenWelcome, hasCompletedOnboarding } = useUserStore();
  
  // Only show interstitial AFTER hydration completes and user hasn't seen welcome
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [initialRouteDecided, setInitialRouteDecided] = useState(false);
  const needsOnboardingRef = useRef(false);
  
  // Load user profile on auth
  useUserLoader();
  
  // Once hydrated, decide what to show
  useEffect(() => {
    if (isHydrated && !initialRouteDecided) {
      setInitialRouteDecided(true);
      
      // Only show interstitial if user hasn't seen welcome
      if (!hasSeenWelcome) {
        setShowInterstitial(true);
      }
      
      // Track if we need onboarding
      needsOnboardingRef.current = !hasCompletedOnboarding;
    }
  }, [isHydrated, hasSeenWelcome, hasCompletedOnboarding, initialRouteDecided]);
  
  // When interstitial completes, we'll use the ref to determine initial route
  const handleInterstitialComplete = () => {
    needsOnboardingRef.current = !hasCompletedOnboarding;
    setShowInterstitial(false);
  };
  
  // Wait for hydration before rendering anything
  if (!isHydrated || !initialRouteDecided) {
    // Could show a splash screen here, but null is fine for quick hydration
    return null;
  }
  
  // Show welcome interstitial for first-time users
  if (showInterstitial) {
    return (
      <WelcomeInterstitial onComplete={handleInterstitialComplete} />
    );
  }
  
  // Determine initial route: onboarding for new users, tabs for returning users
  const initialRouteName = needsOnboardingRef.current ? 'OnboardingNotificationTime' : 'Main';
  
  return (
    <RootStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.surface },
        animation: 'fade',
        animationDuration: 400,
      }}
    >
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen 
        name="LightACandle" 
        component={LightACandleScreen}
        options={{
          animation: 'fade',
          animationDuration: 350,
        }}
      />
      {/* Onboarding screens - fullscreen with gesture disabled to prevent skipping */}
      <RootStack.Screen
        name="OnboardingNotificationTime"
        component={NotificationTimeScreen}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
      <RootStack.Screen
        name="OnboardingCompletion"
        component={OnboardingCompletionScreen}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
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
