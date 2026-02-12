import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useUserStore } from '../stores';
import { useTheme, spacing, radius, typography } from '../theme';

interface WelcomeInterstitialProps {
  onComplete: () => void;
}

export function WelcomeInterstitial({ onComplete }: WelcomeInterstitialProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHasSeenWelcome } = useUserStore();

  function handleBegin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHasSeenWelcome(true);
    onComplete();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.Text 
          entering={FadeIn.delay(200).duration(600)} 
          style={styles.title}
        >
          Welcome back.
        </Animated.Text>
        
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.body}
        >
          <Text style={styles.bodyText}>
            A daily reading.{'\n'}
            A moment to pray.
          </Text>
          
          <Text style={styles.privacyText}>
            Whatever you share stays here —{'\n'}
            just between you and God.
          </Text>
        </Animated.View>
      </View>
      
      <Animated.View 
        entering={FadeIn.delay(1000).duration(400)}
        style={styles.footer}
      >
        <Pressable style={styles.beginButton} onPress={handleBegin}>
          <Text style={styles.beginButtonText}>Begin</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg.surface,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    title: {
      ...typography.displayLg,
      color: colors.text.primary,
      marginBottom: spacing.xl * 2,
      textAlign: 'center',
    },
    body: {
      alignItems: 'center',
    },
    bodyText: {
      fontSize: 20,
      lineHeight: 30,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    privacyText: {
      fontSize: 17,
      lineHeight: 26,
      color: colors.text.secondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    beginButton: {
      backgroundColor: colors.accent.cta, // Orange for CTA
      paddingVertical: spacing.lg,
      borderRadius: radius.sm, // 8px per spec
      alignItems: 'center',
      height: 52,
      justifyContent: 'center',
    },
    beginButtonText: {
      ...typography.bodyStrong,
      color: colors.text.inverse,
    },
  });
