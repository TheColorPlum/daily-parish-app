import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Notification settings
  dailyReminderEnabled: boolean;
  reminderHour: number; // 0-23
  reminderMinute: number; // 0-59
  notificationPermissionGranted: boolean;
  
  // Actions
  setDailyReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (hour: number, minute: number) => void;
  setNotificationPermissionGranted: (granted: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state - default reminder at 7:00 AM
      dailyReminderEnabled: false,
      reminderHour: 7,
      reminderMinute: 0,
      notificationPermissionGranted: false,

      // Actions
      setDailyReminderEnabled: (enabled) => set({ dailyReminderEnabled: enabled }),
      
      setReminderTime: (hour, minute) => set({ 
        reminderHour: hour, 
        reminderMinute: minute 
      }),
      
      setNotificationPermissionGranted: (granted) => set({ 
        notificationPermissionGranted: granted 
      }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
