import { MockTransaction, MockBankAccount } from './mock-data';
import { Category, CategorySuggestion } from '../components/CategoryManager';
import { aiRouter, AIRequest } from './ai-router';
import { refreshManager } from './refresh-manager';

export interface FinancialAgent {
  // Autonomous categorization
  categorizePendingTransactions(organizationId: string): Promise<CategorizationResult[]>;
  
  // Anomaly detection
  detectAnomalies(transactions: MockTransaction[]): Promise<Anomaly[]>;
  
  // Self-improving forecasts
  evaluateAndImproveForecasts(organizationId: string): Promise<ModelUpdate>;
  
  // Automated insights
  generateInsights(organizationId: string): Promise<FinancialInsight[]>;
  
  // Risk monitoring
  monitorCashFlow(organizationId: string): Promise<RiskAlert[]>;
  
  // Learning system
  recordUserFeedback(feedback: CategoryFeedback): Promise<void>;
  improveModel(feedbackData: CategoryFeedback[]): Promise<ModelUpdate>;
}

export interface CategorizationResult {
  transactionId: string;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
  autoApplied: boolean;
}

export interface Anomaly {
  id: string;
  transactionId: string;
  type: 'amount_outlier' | 'frequency_change' | 'new_counterparty' | 'category_mismatch' | 'suspicious_timing' | 'duplicate_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  suggestedAction: string;
  confidence: number;
  detectedAt: Date;
  resolved: boolean;
}

export interface ModelUpdate {
  modelId: string;
  version: string;
  improvements: string[];
  accuracyBefore: number;
  accuracyAfter: number;
  updatedAt: Date;
}

export interface FinancialInsight {
  id: string;
  type: 'spending_pattern' | 'cash_flow_trend' | 'budget_variance' | 'seasonal_pattern' | 'cost_optimization';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  data: any;
  generatedAt: Date;
}

export interface RiskAlert {
  id: string;
  type: 'cash_flow_risk' | 'budget_overrun' | 'unusual_spending' | 'payment_delay' | 'fraud_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedAccounts: string[];
  estimatedImpact: number;
  mitigationSteps: string[];
  deadline?: Date;
  createdAt: Date;
}

export interface CategoryFeedback {
  transactionId: string;
  suggestedCategory: string;
  actualCategory: string;
  userAction: 'accepted' | 'rejected' | 'modified';
  confidence: number;
  timestamp: Date;
}

export interface ModelPerformanceTracker {
  trackPredictionAccuracy(modelId: string, prediction: any, actual: any): void;
  calculateModelMetrics(modelId: string, timeframe: DateRange): ModelMetrics;
  recommendModelAdjustments(performance: ModelMetrics): ModelAdjustment[];
  autoTuneHyperparameters(modelId: string): Promise<OptimizationResult>;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  confidenceScore: number;
  learningRate: number;
}

export interface ModelAdjustment {
  parameter: string;
  currentValue: any;
  recommendedValue: any;
  expectedImprovement: number;
  reasoning: string;
}

export interface OptimizationResult {
  modelId: string;
  optimizationType: 'hyperparameter_tuning' | 'feature_selection' | 'architecture_adjustment';
  improvements: ModelAdjustment[];
  expectedAccuracyGain: number;
  trainingTimeEstimate: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

class AutonomousFinancialAgent implements FinancialAgent {
  private static instance: AutonomousFinancialAgent;
  private feedbackHistory: CategoryFeedback[] = [];
  private anomalyHistory: Anomaly[] = [];
  private insightHistory: FinancialInsight[] = [];
  private riskAlerts: RiskAlert[] = [];
  private modelPerformance: Map<string, ModelMetrics> = new Map();

  private constructor() {
    this.loadStoredData();
    this.startAutonomousOperations();
  }

  public static getInstance(): AutonomousFinancialAgent {
    if (!AutonomousFinancialAgent.instance) {
      AutonomousFinancialAgent.instance = new AutonomousFinancialAgent();
    }
    return AutonomousFinancialAgent.instance;
  }

  private loadStoredData(): void {
    try {
      const storedFeedback = localStorage.getItem('agent-feedback-history');
      if (storedFeedback) {
        this.feedbackHistory = JSON.parse(storedFeedback);
      }

      const storedAnomalies = localStorage.getItem('agent-anomalies');
      if (storedAnomalies) {
        this.anomalyHistory = JSON.parse(storedAnomalies);
      }
    } catch (error) {
      console.warn('Failed to load agent data:', error);
    }
  }

