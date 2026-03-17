import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, ScreenShell, Body, DisplayLg, Caption, Scripture } from '../components';
import { useTheme, spacing } from '../theme';
import { useUserStore } from '../stores';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'OnboardingCompletion'>;

export function OnboardingCompletionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { colors } = useTheme();
  const { setHasCompletedOnboarding } = useUserStore();
  
  const selectedTime = route.params?.time || 'tomorrow';

  const handleDone = () => {
    // Mark onboarding as complete
    setHasCompletedOnboarding(true);
    // Reset to main tabs (clears onboarding from back stack)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const styles = createStyles(colors);

  return (
    <ScreenShell scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <DisplayLg style={styles.checkmark}>✓</DisplayLg>
          <DisplayLg style={styles.title}>You're all set.</DisplayLg>
          <Body color="secondary" style={styles.subtitle}>
            {selectedTime 
              ? `Tomorrow's practice is ready for you ${selectedTime}.`
              : `Tomorrow's practice is ready for you.`
            }
          </Body>

          <View style={styles.divider} />

          <View style={styles.gospelPreview}>
            <Caption style={styles.gospelLabel}>📖 Tomorrow's Gospel</Caption>
            <Scripture style={styles.gospelText}>
              "Come to me, all who are weary and burdened..."
            </Scripture>
            <Caption color="secondary" style={styles.gospelReference}>
              — Matthew 11:28
            </Caption>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="See you tomorrow"
            onPress={handleDone}
          />
        </View>
      </View>
    </ScreenShell>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  checkmark: {
    color: colors.accent.primary,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  gospelPreview: {
    alignItems: 'center',
  },
  gospelLabel: {
    marginBottom: spacing.md,
  },
  gospelText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  gospelReference: {
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
