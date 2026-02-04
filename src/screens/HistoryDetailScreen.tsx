import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type HistoryDetailRouteProp = RouteProp<RootStackParamList, 'HistoryDetail'>;

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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{formatDate(item.date)}</Text>
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* First Reading */}
        <Text style={styles.scriptureRef}>{item.first_reading.reference}</Text>
        <Text style={styles.scriptureText}>{item.first_reading.text}</Text>

        <View style={styles.divider} />

        {/* Gospel */}
        <Text style={styles.scriptureRef}>{item.gospel.reference}</Text>
        <Text style={styles.scriptureText}>{item.gospel.text}</Text>

        <View style={styles.divider} />

        {/* Commentary */}
        <Text style={styles.commentaryLabel}>Commentary</Text>
        <Text style={styles.commentaryText}>{item.commentary_unified}</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  scriptureRef: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
    marginBottom: 16,
  },
  scriptureText: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 34,
    color: colors.text.scripture,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 32,
  },
  commentaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
    marginBottom: 16,
  },
  commentaryText: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.text.primary,
  },
});
