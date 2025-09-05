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

// Mock API functions for enterprise components - no external dependencies

export const analyticsAPI = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Mock data for now - replace with actual Supabase queries
    return {
      totalBalance: 125000,
      monthlyIncome: 28000,
      monthlyExpenses: 18500,
      burnRate: -9500, // Negative because it's money going out (expenses - income)
      runwayMonths: 13,
      growthRate: 8.2
    };
  }
};

export const transactionsAPI = {
  async getTransactions(): Promise<Transaction[]> {
    // Mock data for now - replace with actual Supabase queries
    return [];
  },
  
  async uploadFile(file: File): Promise<any> {
    // Mock upload function - replace with actual file processing
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, fileName: file.name }), 2000);
    });
  }
};

export const forecastAPI = {
  async getModels(): Promise<ForecastModel[]> {
    return [
      { type: 'LSTM', name: 'LSTM Neural Network', description: 'Deep learning model', accuracy: 94 },
      { type: 'ARIMA', name: 'ARIMA Time Series', description: 'Statistical model', accuracy: 89 },
      { type: 'EXPONENTIAL_SMOOTHING', name: 'Exponential Smoothing', description: 'Weighted average', accuracy: 87 },
      { type: 'LINEAR_REGRESSION', name: 'Linear Regression', description: 'Linear trend analysis', accuracy: 82 },
      { type: 'ENSEMBLE', name: 'Ensemble Model', description: 'Combined models', accuracy: 96 }
    ];
  },
  
  async generateForecast(request: ForecastRequest): Promise<ForecastResult> {
    // Mock forecast generation - replace with actual Supabase function call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'forecast-' + Date.now(),
          model: request.model,
          predictions: [],
          accuracy: 92,
          scenario: request.scenario
        });
      }, 3000);
    });
  }
};