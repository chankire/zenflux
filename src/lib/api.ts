// Removed JWT backend integration for security - now using Supabase Auth only

// Legacy types kept for compatibility - migrate to Supabase types
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

// REMOVED: All JWT backend API functions for security
// Application now uses Supabase Auth and database APIs exclusively