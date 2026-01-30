import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  ScreenShell, 
  Card, 
  DisplayMd, 
  Body,
  Caption,
  ScriptureHeading,
  ScriptureBody,
} from '../components';
import { colors, spacing } from '../theme';
import type { MainStackParamList } from '../navigation';

type HistoryDetailRouteProp = RouteProp<MainStackParamList, 'HistoryDetail'>;

export function HistoryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<HistoryDetailRouteProp>();
  const { item } = route.params;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString + 'T12:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <DisplayMd>{formatDate(item.date)}</DisplayMd>
      </View>

      {/* First Reading */}
      <Card style={styles.section}>
        <ScriptureHeading style={styles.reference}>
          {item.first_reading.reference}
        </ScriptureHeading>
        <View style={styles.divider} />
        <ScriptureBody>{item.first_reading.text}</ScriptureBody>
      </Card>

      {/* Gospel */}
      <Card style={styles.section}>
        <ScriptureHeading style={styles.reference}>
          {item.gospel.reference}
        </ScriptureHeading>
        <View style={styles.divider} />
        <ScriptureBody>{item.gospel.text}</ScriptureBody>
      </Card>

      {/* Commentary */}
      <Card variant="alt" style={styles.section}>
        <Caption color="muted" style={styles.commentaryLabel}>
          Commentary
        </Caption>
        <Body>{item.commentary_unified}</Body>
      </Card>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    marginRight: spacing.lg,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  reference: {
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.lg,
  },
  commentaryLabel: {
    marginBottom: spacing.sm,
  },
});