  private saveStoredData(): void {
    try {
      localStorage.setItem('agent-feedback-history', JSON.stringify(this.feedbackHistory));
      localStorage.setItem('agent-anomalies', JSON.stringify(this.anomalyHistory));
    } catch (error) {
      console.warn('Failed to save agent data:', error);
    }
  }

  private startAutonomousOperations(): void {
    // Run autonomous operations every 5 minutes
    setInterval(() => {
      this.runAutonomousCheck();
    }, 5 * 60 * 1000);

    // Run deep analysis every hour
    setInterval(() => {
      this.runDeepAnalysis();
    }, 60 * 60 * 1000);
  }

  private async runAutonomousCheck(): Promise<void> {
    try {
      // Check for new transactions to categorize
      // Check for anomalies
      // Update risk alerts
      console.log('Running autonomous financial agent check...');
    } catch (error) {
      console.error('Autonomous check failed:', error);
    }
  }

  private async runDeepAnalysis(): Promise<void> {
    try {
      // Deep pattern analysis
      // Model performance evaluation
      // Generate insights
      console.log('Running deep financial analysis...');
    } catch (error) {
      console.error('Deep analysis failed:', error);
    }
  }

  public async categorizePendingTransactions(organizationId: string): Promise<CategorizationResult[]> {
    const results: CategorizationResult[] = [];
    
    // Mock pending transactions
    const pendingTransactions = [
      { id: 'txn-1', description: 'Microsoft Office License', counterparty: 'Microsoft Corp', amount: -299.99 },
      { id: 'txn-2', description: 'Office Coffee Supplies', counterparty: 'Coffee Plus Inc', amount: -125.50 },
      { id: 'txn-3', description: 'Google Ads Campaign', counterparty: 'Google LLC', amount: -850.00 }
    ];

    for (const transaction of pendingTransactions) {
      try {
        const aiRequest: AIRequest = {
          type: 'categorization',
          data: transaction,
          priority: 'medium',
          context: { organizationId }
        };

        const response = await aiRouter.routeRequest(aiRequest);
        const suggestion = response.result;

        const result: CategorizationResult = {
          transactionId: transaction.id,
          suggestedCategory: suggestion.category,
          confidence: suggestion.confidence,
          reasoning: suggestion.reasoning,
          autoApplied: suggestion.confidence > 0.85 // Auto-apply if confidence > 85%
        };

        results.push(result);

      } catch (error) {
        console.error(`Failed to categorize transaction ${transaction.id}:`, error);
      }
    }

    return results;
  }

  public async detectAnomalies(transactions: MockTransaction[]): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Amount outlier detection
    const amounts = transactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + (3 * stdDev); // 3-sigma rule

    transactions.forEach(transaction => {
      if (Math.abs(transaction.amount) > threshold) {
        anomalies.push({
          id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          transactionId: transaction.id,
          type: 'amount_outlier',
          severity: Math.abs(transaction.amount) > threshold * 2 ? 'critical' : 'high',
          explanation: `Transaction amount $${Math.abs(transaction.amount).toLocaleString()} is ${((Math.abs(transaction.amount) / mean) * 100 - 100).toFixed(0)}% above average`,
          suggestedAction: 'Verify transaction authenticity and business justification',
          confidence: 0.92,
          detectedAt: new Date(),
          resolved: false
        });
      }
    });

    // Duplicate detection
    const transactionMap = new Map<string, MockTransaction[]>();
    transactions.forEach(t => {
      const key = `${t.counterparty}-${Math.abs(t.amount)}-${t.date}`;
      if (!transactionMap.has(key)) {
        transactionMap.set(key, []);
      }
      transactionMap.get(key)!.push(t);
    });

    transactionMap.forEach((duplicates, key) => {
      if (duplicates.length > 1) {
        duplicates.forEach((transaction, index) => {
          if (index > 0) { // Mark all but the first as potential duplicates
            anomalies.push({
              id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              transactionId: transaction.id,
              type: 'duplicate_detection',
              severity: 'medium',
              explanation: `Potential duplicate transaction: same counterparty, amount, and date`,
              suggestedAction: 'Review for duplicate payment and consider reversal if confirmed',
              confidence: 0.75,
              detectedAt: new Date(),
              resolved: false
            });
          }
        });
      }
    });

