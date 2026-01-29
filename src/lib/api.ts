/**
 * API Client for Daily Parish
 */

const API_BASE_URL = 'https://daily-parish-beta.vercel.app/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || response.statusText, response.status);
  }
  
  return response.json();
}

// API methods
export const api = {
  // Readings
  getTodayReadings: (token: string) => 
    request<import('../types').TodayResponse>('/readings/today', { token }),
  
  // Sessions
  startSession: (token: string) =>
    request<import('../types').SessionStartResponse>('/session/start', { 
      method: 'POST', 
      token 
    }),
  
  completeSession: (token: string, sessionId: string) =>
    request<import('../types').SessionCompleteResponse>('/session/complete', {
      method: 'POST',
      body: { session_id: sessionId },
      token,
    }),
  
  // History
  getHistory: (token: string) =>
    request<import('../types').HistoryResponse>('/history', { token }),
  
  // User
  getUser: (token: string) =>
    request<import('../types').UserResponse>('/user', { token }),
  
  deleteUser: (token: string) =>
    request<{ success: boolean }>('/user', { method: 'DELETE', token }),
};

export { ApiError };
