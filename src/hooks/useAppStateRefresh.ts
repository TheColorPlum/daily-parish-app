import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useTodayStore } from '../stores';

/**
 * Hook to detect date changes when app comes to foreground.
 * If the stored date doesn't match today, triggers a refresh.
 */
export function useAppStateRefresh(onRefreshNeeded: () => void) {
  const appState = useRef(AppState.currentState);
  const { date, clearToday } = useTodayStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [date]);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    // Only check when coming to foreground
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      checkDateChange();
    }
    
    appState.current = nextAppState;
  }

  function checkDateChange() {
    if (!date) return;
    
    // Get today's date in YYYY-MM-DD format
    // Use America/Chicago timezone to match server
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Chicago',
    });
    
    if (date !== today) {
      clearToday();
      onRefreshNeeded();
    }
  }
}
