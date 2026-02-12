import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { ScreenShell, Button, DisplayLg, Body, Caption } from '../components';
import { colors, spacing, radius } from '../theme';

type AuthMode = 'welcome' | 'signIn' | 'signUp';

export function WelcomeScreen() {
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSignUp = useCallback(async () => {
    if (!isSignUpLoaded || !signUp) return;
    
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }, [isSignUpLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isSignUpLoaded || !signUp) return;

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  }, [isSignUpLoaded, signUp, verificationCode, setSignUpActive]);

  const handleSignIn = useCallback(async () => {
    if (!isSignInLoaded || !signIn) return;

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log('Sign in result:', result.status, result);

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
      } else {
        // Handle other statuses (needs_first_factor, needs_second_factor, etc.)
        Alert.alert('Sign In', `Unexpected status: ${result.status}. Check Clerk dashboard settings.`);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, [isSignInLoaded, signIn, email, password, setSignInActive]);

  // Welcome screen
  if (mode === 'welcome') {
    return (
      <ScreenShell scrollable={false}>
        <View style={styles.content}>
          <View style={styles.iconPlaceholder} />
          <DisplayLg style={styles.title}>Votive</DisplayLg>
          <Body color="secondary" style={styles.tagline}>
            A quiet daily prayer practice.
          </Body>
        </View>
        
        <View style={styles.buttons}>
          <Button 
            title="Create Account" 
            onPress={() => setMode('signUp')}
            style={styles.primaryButton}
          />
          <Button 
            title="Sign In" 
            variant="ghost"
            onPress={() => setMode('signIn')}
          />
        </View>
      </ScreenShell>
    );
  }

  // Verification screen
  if (pendingVerification) {
    return (
      <ScreenShell scrollable={false}>
        <KeyboardAvoidingView 
          style={styles.authContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <DisplayLg style={styles.authTitle}>Check your email</DisplayLg>
          <Body color="secondary" style={styles.authSubtitle}>
            We sent a verification code to {email}
          </Body>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Verification code"
              placeholderTextColor={colors.text.muted}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              autoFocus
            />

            <Button
              title="Verify"
              onPress={handleVerify}
              loading={loading}
              disabled={!verificationCode}
              style={styles.submitButton}
            />
          </View>

          <Button
            title="Back"
            variant="ghost"
            onPress={() => {
              setPendingVerification(false);
              setMode('welcome');
            }}
          />
        </KeyboardAvoidingView>
      </ScreenShell>
    );
  }

  // Sign In / Sign Up form
  const isSignUp = mode === 'signUp';
  
  return (
    <ScreenShell scrollable={false}>
      <KeyboardAvoidingView 
        style={styles.authContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <DisplayLg style={styles.authTitle}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </DisplayLg>
        <Body color="secondary" style={styles.authSubtitle}>
          {isSignUp 
            ? 'Start your daily prayer practice' 
            : 'Sign in to continue'}
        </Body>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.text.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={isSignUp ? 'Create Account' : 'Sign In'}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            loading={loading}
            disabled={!email || !password}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.switchMode}>
          <Caption color="secondary">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Caption>
          <Button
            title={isSignUp ? 'Sign In' : 'Create Account'}
            variant="ghost"
            onPress={() => setMode(isSignUp ? 'signIn' : 'signUp')}
          />
        </View>

        <Button
          title="Back"
          variant="ghost"
          onPress={() => setMode('welcome')}
        />
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
  // Auth form styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  authSubtitle: {
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  input: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  switchMode: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});
