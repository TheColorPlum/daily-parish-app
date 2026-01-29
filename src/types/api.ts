/**
 * API Types for Daily Parish
 * Based on Frontend-App/05-api-contract.md
 */

export interface Reading {
  reference: string;
  text: string;
}

export interface TodayResponse {
  date: string;
  first_reading: Reading;
  gospel: Reading;
  commentary: string;
  audio_url: string;
}

export interface SessionStartResponse {
  session_id: string;
  already_completed: boolean;
}

export interface SessionCompleteResponse {
  success: boolean;
  streak: {
    current_streak: number;
    longest_streak: number;
    total_sessions: number;
  };
}

export interface HistoryItem {
  session_id: string;
  date: string;
  first_reading_reference: string;
  gospel_reference: string;
  completed_at: string;
}

export interface HistoryResponse {
  sessions: HistoryItem[];
}

export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
  streak: {
    current_streak: number;
    longest_streak: number;
    total_sessions: number;
  };
}
