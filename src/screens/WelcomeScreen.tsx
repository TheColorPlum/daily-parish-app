import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { ScreenShell, Button, DisplayLg, Body } from '../components';
import { spacing } from '../theme';

export function WelcomeScreen() {
  // TODO: Implement Clerk sign up/in flows
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signIn, setActive: setSignInActive } = useSignIn();

  const handleCreateAccount = async () => {
    // TODO: Navigate to Clerk sign up UI
    console.log('Create account');
  };

  const handleSignIn = async () => {
    // TODO: Navigate to Clerk sign in UI
    console.log('Sign in');
  };

  return (
    <ScreenShell scrollable={false}>
      <View style={styles.content}>
        {/* App Icon Placeholder */}
        <View style={styles.iconPlaceholder} />
        
        <DisplayLg style={styles.title}>Daily Parish</DisplayLg>
        <Body color="secondary" style={styles.tagline}>
          A quiet daily prayer practice.
        </Body>
      </View>
      
      <View style={styles.buttons}>
        <Button 
          title="Create Account" 
          onPress={handleCreateAccount}
          style={styles.primaryButton}
        />
        <Button 
          title="Sign In" 
          variant="ghost"
          onPress={handleSignIn}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Push content up from center
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginBottom: spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tagline: {
    textAlign: 'center',
  },
  buttons: {
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
});