    // Frequency change detection
    const monthlySpending = new Map<string, number>();
    transactions.forEach(t => {
      if (t.amount < 0) { // Only expenses
        const monthKey = t.date.substring(0, 7); // YYYY-MM
        monthlySpending.set(monthKey, (monthlySpending.get(monthKey) || 0) + Math.abs(t.amount));
      }
    });

    const monthlyAmounts = Array.from(monthlySpending.values());
    if (monthlyAmounts.length > 1) {
      const recentMonth = monthlyAmounts[monthlyAmounts.length - 1];
      const previousMonth = monthlyAmounts[monthlyAmounts.length - 2];
      const changePercent = ((recentMonth - previousMonth) / previousMonth) * 100;

      if (Math.abs(changePercent) > 30) { // 30% change threshold
        anomalies.push({
          id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          transactionId: `monthly-analysis-${Date.now()}`,
          type: 'frequency_change',
          severity: Math.abs(changePercent) > 50 ? 'high' : 'medium',
          explanation: `Monthly spending ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}%`,
          suggestedAction: 'Review budget allocations and spending patterns',
          confidence: 0.88,
          detectedAt: new Date(),
          resolved: false
        });
      }
    }

    // Update anomaly history
    this.anomalyHistory.push(...anomalies);
    this.saveStoredData();

    return anomalies;
  }

  public async evaluateAndImproveForecasts(organizationId: string): Promise<ModelUpdate> {
    try {
      const aiRequest: AIRequest = {
        type: 'analysis',
        data: { organizationId, type: 'forecast_evaluation' },
        priority: 'low',
        context: { organizationId }
      };

      await aiRouter.routeRequest(aiRequest);

      const update: ModelUpdate = {
        modelId: 'ensemble-comprehensive-1',
        version: '1.2.0',
        improvements: [
          'Enhanced seasonal pattern recognition',
          'Improved outlier handling in LSTM model',
          'Optimized ensemble weights based on recent performance'
        ],
        accuracyBefore: 0.91,
        accuracyAfter: 0.94,
        updatedAt: new Date()
      };

      return update;

    } catch (error) {
      console.error('Forecast evaluation failed:', error);
      throw error;
    }
  }

  public async generateInsights(organizationId: string): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Mock insight generation
    const mockInsights = [
      {
        type: 'spending_pattern' as const,
        title: 'Increasing Software Costs',
        description: 'Software and subscription expenses have increased 23% over the last quarter, primarily driven by new SaaS tools.',
        impact: 'negative' as const,
        urgency: 'medium' as const,
        recommendations: [
          'Conduct software audit to identify unused licenses',
          'Negotiate annual contracts for frequently used tools',
          'Consider consolidating tools with similar functionality'
        ]
      },
      {
        type: 'cash_flow_trend' as const,
        title: 'Improved Cash Flow Velocity',
        description: 'Payment collection has improved by 15% with average days outstanding reduced from 45 to 38 days.',
        impact: 'positive' as const,
        urgency: 'low' as const,
        recommendations: [
          'Continue current collection practices',
          'Implement early payment incentives',
          'Monitor for seasonal variations'
        ]
      },
      {
        type: 'cost_optimization' as const,
        title: 'Office Expense Optimization Opportunity',
        description: 'Office supply spending shows potential for 12% reduction through bulk purchasing and vendor consolidation.',
        impact: 'positive' as const,
        urgency: 'medium' as const,
        recommendations: [
          'Negotiate bulk pricing agreements',
          'Standardize office supply vendors',
          'Implement quarterly ordering schedule'
        ]
      }
    ];

    mockInsights.forEach((mockInsight, index) => {
      const insight: FinancialInsight = {
        id: `insight-${Date.now()}-${index}`,
        ...mockInsight,
        data: {
          metrics: {
            currentValue: Math.random() * 10000,
            targetValue: Math.random() * 10000,
            timeframe: '90 days'
          }
        },
        generatedAt: new Date()
      };
      insights.push(insight);
    });

