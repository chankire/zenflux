import { MockTransaction } from './mock-data';
import { EconomicDataPoint, ForexRate, EconomicIndicator } from './economic-data';

export interface ForecastModel {
  id: string;
  name: string;
  type: 'lstm' | 'arima' | 'ensemble' | 'linear' | 'exponential';
  status: 'active' | 'training' | 'inactive' | 'error';
  accuracy: number;
  parameters: Record<string, any>;
  created_at: Date;
  last_trained: Date;
  organization_id: string;
}

export interface ForecastConfig {
  organizationId: string;
  accountIds?: string[];
  horizon: number; // days
  confidence: number; // 0.90, 0.95, 0.99
  scenario: 'conservative' | 'moderate' | 'aggressive';
  economicFactors?: EconomicScenario;
  modelType?: 'auto' | 'lstm' | 'arima' | 'ensemble' | 'linear' | 'exponential';
}

export interface EconomicScenario {
  gdpGrowth: number;
  inflationRate: number;
  interestRates: number;
  forexRates: ForexRate[];
  marketVolatility: number;
}

export interface ScenarioImpact {
  revenueMultiplier: number;
  expenseMultiplier: number;
  cashFlowAdjustment: number;
  confidenceAdjustment: number;
}

export interface ForecastResult {
  modelId: string;
  modelType: string;
  organizationId: string;
  forecast: ForecastDataPoint[];
  confidence_interval: {
    lower: number[];
    upper: number[];
  };
  accuracy_metrics: ModelPerformance;
  scenario_impact?: ScenarioImpact;
  generated_at: Date;
  horizon_days: number;
}

export interface ForecastDataPoint {
  date: Date;
  predicted_value: number;
  confidence: number;
  lower_bound: number;
  upper_bound: number;
  factors?: Record<string, number>;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  confidenceScore: number;
  backtestResults: BacktestResult[];
}

export interface BacktestResult {
  period: string;
  predicted: number;
  actual: number;
  error: number;
  error_percentage: number;
}

export interface LSTMModel {
  layers: number;
  neurons_per_layer: number;
  dropout_rate: number;
  learning_rate: number;
  epochs: number;
  sequence_length: number;
}

export interface ARIMAModel {
  p: number; // autoregressive order
  d: number; // degree of differencing
  q: number; // moving average order
  seasonal_p?: number;
  seasonal_d?: number;
  seasonal_q?: number;
  seasonal_period?: number;
}

export interface EnsembleModel {
  models: ForecastModel[];
  weights: number[];
  voting_strategy: 'weighted' | 'majority' | 'stacking';
}

class ForecastingEngine {
  private static instance: ForecastingEngine;
  private models: Map<string, ForecastModel> = new Map();

  private constructor() {
    this.initializeDefaultModels();
  }

  public static getInstance(): ForecastingEngine {
    if (!ForecastingEngine.instance) {
      ForecastingEngine.instance = new ForecastingEngine();
    }
    return ForecastingEngine.instance;
  }

