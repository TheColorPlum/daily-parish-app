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
    if (!isSignUpLoaded || !signUp) {
      console.error('[Auth] Sign-up not loaded or unavailable');
      return;
    }
    
    console.log('[Auth] Attempting sign-up for:', email);
    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      console.log('[Auth] Sign-up created, status:', result.status);

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      console.log('[Auth] Verification email sent');
      setPendingVerification(true);
    } catch (err: any) {
      console.error('[Auth] Sign-up error:', JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.message || 'Failed to create account';
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isSignUpLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isSignUpLoaded || !signUp) {
      console.error('[Auth] Sign-up not loaded during verification');
      return;
    }

    console.log('[Auth] Attempting verification with code:', verificationCode);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      console.log('[Auth] Verification result:', result.status);
      if (result.status === 'complete') {
        console.log('[Auth] Verification complete, activating session:', result.createdSessionId);
        await setSignUpActive({ session: result.createdSessionId });
      } else {
        console.log('[Auth] Verification incomplete:', result);
        Alert.alert('Verification', `Status: ${result.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('[Auth] Verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Verification Failed', err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  }, [isSignUpLoaded, signUp, verificationCode, setSignUpActive]);

  const handleSignIn = useCallback(async () => {
    if (!isSignInLoaded || !signIn) {
      console.error('[Auth] Sign-in not loaded or unavailable');
      return;
    }

    console.log('[Auth] Attempting sign-in for:', email);
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log('[Auth] Sign-in result:', result.status);

      if (result.status === 'complete') {
        console.log('[Auth] Sign-in complete, activating session:', result.createdSessionId);
        await setSignInActive({ session: result.createdSessionId });
      } else {
        // Handle other statuses (needs_first_factor, needs_second_factor, etc.)
        console.log('[Auth] Unexpected status:', result.status, result);
        Alert.alert('Sign In', `Additional verification needed: ${result.status}`);
      }
    } catch (err: any) {
      console.error('[Auth] Sign-in error:', JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.message || 'Failed to sign in';
      const errorCode = err.errors?.[0]?.code;
      console.error('[Auth] Error code:', errorCode, 'Message:', errorMessage);
      Alert.alert('Sign In Failed', errorMessage);
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