    this.insightHistory.push(...insights);
    return insights;
  }

  public async monitorCashFlow(organizationId: string): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];

    // Mock risk monitoring
    const mockAlerts = [
      {
        type: 'cash_flow_risk' as const,
        severity: 'medium' as const,
        title: 'Approaching Low Cash Balance',
        description: 'Current cash runway is 8.5 months. Consider securing additional funding or reducing expenses.',
        affectedAccounts: ['Business Checking', 'Operating Account'],
        estimatedImpact: -25000,
        mitigationSteps: [
          'Review and delay non-essential expenses',
          'Accelerate accounts receivable collection',
          'Explore line of credit options'
        ],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      },
      {
        type: 'unusual_spending' as const,
        severity: 'high' as const,
        title: 'Unusual Marketing Spend Pattern',
        description: 'Marketing expenses are 45% above budget for this month with significant variance from historical patterns.',
        affectedAccounts: ['Business Checking'],
        estimatedImpact: -8500,
        mitigationSteps: [
          'Review marketing campaign effectiveness',
          'Audit marketing vendor invoices',
          'Implement spending approval workflow'
        ]
      }
    ];

    mockAlerts.forEach((mockAlert, index) => {
      const alert: RiskAlert = {
        id: `alert-${Date.now()}-${index}`,
        ...mockAlert,
        createdAt: new Date()
      };
      alerts.push(alert);
    });

    this.riskAlerts.push(...alerts);
    return alerts;
  }

  public async recordUserFeedback(feedback: CategoryFeedback): Promise<void> {
    this.feedbackHistory.push(feedback);
    this.saveStoredData();

    // If we have enough feedback, trigger model improvement
    if (this.feedbackHistory.length % 50 === 0) { // Every 50 feedback items
      await this.improveModel(this.feedbackHistory.slice(-100)); // Use last 100 feedback items
    }
  }

  public async improveModel(feedbackData: CategoryFeedback[]): Promise<ModelUpdate> {
    try {
      // Analyze feedback patterns
      const accuracyRate = feedbackData.filter(f => f.userAction === 'accepted').length / feedbackData.length;
      
      const aiRequest: AIRequest = {
        type: 'analysis',
        data: { 
          feedback: feedbackData,
          currentAccuracy: accuracyRate,
          type: 'model_improvement'
        },
        priority: 'low'
      };

      await aiRouter.routeRequest(aiRequest);

      const update: ModelUpdate = {
        modelId: 'categorization-model-v1',
        version: `1.${Math.floor(Date.now() / 1000)}`,
        improvements: [
          `Incorporated ${feedbackData.length} user feedback samples`,
          'Adjusted confidence thresholds based on user corrections',
          'Enhanced pattern recognition for frequently corrected categories'
        ],
        accuracyBefore: accuracyRate,
        accuracyAfter: Math.min(1.0, accuracyRate + 0.02), // Mock 2% improvement
        updatedAt: new Date()
      };

      console.log('Model updated:', update);
      return update;

    } catch (error) {
      console.error('Model improvement failed:', error);
      throw error;
    }
  }

  // Getters for stored data
  public getAnomalies(resolved: boolean = false): Anomaly[] {
    return this.anomalyHistory.filter(a => a.resolved === resolved);
  }

  public getInsights(limit: number = 10): FinancialInsight[] {
    return this.insightHistory.slice(-limit);
  }

  public getRiskAlerts(severity?: 'low' | 'medium' | 'high' | 'critical'): RiskAlert[] {
    if (severity) {
      return this.riskAlerts.filter(alert => alert.severity === severity);
    }
    return this.riskAlerts;
  }

  public getFeedbackHistory(): CategoryFeedback[] {
    return this.feedbackHistory;
  }

  public getModelPerformance(modelId: string): ModelMetrics | null {
    return this.modelPerformance.get(modelId) || null;
  }

  // Resolve anomaly
  public resolveAnomaly(anomalyId: string): void {
    const anomaly = this.anomalyHistory.find(a => a.id === anomalyId);
    if (anomaly) {
      anomaly.resolved = true;
      this.saveStoredData();
    }
  }

  // Dismiss risk alert
  public dismissRiskAlert(alertId: string): void {
    const index = this.riskAlerts.findIndex(alert => alert.id === alertId);
    if (index !== -1) {
      this.riskAlerts.splice(index, 1);
    }
  }
}

export const financialAgent = AutonomousFinancialAgent.getInstance();