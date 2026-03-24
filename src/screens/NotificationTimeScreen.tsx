import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, ScreenShell, Body, DisplayLg } from '../components';
import { useTheme, spacing, radius } from '../theme';
import { useSettingsStore } from '../stores';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder,
} from '../lib';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function NotificationTimeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>((() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0); // Default 7:00 AM
    return d;
  })());
  
  const { 
    setDailyReminderEnabled,
    setReminderTime,
    setNotificationPermissionGranted,
  } = useSettingsStore();

  const formatTime = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleSetTime = async (hour: number, minute: number, label: string) => {
    // Request permissions and schedule notification
    const granted = await requestNotificationPermissions();
    setNotificationPermissionGranted(granted);
    
    if (granted) {
      setReminderTime(hour, minute);
      setDailyReminderEnabled(true);
      await scheduleDailyReminder(hour, minute);
    }
    
    navigation.navigate('OnboardingCompletion', { time: label });
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (event.type === 'set' && date) {
      setSelectedTime(date);
      handleSetTime(date.getHours(), date.getMinutes(), formatTime(date));
    }
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingCompletion', { time: undefined });
  };

  const styles = createStyles(colors);

  return (
    <ScreenShell scrollable={false}>
      <View style={styles.container}>
        <DisplayLg style={styles.title}>
          When would you like your moment of peace?
        </DisplayLg>
        
        <Body color="secondary" style={styles.subtitle}>
          We'll send a gentle reminder so you never miss a day.
        </Body>

        <View style={styles.buttons}>
          <Button 
            title="☀️ Morning (7:00 AM)"
            onPress={() => handleSetTime(7, 0, 'at 7:00 AM')}
            style={styles.button}
          />
          <Button 
            title="🌅 Evening (8:00 PM)"
            onPress={() => handleSetTime(20, 0, 'at 8:00 PM')}
            style={styles.button}
          />
          <Button 
            title="⏰ Choose a time..."
            variant="secondary"
            onPress={() => setShowTimePicker(true)}
            style={styles.button}
          />
        </View>

        <Button 
          title="Skip for now" 
          variant="ghost"
          onPress={handleSkip}
        />

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </ScreenShell>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  buttons: {
    marginBottom: spacing['2xl'],
  },
  button: {
    marginBottom: spacing.md,
  },
});
