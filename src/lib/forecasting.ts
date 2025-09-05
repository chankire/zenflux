// Mock forecasting service - no external dependencies

export interface ForecastInput {
  organizationId: string;
  horizon_days: number;
  confidence_level?: number;
  method?: 'ai' | 'statistical' | 'ensemble';
  includeSeasonality?: boolean;
  customParameters?: Record<string, any>;
}

export interface ForecastPoint {
  date: string;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ForecastResult {
  runId: string;
  forecasts: ForecastPoint[];
  accuracy_metrics: {
    mae: number;
    rmse: number;
    mape: number;
    wape: number;
  };
  insights: string[];
  risk_assessment: 'low' | 'medium' | 'high';
  summary: {
    total_change: number;
    average_daily_change: number;
    peak_date: string;
    trough_date: string;
    volatility_score: number;
  };
}

export class ForecastingService {
  
  /**
   * Generate AI-powered forecast using OpenAI
   */
  static async generateAIForecast(input: ForecastInput): Promise<ForecastResult> {
    try {
      // Simulate AI forecast generation with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const forecasts: ForecastPoint[] = [];
      const baseValue = 100000; // Starting cash balance
      
      for (let i = 0; i < input.horizon_days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        
        // Simulate realistic cash flow patterns
        const dailyChange = (Math.random() - 0.5) * 2000; // ±1000 daily variance
        const seasonalFactor = Math.sin((i / 30) * Math.PI) * 500; // Monthly seasonality
        const trendFactor = i * 50; // Slight upward trend
        
        const predicted = baseValue + dailyChange + seasonalFactor + trendFactor;
        const variance = Math.abs(predicted * 0.15); // 15% confidence interval
        
        forecasts.push({
          date: date.toISOString().split('T')[0],
          predicted_value: predicted,
          lower_bound: predicted - variance,
          upper_bound: predicted + variance,
          confidence: input.confidence_level || 0.95,
          trend: dailyChange > 0 ? 'up' : dailyChange < 0 ? 'down' : 'stable'
        });
      }
      
      return {
        runId: `ai-forecast-${Date.now()}`,
        forecasts,
        accuracy_metrics: {
          mae: 2500,
          rmse: 3200,
          mape: 0.06,
          wape: 0.04
        },
        insights: [
          'AI model detected seasonal patterns in cash flow',
          'Upward trend predicted based on historical data',
          'Higher confidence in short-term predictions'
        ],
        risk_assessment: 'low',
        summary: {
          total_change: forecasts[forecasts.length - 1]?.predicted_value - baseValue || 0,
          average_daily_change: forecasts.reduce((sum, f) => sum + (f.predicted_value - baseValue), 0) / forecasts.length,
          peak_date: forecasts.reduce((max, f) => f.predicted_value > max.predicted_value ? f : max).date,
          trough_date: forecasts.reduce((min, f) => f.predicted_value < min.predicted_value ? f : min).date,
          volatility_score: 0.12
        }
      };
    } catch (error: any) {
      console.error('AI Forecast generation failed:', error);
      throw new Error(`AI forecast failed: ${error.message}`);
    }
  }

  /**
   * Generate statistical forecast using time series methods
   */
  static async generateStatisticalForecast(input: ForecastInput): Promise<ForecastResult> {
    // Simulate statistical forecast with mock historical data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock historical transaction data
    const mockTransactions = this.generateMockTransactionData(60); // 60 days of data
    
    // Process data for forecasting
    const dailyBalances = this.aggregateTransactionsByDay(mockTransactions);
    
    // Apply statistical forecasting methods
    const forecasts = await this.applyStatisticalMethods(dailyBalances, input);
    
    return {
      ...forecasts,
      runId: `stat-forecast-${Date.now()}`
    };
  }

  /**
   * Generate ensemble forecast combining AI and statistical methods
   */
  static async generateEnsembleForecast(input: ForecastInput): Promise<ForecastResult> {
    try {
      // Generate both AI and statistical forecasts
      const [aiResult, statResult] = await Promise.all([
        this.generateAIForecast({ ...input, method: 'ai' }),
        this.generateStatisticalForecast({ ...input, method: 'statistical' })
      ]);

      // Combine forecasts with weighted average
      const combinedForecasts = this.combineForecasts(aiResult.forecasts, statResult.forecasts);
      
      // Calculate ensemble metrics
      const ensembleMetrics = this.calculateEnsembleMetrics(aiResult, statResult);
      
      return {
        runId: `ensemble-${Date.now()}`,
        forecasts: combinedForecasts,
        accuracy_metrics: ensembleMetrics.accuracy_metrics,
        insights: [...aiResult.insights, ...statResult.insights, 'Ensemble method used for improved accuracy'],
        risk_assessment: this.calculateEnsembleRisk(aiResult.risk_assessment, statResult.risk_assessment),
        summary: ensembleMetrics.summary
      };
    } catch (error: any) {
      console.error('Ensemble forecast generation failed:', error);
      throw new Error(`Ensemble forecast failed: ${error.message}`);
    }
  }

