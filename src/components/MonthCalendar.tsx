import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 48 - 12) / 7); // 48 = padding, 12 = gaps

interface MonthCalendarProps {
  /** Set of completed dates in YYYY-MM-DD format */
  completedDates: Set<string>;
  /** Set of available dates (have readings) in YYYY-MM-DD format */
  availableDates: Set<string>;
  /** Called when an available day is tapped */
  onDayPress: (date: string, hasSession: boolean) => void;
  /** Initial month to display (defaults to current) */
  initialDate?: Date;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MonthCalendar({ completedDates, availableDates, onDayPress, initialDate }: MonthCalendarProps) {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  
  const today = new Date();
  const todayStr = formatDate(today);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Build calendar grid
  const days: (number | null)[] = [];
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    // Don't go past current month
    if (next <= new Date(today.getFullYear(), today.getMonth() + 1, 0)) {
      setCurrentDate(next);
    }
  };
  
  const canGoNext = new Date(year, month + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  function formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  
  function getDayString(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  function handleDayPress(day: number) {
    const dateStr = getDayString(day);
    const isAvailable = availableDates.has(dateStr);
    const hasSession = completedDates.has(dateStr);
    
    if (isAvailable) {
      onDayPress(dateStr, hasSession);
    }
  }

  const styles = createStyles(colors);
  
  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{monthName}</Text>
        
        <TouchableOpacity 
          onPress={goToNextMonth} 
          style={styles.navButton}
          disabled={!canGoNext}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={canGoNext ? colors.text.secondary : colors.text.muted} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.grid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          
          const dateStr = getDayString(day);
          const isCompleted = completedDates.has(dateStr);
          const isAvailable = availableDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = new Date(dateStr) > today;
          
          return (
            <TouchableOpacity
              key={day}
              style={styles.dayCell}
              onPress={() => handleDayPress(day)}
              disabled={!isAvailable}
              activeOpacity={isAvailable ? 0.6 : 1}
            >
              <View style={[
                styles.dayInner,
                isToday && { borderWidth: 2, borderColor: colors.accent },
              ]}>
                <Text style={[
                  styles.dayText,
                  isFuture && { color: colors.text.muted },
                  isToday && { fontWeight: '600', color: colors.accent },
                ]}>
                  {day}
                </Text>
                
                {isCompleted && (
                  <View style={[styles.completedDot, { backgroundColor: colors.accent }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    marginRight: 2,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    marginBottom: 2,
  },
  dayInner: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (DAY_SIZE - 8) / 2,
  },
  dayText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  completedDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
