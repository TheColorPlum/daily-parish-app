import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useTheme, spacing, radius } from '../theme';

export function PrayScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={16}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={28} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>My Prayers</Text>
        <View style={styles.menuButton} />
      </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="create-outline" size={48} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>Coming Soon</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Write prayers, track answered prayers, and share with others.
        </Text>
        <View style={[styles.featureList, { backgroundColor: colors.bg.elevated }]}>
          <FeatureItem icon="pencil" text="Write daily prayers" colors={colors} />
          <FeatureItem icon="checkmark-circle" text="Mark prayers as answered" colors={colors} />
          <FeatureItem icon="share" text="Share prayers with loved ones" colors={colors} />
          <FeatureItem icon="search" text="Search your prayer history" colors={colors} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text, colors }: { icon: string; text: string; colors: any }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={colors.accent} />
      <Text style={[styles.featureText, { color: colors.text.primary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  featureList: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  featureText: {
    fontSize: 15,
    marginLeft: spacing.md,
  },
});