  /**
   * Validate forecast input parameters
   */
  static validateForecastInput(input: ForecastInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.organizationId) {
      errors.push('Organization ID is required');
    }

    if (!input.horizon_days || input.horizon_days < 1 || input.horizon_days > 365) {
      errors.push('Forecast horizon must be between 1 and 365 days');
    }

    if (input.confidence_level && (input.confidence_level < 0.1 || input.confidence_level > 0.99)) {
      errors.push('Confidence level must be between 0.1 and 0.99');
    }

    if (input.method && !['ai', 'statistical', 'ensemble'].includes(input.method)) {
      errors.push('Invalid forecast method. Must be ai, statistical, or ensemble');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get forecast accuracy for a completed run
   */
  static async getForecastAccuracy(runId: string): Promise<any> {
    // Return mock accuracy metrics
    return {
      mae: 2800,
      rmse: 3500,
      mape: 0.07,
      wape: 0.05
    };
  }

  /**
   * Private helper methods
   */
  private static formatForecastResult(data: any): ForecastResult {
    return {
      runId: data.runId,
      forecasts: data.forecast.daily_forecasts.map((f: any) => ({
        date: f.date,
        predicted_value: f.predicted_balance,
        lower_bound: f.lower_bound,
        upper_bound: f.upper_bound,
        confidence: f.confidence,
        trend: this.calculateTrend(f.predicted_balance, f.lower_bound)
      })),
      accuracy_metrics: {
        mae: Math.random() * 5000 + 2000, // Simulated - would be calculated from backtest
        rmse: Math.random() * 7000 + 3000,
        mape: Math.random() * 0.1 + 0.05,
        wape: Math.random() * 0.08 + 0.04
      },
      insights: data.forecast.summary.key_insights || [],
      risk_assessment: data.forecast.summary.risk_assessment || 'medium',
      summary: {
        total_change: data.forecast.summary.total_change || 0,
        average_daily_change: data.forecast.summary.average_daily_change || 0,
        peak_date: this.findPeakDate(data.forecast.daily_forecasts),
        trough_date: this.findTroughDate(data.forecast.daily_forecasts),
        volatility_score: this.calculateVolatility(data.forecast.daily_forecasts)
      }
    };
  }

  private static generateMockTransactionData(days: number): any[] {
    const transactions = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      
      // Generate 2-5 transactions per day
      const numTransactions = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < numTransactions; j++) {
        transactions.push({
          id: `tx-${i}-${j}`,
          value_date: date.toISOString().split('T')[0],
          amount: (Math.random() - 0.3) * 5000, // Bias towards expenses
          description: `Mock transaction ${i}-${j}`
        });
      }
    }
    
    return transactions;
  }

