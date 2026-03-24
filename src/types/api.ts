/**
 * API Types for Daily Parish
 * Based on MOBILE-SPRINT-PLAN.md API Reference
 */

export interface Reading {
  reference: string;
  text: string;
}

export interface TodayResponse {
  date: string;
  first_reading: Reading;
  responsorial_psalm: Reading | null;
  gospel: Reading;
  commentary_unified: string;
  audio_unified_url: string | null;
  // Liturgical calendar
  season?: string;
  feast?: string | null;
}

export interface SessionStartResponse {
  session_id: string;
  date: string;
  daily_readings_id: string;
}

export interface SessionCompleteResponse {
  success: boolean;
  streak: {
    current_streak: number;
    longest_streak: number;
  };
}

export interface HistoryItem {
  date: string;
  streak_count: number;
  first_reading: Reading;
  responsorial_psalm: Reading | null;
  gospel: Reading;
  commentary_unified: string;
}

export type HistoryResponse = HistoryItem[];

export interface UserResponse {
  id: string;
  email: string;
  subscription_status: 'free' | 'premium';
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}
