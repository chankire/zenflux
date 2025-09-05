import { EnhancedForecastingEngine } from "./enhanced-forecasting-engine";
import { MockTransaction } from "./mock-data";
import { dataStore } from "./data-store";
import { FileProcessor } from "./file-processor";
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
    // Get real metrics from uploaded data
    const realMetrics = dataStore.calculateMetrics();
    
    // Return real data if available, otherwise return sample data
    if (realMetrics.transactionCount > 0) {
      console.log("Returning real metrics from uploaded data:", realMetrics);
      return {
        totalBalance: realMetrics.totalBalance,
        monthlyIncome: realMetrics.monthlyIncome,
        monthlyExpenses: realMetrics.monthlyExpenses,
        burnRate: realMetrics.burnRate,
        runwayMonths: realMetrics.runwayMonths,
        growthRate: realMetrics.growthRate
      };
    }
    
    console.log("No uploaded data, returning sample metrics");
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
    // Get real transactions from uploaded data
    const transactions = dataStore.getTransactions();
    
    if (transactions.length > 0) {
      console.log(`Returning ${transactions.length} real transactions`);
      return transactions;
    }
    
    console.log("No uploaded data, returning empty array");
    // Mock data for now - replace with actual Supabase queries
    return [];
  },
  
  async uploadFile(file: File): Promise<any> {
    // Process file with real CSV/Excel parser
    console.log(`Starting to process file: ${file.name}`);
    dataStore.setLoading(true);
    
    try {
      const result = await FileProcessor.processFile(file);
      
      if (result.success) {
        dataStore.addFileData(result);
        console.log(`Successfully processed ${result.transactions.length} transactions`);
        
        return {
          success: true,
          fileName: file.name,
          transactionCount: result.transactions.length,
          summary: result.summary
        };
      } else {
        console.error("File processing failed:", result.error);
        return {
          success: false,
          error: result.error,
          fileName: file.name
        };
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message,
        fileName: file.name
      };
    } finally {
      dataStore.setLoading(false);
    }

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

export default { analyticsAPI, transactionsAPI, forecastAPI };