  private initializeDefaultModels(): void {
    const defaultModels: ForecastModel[] = [
      {
        id: 'lstm-revenue-1',
        name: 'LSTM Revenue Forecaster',
        type: 'lstm',
        status: 'active',
        accuracy: 0.87,
        parameters: {
          layers: 3,
          neurons_per_layer: 50,
          dropout_rate: 0.2,
          learning_rate: 0.001,
          epochs: 100,
          sequence_length: 30
        },
        created_at: new Date('2024-01-01'),
        last_trained: new Date('2024-03-01'),
        organization_id: 'org-1'
      },
      {
        id: 'arima-cashflow-1',
        name: 'ARIMA Cash Flow Model',
        type: 'arima',
        status: 'active',
        accuracy: 0.82,
        parameters: {
          p: 2,
          d: 1,
          q: 2,
          seasonal_p: 1,
          seasonal_d: 1,
          seasonal_q: 1,
          seasonal_period: 30
        },
        created_at: new Date('2024-01-15'),
        last_trained: new Date('2024-03-01'),
        organization_id: 'org-1'
      },
      {
        id: 'ensemble-comprehensive-1',
        name: 'Ensemble Financial Predictor',
        type: 'ensemble',
        status: 'active',
        accuracy: 0.91,
        parameters: {
          models: ['lstm-revenue-1', 'arima-cashflow-1'],
          weights: [0.6, 0.4],
          voting_strategy: 'weighted'
        },
        created_at: new Date('2024-02-01'),
        last_trained: new Date('2024-03-01'),
        organization_id: 'org-1'
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  private preprocessTransactionData(transactions: MockTransaction[]): number[] {
    // Group transactions by day and calculate daily net flow
    const dailyFlows = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      const currentFlow = dailyFlows.get(date) || 0;
      dailyFlows.set(date, currentFlow + transaction.amount);
    });

    // Sort by date and return values
    const sortedDates = Array.from(dailyFlows.keys()).sort();
    return sortedDates.map(date => dailyFlows.get(date) || 0);
  }

  private async runLSTMForecast(
    model: ForecastModel,
    data: number[],
    horizon: number,
    config: ForecastConfig
  ): Promise<ForecastDataPoint[]> {
    // Mock LSTM implementation - in production this would interface with TensorFlow.js or similar
    const params = model.parameters as LSTMModel;
    const sequenceLength = params.sequence_length;
    
    if (data.length < sequenceLength) {
      throw new Error('Insufficient data for LSTM forecasting');
    }

    const results: ForecastDataPoint[] = [];
    const baseDate = new Date();
    
    // Simulate LSTM predictions
    for (let i = 0; i < horizon; i++) {
      const lookbackData = data.slice(-sequenceLength);
      
      // Mock neural network prediction with trend and seasonality
      const trend = this.calculateTrend(lookbackData);
      const seasonality = this.calculateSeasonality(i, 30); // 30-day cycle
      const randomness = (Math.random() - 0.5) * 0.1; // 10% random variation
      
      const baseValue = lookbackData[lookbackData.length - 1];
      const prediction = baseValue * (1 + trend + seasonality + randomness);
      
      // Calculate confidence based on model accuracy and prediction horizon
      const confidenceDecay = Math.exp(-i * 0.05); // Confidence decreases with time
      const confidence = model.accuracy * confidenceDecay;
      
      // Calculate bounds based on confidence
      const errorMargin = Math.abs(prediction) * (1 - confidence);
      
      const forecastPoint: ForecastDataPoint = {
        date: new Date(baseDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        predicted_value: prediction,
        confidence: confidence,
        lower_bound: prediction - errorMargin,
        upper_bound: prediction + errorMargin,
        factors: {
          trend: trend,
          seasonality: seasonality,
          randomness: randomness
        }
      };
      
      results.push(forecastPoint);
      data.push(prediction); // Use prediction for next iteration
    }
    
    return results;
  }

  private async runARIMAForecast(
    model: ForecastModel,
    data: number[],
    horizon: number,
    config: ForecastConfig
  ): Promise<ForecastDataPoint[]> {
    // Mock ARIMA implementation
    const params = model.parameters as ARIMAModel;
    const results: ForecastDataPoint[] = [];
    const baseDate = new Date();
    
    // Simulate ARIMA predictions with autoregressive and moving average components
    for (let i = 0; i < horizon; i++) {
      const ar_component = this.calculateAutoregressive(data, params.p, i);
      const ma_component = this.calculateMovingAverage(data, params.q, i);
      const seasonal_component = params.seasonal_p ? this.calculateSeasonality(i, params.seasonal_period || 7) : 0;
      
      const prediction = ar_component + ma_component + seasonal_component;
      const confidence = model.accuracy * Math.exp(-i * 0.03);
      
      const errorMargin = Math.abs(prediction) * (1 - confidence);
      
      const forecastPoint: ForecastDataPoint = {
        date: new Date(baseDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        predicted_value: prediction,
        confidence: confidence,
        lower_bound: prediction - errorMargin,
        upper_bound: prediction + errorMargin,
        factors: {
          autoregressive: ar_component,
          moving_average: ma_component,
          seasonal: seasonal_component
        }
      };
      
      results.push(forecastPoint);
      data.push(prediction);
    }
    
    return results;
  }

  private async runEnsembleForecast(
    model: ForecastModel,
    data: number[],
    horizon: number,
    config: ForecastConfig
  ): Promise<ForecastDataPoint[]> {
    const params = model.parameters as EnsembleModel;
    const subForecasts: ForecastDataPoint[][] = [];
    
    // Get forecasts from each model in the ensemble
    for (let i = 0; i < params.models.length; i++) {
      const subModelId = params.models[i];
      const subModel = this.models.get(subModelId);
      
      if (!subModel) continue;
      
      let subForecast: ForecastDataPoint[];
      
      if (subModel.type === 'lstm') {
        subForecast = await this.runLSTMForecast(subModel, [...data], horizon, config);
      } else if (subModel.type === 'arima') {
        subForecast = await this.runARIMAForecast(subModel, [...data], horizon, config);
      } else {
        continue;
      }
      
      subForecasts.push(subForecast);
    }
    
    // Combine forecasts using weighted voting
    const results: ForecastDataPoint[] = [];
    const baseDate = new Date();
    
    for (let i = 0; i < horizon; i++) {
      let weightedSum = 0;
      let weightedConfidence = 0;
      let weightedLowerBound = 0;
      let weightedUpperBound = 0;
      let totalWeight = 0;
      
      for (let j = 0; j < subForecasts.length; j++) {
        const weight = params.weights[j] || (1 / subForecasts.length);
        const forecast = subForecasts[j][i];
        
        if (!forecast) continue;
        
        weightedSum += forecast.predicted_value * weight;
        weightedConfidence += forecast.confidence * weight;
        weightedLowerBound += forecast.lower_bound * weight;
        weightedUpperBound += forecast.upper_bound * weight;
        totalWeight += weight;
      }
      
      if (totalWeight === 0) continue;
      
      const ensembleForecast: ForecastDataPoint = {
        date: new Date(baseDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        predicted_value: weightedSum / totalWeight,
        confidence: weightedConfidence / totalWeight,
        lower_bound: weightedLowerBound / totalWeight,
        upper_bound: weightedUpperBound / totalWeight
      };
      
      results.push(ensembleForecast);
    }
    
    return results;
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope / (sumY / n); // Normalize by average value
  }

  private calculateSeasonality(period: number, cycle: number): number {
    return 0.05 * Math.sin((2 * Math.PI * period) / cycle);
  }

  private calculateAutoregressive(data: number[], order: number, lag: number): number {
    if (data.length < order) return 0;
    
    let sum = 0;
    for (let i = 1; i <= order; i++) {
      const index = data.length - i;
      if (index >= 0) {
        sum += data[index] * (0.5 / i); // Simple AR coefficients
      }
    }
    return sum;
  }

  private calculateMovingAverage(data: number[], order: number, lag: number): number {
    if (data.length < order) return 0;
    
    let sum = 0;
    for (let i = 0; i < order && i < data.length; i++) {
      sum += data[data.length - 1 - i];
    }
    return (sum / order) * 0.1; // Small MA component
  }

  private applyEconomicScenario(
    forecast: ForecastDataPoint[],
    scenario: EconomicScenario
  ): { forecast: ForecastDataPoint[], impact: ScenarioImpact } {
    const impact: ScenarioImpact = {
      revenueMultiplier: 1 + (scenario.gdpGrowth / 100) * 0.5,
      expenseMultiplier: 1 + (scenario.inflationRate / 100) * 0.3,
      cashFlowAdjustment: scenario.marketVolatility * -0.1,
      confidenceAdjustment: scenario.marketVolatility * -0.05
    };
    
    const adjustedForecast = forecast.map(point => ({
      ...point,
      predicted_value: point.predicted_value * (impact.revenueMultiplier - impact.expenseMultiplier + 1) / 2,
      confidence: Math.max(0.1, point.confidence + impact.confidenceAdjustment),
      lower_bound: point.lower_bound * impact.revenueMultiplier,
      upper_bound: point.upper_bound * impact.revenueMultiplier
    }));
    
    return { forecast: adjustedForecast, impact };
  }

  public async generateForecast(config: ForecastConfig, historicalData: MockTransaction[]): Promise<ForecastResult> {
    const data = this.preprocessTransactionData(historicalData);
    
    // Select best model or use specified model
    let selectedModel: ForecastModel;
    
    if (config.modelType && config.modelType !== 'auto') {
      const models = Array.from(this.models.values()).filter(m => 
        m.type === config.modelType && m.organization_id === config.organizationId
      );
      selectedModel = models[0];
    } else {
      selectedModel = this.selectBestModel(config.organizationId);
    }
    
    if (!selectedModel) {
      throw new Error('No suitable model found for forecasting');
    }
    
    let forecast: ForecastDataPoint[];
    
    // Run the appropriate forecasting algorithm
    switch (selectedModel.type) {
      case 'lstm':
        forecast = await this.runLSTMForecast(selectedModel, data, config.horizon, config);
        break;
      case 'arima':
        forecast = await this.runARIMAForecast(selectedModel, data, config.horizon, config);
        break;
      case 'ensemble':
        forecast = await this.runEnsembleForecast(selectedModel, data, config.horizon, config);
        break;
      default:
        throw new Error(`Model type ${selectedModel.type} not implemented`);
    }
    
    // Apply economic scenario if provided
    let scenarioImpact: ScenarioImpact | undefined;
    if (config.economicFactors) {
      const result = this.applyEconomicScenario(forecast, config.economicFactors);
      forecast = result.forecast;
      scenarioImpact = result.impact;
    }
    
    // Calculate confidence intervals
    const confidenceInterval = this.calculateConfidenceInterval(forecast, config.confidence);
    
    // Generate performance metrics
    const performanceMetrics = await this.evaluateModel(selectedModel, data);
    
    const result: ForecastResult = {
      modelId: selectedModel.id,
      modelType: selectedModel.type,
      organizationId: config.organizationId,
      forecast,
      confidence_interval: confidenceInterval,
      accuracy_metrics: performanceMetrics,
      scenario_impact: scenarioImpact,
      generated_at: new Date(),
      horizon_days: config.horizon
    };
    
    return result;
  }

  private calculateConfidenceInterval(forecast: ForecastDataPoint[], confidence: number) {
    return {
      lower: forecast.map(point => point.lower_bound),
      upper: forecast.map(point => point.upper_bound)
    };
  }

  public selectBestModel(organizationId: string): ForecastModel {
    const organizationModels = Array.from(this.models.values())
      .filter(model => model.organization_id === organizationId && model.status === 'active')
      .sort((a, b) => b.accuracy - a.accuracy);
    
    return organizationModels[0];
  }

  public async evaluateModels(historicalData: MockTransaction[]): Promise<ModelPerformance[]> {
    const performances: ModelPerformance[] = [];
    
    for (const model of this.models.values()) {
      const performance = await this.evaluateModel(model, this.preprocessTransactionData(historicalData));
      performances.push(performance);
    }
    
    return performances;
  }

  private async evaluateModel(model: ForecastModel, data: number[]): Promise<ModelPerformance> {
    // Generate backtest results
    const backtestResults = await this.generateBacktestResults(model, data);
    
    // Calculate metrics from backtest
    const errors = backtestResults.map(result => Math.abs(result.error));
    const meanAbsoluteError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const rootMeanSquareError = Math.sqrt(
      errors.reduce((sum, error) => sum + error * error, 0) / errors.length
    );
    
    const performance: ModelPerformance = {
      accuracy: model.accuracy,
      precision: 0.85, // Mock precision
      recall: 0.82, // Mock recall
      meanAbsoluteError,
      rootMeanSquareError,
      confidenceScore: model.accuracy * 0.9,
      backtestResults
    };
    
    return performance;
  }

  private async generateBacktestResults(model: ForecastModel, data: number[]): Promise<BacktestResult[]> {
    const results: BacktestResult[] = [];
    const testPeriods = 10; // Test last 10 periods
    
    for (let i = testPeriods; i > 0; i--) {
      const trainData = data.slice(0, -i);
      const actualValue = data[data.length - i];
      
      // Make a simple prediction for backtesting
      let predictedValue: number;
      
      if (model.type === 'lstm') {
        predictedValue = this.simpleLSTMPrediction(trainData);
      } else if (model.type === 'arima') {
        predictedValue = this.simpleARIMAPrediction(trainData);
      } else {
        predictedValue = trainData[trainData.length - 1]; // Simple persistence
      }
      
      const error = predictedValue - actualValue;
      const errorPercentage = actualValue !== 0 ? (error / actualValue) * 100 : 0;
      
      results.push({
        period: `T-${i}`,
        predicted: predictedValue,
        actual: actualValue,
        error,
        error_percentage: errorPercentage
      });
    }
    
    return results;
  }

  private simpleLSTMPrediction(data: number[]): number {
    const trend = this.calculateTrend(data);
    const lastValue = data[data.length - 1];
    return lastValue * (1 + trend);
  }

  private simpleARIMAPrediction(data: number[]): number {
    const recentAverage = data.slice(-5).reduce((sum, val) => sum + val, 0) / 5;
    const overallAverage = data.reduce((sum, val) => sum + val, 0) / data.length;
    return (recentAverage * 0.7) + (overallAverage * 0.3);
  }

  public getModels(organizationId: string): ForecastModel[] {
    return Array.from(this.models.values())
      .filter(model => model.organization_id === organizationId);
  }

  public createModel(model: Omit<ForecastModel, 'id' | 'created_at'>): ForecastModel {
    const newModel: ForecastModel = {
      ...model,
      id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date()
    };
    
    this.models.set(newModel.id, newModel);
    return newModel;
  }

  public updateModel(modelId: string, updates: Partial<ForecastModel>): ForecastModel | null {
    const model = this.models.get(modelId);
    if (!model) return null;
    
    const updatedModel = { ...model, ...updates };
    this.models.set(modelId, updatedModel);
    return updatedModel;
  }

  public deleteModel(modelId: string): boolean {
    return this.models.delete(modelId);
  }
}

export const forecastingEngine = ForecastingEngine.getInstance();