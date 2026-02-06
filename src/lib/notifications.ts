import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if notification permissions are granted.
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule the daily reminder notification.
 * @param hour - Hour of day (0-23)
 * @param minute - Minute (0-59)
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  try {
    // Cancel any existing reminders first
    await cancelDailyReminder();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Parish',
        body: 'Your daily prayer is ready.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return identifier;
  } catch (error) {
    console.error('[notifications] Failed to schedule daily reminder:', error);
    return null;
  }
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[notifications] Failed to cancel notifications:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging).
 */
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}