  private static aggregateTransactionsByDay(transactions: any[]): any[] {
    const dailyData: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = tx.value_date;
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += Number(tx.amount);
    });

    return Object.entries(dailyData).map(([date, amount]) => ({
      date,
      amount,
      cumulative: amount // Would calculate proper cumulative in real implementation
    }));
  }

  private static async applyStatisticalMethods(data: any[], input: ForecastInput): Promise<Omit<ForecastResult, 'runId'>> {
    // Simple moving average for demonstration - would use sophisticated statistical methods
    const windowSize = Math.min(30, Math.floor(data.length / 3));
    const movingAvg = this.calculateMovingAverage(data, windowSize);
    
    const forecasts: ForecastPoint[] = [];
    const lastValue = data[data.length - 1]?.amount || 0;
    const avgChange = movingAvg[movingAvg.length - 1] || 0;
    
    for (let i = 0; i < input.horizon_days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      const predicted = lastValue + (avgChange * (i + 1));
      const variance = Math.abs(predicted * 0.1); // 10% variance
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        predicted_value: predicted,
        lower_bound: predicted - variance,
        upper_bound: predicted + variance,
        confidence: input.confidence_level || 0.95,
        trend: avgChange > 0 ? 'up' : avgChange < 0 ? 'down' : 'stable'
      });
    }

    return {
      forecasts,
      accuracy_metrics: {
        mae: 3000,
        rmse: 4500,
        mape: 0.08,
        wape: 0.06
      },
      insights: ['Statistical model based on moving averages', 'Considers historical trends'],
      risk_assessment: 'medium',
      summary: {
        total_change: avgChange * input.horizon_days,
        average_daily_change: avgChange,
        peak_date: forecasts[0]?.date || '',
        trough_date: forecasts[forecasts.length - 1]?.date || '',
        volatility_score: 0.15
      }
    };
  }

  private static calculateMovingAverage(data: any[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = windowSize - 1; i < data.length; i++) {
      const sum = data.slice(i - windowSize + 1, i + 1)
        .reduce((acc, item) => acc + item.amount, 0);
      result.push(sum / windowSize);
    }
    return result;
  }

  private static combineForecasts(aiForecasts: ForecastPoint[], statForecasts: ForecastPoint[]): ForecastPoint[] {
    return aiForecasts.map((ai, index) => {
      const stat = statForecasts[index];
      if (!stat) return ai;

      // Weight AI forecasts more heavily (70% AI, 30% statistical)
      const aiWeight = 0.7;
      const statWeight = 0.3;

      return {
        date: ai.date,
        predicted_value: (ai.predicted_value * aiWeight) + (stat.predicted_value * statWeight),
        lower_bound: Math.min(ai.lower_bound, stat.lower_bound),
        upper_bound: Math.max(ai.upper_bound, stat.upper_bound),
        confidence: Math.min(ai.confidence, stat.confidence),
        trend: ai.trend // Use AI trend as primary
      };
    });
  }

  private static calculateEnsembleMetrics(aiResult: ForecastResult, statResult: ForecastResult): any {
    return {
      accuracy_metrics: {
        mae: Math.min(aiResult.accuracy_metrics.mae, statResult.accuracy_metrics.mae),
        rmse: Math.min(aiResult.accuracy_metrics.rmse, statResult.accuracy_metrics.rmse),
        mape: Math.min(aiResult.accuracy_metrics.mape, statResult.accuracy_metrics.mape),
        wape: Math.min(aiResult.accuracy_metrics.wape, statResult.accuracy_metrics.wape)
      },
      summary: {
        total_change: (aiResult.summary.total_change + statResult.summary.total_change) / 2,
        average_daily_change: (aiResult.summary.average_daily_change + statResult.summary.average_daily_change) / 2,
        peak_date: aiResult.summary.peak_date,
        trough_date: aiResult.summary.trough_date,
        volatility_score: Math.min(aiResult.summary.volatility_score, statResult.summary.volatility_score)
      }
    };
  }

  private static calculateEnsembleRisk(aiRisk: string, statRisk: string): 'low' | 'medium' | 'high' {
    const riskLevels = { low: 1, medium: 2, high: 3 };
    const avgRisk = (riskLevels[aiRisk as keyof typeof riskLevels] + riskLevels[statRisk as keyof typeof riskLevels]) / 2;
    
    if (avgRisk <= 1.5) return 'low';
    if (avgRisk <= 2.5) return 'medium';
    return 'high';
  }

  private static calculateTrend(predicted: number, lowerBound: number): 'up' | 'down' | 'stable' {
    const variance = Math.abs(predicted - lowerBound) / predicted;
    if (variance < 0.05) return 'stable';
    return predicted > lowerBound ? 'up' : 'down';
  }

  private static findPeakDate(forecasts: any[]): string {
    let maxValue = -Infinity;
    let peakDate = '';
    forecasts.forEach((f: any) => {
      if (f.predicted_balance > maxValue) {
        maxValue = f.predicted_balance;
        peakDate = f.date;
      }
    });
    return peakDate;
  }

  private static findTroughDate(forecasts: any[]): string {
    let minValue = Infinity;
    let troughDate = '';
    forecasts.forEach((f: any) => {
      if (f.predicted_balance < minValue) {
        minValue = f.predicted_balance;
        troughDate = f.date;
      }
    });
    return troughDate;
  }

  private static calculateVolatility(forecasts: any[]): number {
    if (forecasts.length < 2) return 0;
    
    const values = forecasts.map((f: any) => f.predicted_balance);
    const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }
}