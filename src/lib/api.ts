import axios from 'axios';

const API_BASE_URL = 'https://zenflux-backend-7zmosdgut-charles-projects-446d4486.vercel.app';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zenflux_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zenflux_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

export interface ForecastModel {
  type: 'LSTM' | 'ARIMA' | 'EXPONENTIAL_SMOOTHING' | 'LINEAR_REGRESSION' | 'ENSEMBLE';
  name: string;
  description: string;
  accuracy?: number;
}

export interface ForecastRequest {
  model: string;
  horizon: number;
  scenario: 'conservative' | 'moderate' | 'aggressive';
}

export interface ForecastResult {
  id: string;
  model: string;
  predictions: Array<{
    date: string;
    value: number;
    confidence_lower: number;
    confidence_upper: number;
  }>;
  accuracy: number;
  scenario: string;
}

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  burnRate: number;
  runwayMonths: number;
  growthRate: number;
}

// API Functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('zenflux_token', token);
    return { token, user };
  },

  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { token, user } = response.data;
    localStorage.setItem('zenflux_token', token);
    return { token, user };
  },

  logout: () => {
    localStorage.removeItem('zenflux_token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const transactionsAPI = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/api/transactions');
    return response.data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const forecastAPI = {
  generateForecast: async (request: ForecastRequest): Promise<ForecastResult> => {
    const response = await api.post('/api/forecasts/generate', request);
    return response.data;
  },

  getModels: async (): Promise<ForecastModel[]> => {
    const response = await api.get('/api/forecasts/models');
    return response.data;
  },
};

export const analyticsAPI = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get('/api/analytics/dashboard');
    return response.data;
  },
};