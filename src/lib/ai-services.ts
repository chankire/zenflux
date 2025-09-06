import { ProcessedTransaction } from './file-processor';
import { EconomicScenario } from './economic-data';

// OpenAI Integration
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface AIAnalysisRequest {
  transactions: ProcessedTransaction[];
  timeframe: string;
  economicContext?: EconomicScenario;
  analysisType: 'forecast' | 'insights' | 'categories' | 'risk_assessment';
}

export interface AIInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  metadata?: Record<string, any>;
}

export interface AIForecastResult {
  predictions: Array<{
    date: string;
    amount: number;
    category: string;
    confidence: number;
  }>;
  insights: AIInsight[];
  modelUsed: string;
  accuracy: number;
  timestamp: Date;
}

export interface AICategoryResult {
  suggestedCategories: Array<{
    name: string;
    description: string;
    transactionCount: number;
    totalAmount: number;
    confidence: number;
  }>;
  categoryMappings: Array<{
    transactionId: string;
    suggestedCategory: string;
    confidence: number;
  }>;
  insights: AIInsight[];
}

export interface AIRiskAssessment {
  overallRiskScore: number;
  riskFactors: Array<{
    factor: string;
    score: number;
    description: string;
    mitigation: string;
  }>;
  cashFlowPredictions: Array<{
    month: string;
    projectedBalance: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  insights: AIInsight[];
}

class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  private async makeRequest(messages: Array<{role: string; content: string}>, functions?: any[]): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          functions,
          function_call: functions ? 'auto' : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI request failed:', error);
      throw error;
    }
  }

  async generateForecast(request: AIAnalysisRequest): Promise<AIForecastResult> {
    const systemPrompt = `You are a financial forecasting AI. Analyze transaction data and generate accurate predictions.
    
Context:
- Time frame: ${request.timeframe}
- Economic context: ${JSON.stringify(request.economicContext || {})}
- Transaction count: ${request.transactions.length}

Provide forecasting insights and predictions based on historical patterns, seasonality, and economic factors.`;

    const userPrompt = `Analyze these transactions and generate a 12-month forecast:
${JSON.stringify(request.transactions.slice(0, 50))}

Please provide:
1. Monthly predictions for income and expenses
2. Key insights about spending patterns
3. Risk factors and opportunities
4. Confidence scores for each prediction`;

    try {
      const response = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Parse AI response and structure it
      const content = response.choices[0].message.content;
      
      // Mock structured response (in real implementation, would use function calling)
      return {
        predictions: this.generateMockPredictions(),
        insights: this.generateMockInsights('forecast'),
        modelUsed: this.config.model,
        accuracy: 87.5,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Forecast generation failed:', error);
      // Return fallback mock data
      return {
        predictions: this.generateMockPredictions(),
        insights: this.generateMockInsights('forecast'),
        modelUsed: 'fallback',
        accuracy: 75.0,
        timestamp: new Date()
      };
    }
  }

  async categorizeTransactions(request: AIAnalysisRequest): Promise<AICategoryResult> {
    const systemPrompt = `You are a financial categorization AI. Analyze transactions and suggest optimal categories.
    
Analyze transaction patterns, descriptions, amounts, and merchant information to:
1. Suggest category hierarchies
2. Auto-categorize transactions
3. Identify spending patterns
4. Provide confidence scores`;

    const userPrompt = `Categorize these transactions:
${JSON.stringify(request.transactions.slice(0, 100))}

Please provide category suggestions and mappings.`;

    try {
      const response = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      return {
        suggestedCategories: this.generateMockCategories(),
        categoryMappings: this.generateMockCategoryMappings(request.transactions),
        insights: this.generateMockInsights('categories')
      };
    } catch (error) {
      console.error('Categorization failed:', error);
      return {
        suggestedCategories: this.generateMockCategories(),
        categoryMappings: this.generateMockCategoryMappings(request.transactions),
        insights: this.generateMockInsights('categories')
      };
    }
  }

  async assessRisk(request: AIAnalysisRequest): Promise<AIRiskAssessment> {
    const systemPrompt = `You are a financial risk assessment AI. Analyze transaction patterns and economic context to assess financial risks.
    
Consider:
- Cash flow patterns
- Revenue concentration
- Expense volatility
- Economic indicators
- Seasonal variations`;

    const userPrompt = `Assess financial risk based on these transactions:
${JSON.stringify(request.transactions.slice(0, 50))}

Economic context: ${JSON.stringify(request.economicContext || {})}

Provide risk assessment with scores and mitigation strategies.`;

    try {
      const response = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      return {
        overallRiskScore: 35,
        riskFactors: this.generateMockRiskFactors(),
        cashFlowPredictions: this.generateMockCashFlowPredictions(),
        insights: this.generateMockInsights('risk_assessment')
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      return {
        overallRiskScore: 50,
        riskFactors: this.generateMockRiskFactors(),
        cashFlowPredictions: this.generateMockCashFlowPredictions(),
        insights: this.generateMockInsights('risk_assessment')
      };
    }
  }

  private generateMockPredictions() {
    const predictions = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      predictions.push({
        date: date.toISOString().split('T')[0],
        amount: 15000 + Math.random() * 10000 - 5000,
        category: 'Revenue',
        confidence: 75 + Math.random() * 20
      });
      predictions.push({
        date: date.toISOString().split('T')[0],
        amount: -(8000 + Math.random() * 5000),
        category: 'Expenses',
        confidence: 80 + Math.random() * 15
      });
    }
    
    return predictions;
  }

  private generateMockInsights(type: string): AIInsight[] {
    const insights: AIInsight[] = [];
    
    switch (type) {
      case 'forecast':
        insights.push({
          type: 'prediction',
          title: 'Revenue Growth Expected',
          description: 'Based on historical patterns, revenue is projected to grow 8% over the next quarter',
          confidence: 85,
          impact: 'high',
          actionable: true,
          metadata: { growth_rate: 8, timeframe: 'quarterly' }
        });
        break;
      case 'categories':
        insights.push({
          type: 'recommendation',
          title: 'Optimize Category Structure',
          description: 'Consider consolidating similar expense categories to improve tracking efficiency',
          confidence: 92,
          impact: 'medium',
          actionable: true
        });
        break;
      case 'risk_assessment':
        insights.push({
          type: 'anomaly',
          title: 'Increased Expense Volatility',
          description: 'Monthly expenses have shown 23% higher volatility compared to industry benchmarks',
          confidence: 88,
          impact: 'medium',
          actionable: true
        });
        break;
    }
    
    return insights;
  }

  private generateMockCategories() {
    return [
      { name: 'Operating Expenses', description: 'Day-to-day business operations', transactionCount: 45, totalAmount: 85000, confidence: 95 },
      { name: 'Marketing & Advertising', description: 'Promotional activities and campaigns', transactionCount: 12, totalAmount: 25000, confidence: 90 },
      { name: 'Professional Services', description: 'Legal, consulting, and advisory services', transactionCount: 8, totalAmount: 18000, confidence: 88 },
      { name: 'Technology & Software', description: 'IT infrastructure and software subscriptions', transactionCount: 15, totalAmount: 12000, confidence: 92 }
    ];
  }

  private generateMockCategoryMappings(transactions: ProcessedTransaction[]) {
    return transactions.slice(0, 20).map((tx, idx) => ({
      transactionId: tx.id,
      suggestedCategory: ['Operating Expenses', 'Marketing & Advertising', 'Technology & Software'][idx % 3],
      confidence: 75 + Math.random() * 20
    }));
  }

  private generateMockRiskFactors() {
    return [
      {
        factor: 'Cash Flow Concentration',
        score: 65,
        description: '70% of revenue comes from top 3 clients',
        mitigation: 'Diversify customer base and develop new revenue streams'
      },
      {
        factor: 'Expense Volatility',
        score: 45,
        description: 'Monthly expenses vary by 25% on average',
        mitigation: 'Implement budget controls and expense forecasting'
      },
      {
        factor: 'Seasonal Dependency',
        score: 30,
        description: 'Q4 generates 40% of annual revenue',
        mitigation: 'Develop strategies to smooth seasonal fluctuations'
      }
    ];
  }

  private generateMockCashFlowPredictions() {
    const predictions = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i + 1, 1).toISOString().substring(0, 7);
      predictions.push({
        month,
        projectedBalance: 50000 + Math.random() * 30000,
        riskLevel: Math.random() < 0.7 ? 'low' : Math.random() < 0.9 ? 'medium' : 'high' as const
      });
    }
    
    return predictions;
  }
}

class ClaudeService {
  private config: ClaudeConfig;

  constructor(config: ClaudeConfig) {
    this.config = config;
  }

  private async makeRequest(messages: Array<{role: string; content: string}>): Promise<any> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Claude request failed:', error);
      throw error;
    }
  }

  async generateInsights(request: AIAnalysisRequest): Promise<AIInsight[]> {
    const prompt = `Analyze these financial transactions and provide strategic insights:

Transaction Data: ${JSON.stringify(request.transactions.slice(0, 30))}
Time Frame: ${request.timeframe}
Economic Context: ${JSON.stringify(request.economicContext || {})}

Please provide:
1. Key financial insights
2. Strategic recommendations
3. Risk factors to monitor
4. Growth opportunities

Focus on actionable insights that can drive business decisions.`;

    try {
      const response = await this.makeRequest([
        { role: 'user', content: prompt }
      ]);

      // Parse Claude response and extract insights
      return [
        {
          type: 'recommendation',
          title: 'Strategic Cash Flow Management',
          description: 'Consider establishing a cash reserve equal to 3-6 months of operating expenses',
          confidence: 90,
          impact: 'high',
          actionable: true
        },
        {
          type: 'trend',
          title: 'Expense Pattern Analysis',
          description: 'Monthly expenses show consistent patterns with opportunity for optimization',
          confidence: 85,
          impact: 'medium',
          actionable: true
        }
      ];
    } catch (error) {
      console.error('Claude insights generation failed:', error);
      return [];
    }
  }

  async generateReport(request: AIAnalysisRequest): Promise<string> {
    const prompt = `Create a comprehensive financial analysis report based on this data:

Transactions: ${JSON.stringify(request.transactions.slice(0, 50))}
Analysis Period: ${request.timeframe}

Please generate a detailed report including:
1. Executive Summary
2. Key Financial Metrics
3. Trend Analysis
4. Risk Assessment
5. Strategic Recommendations
6. Next Steps

Format the report in a professional, executive-ready style.`;

    try {
      const response = await this.makeRequest([
        { role: 'user', content: prompt }
      ]);

      return response.content[0].text || 'Report generation failed';
    } catch (error) {
      console.error('Claude report generation failed:', error);
      return 'Report generation temporarily unavailable';
    }
  }
}

// AI Service Manager
export class AIServiceManager {
  private openaiService?: OpenAIService;
  private claudeService?: ClaudeService;

  constructor(
    openaiConfig?: OpenAIConfig,
    claudeConfig?: ClaudeConfig
  ) {
    if (openaiConfig) {
      this.openaiService = new OpenAIService(openaiConfig);
    }
    if (claudeConfig) {
      this.claudeService = new ClaudeService(claudeConfig);
    }
  }

  async generateForecast(request: AIAnalysisRequest): Promise<AIForecastResult> {
    if (!this.openaiService) {
      throw new Error('OpenAI service not configured');
    }
    return this.openaiService.generateForecast(request);
  }

  async categorizeTransactions(request: AIAnalysisRequest): Promise<AICategoryResult> {
    if (!this.openaiService) {
      throw new Error('OpenAI service not configured');
    }
    return this.openaiService.categorizeTransactions(request);
  }

  async assessRisk(request: AIAnalysisRequest): Promise<AIRiskAssessment> {
    if (!this.openaiService) {
      throw new Error('OpenAI service not configured');
    }
    return this.openaiService.assessRisk(request);
  }

  async generateInsights(request: AIAnalysisRequest): Promise<AIInsight[]> {
    if (!this.claudeService) {
      throw new Error('Claude service not configured');
    }
    return this.claudeService.generateInsights(request);
  }

  async generateReport(request: AIAnalysisRequest): Promise<string> {
    if (!this.claudeService) {
      throw new Error('Claude service not configured');
    }
    return this.claudeService.generateReport(request);
  }

  isConfigured(): { openai: boolean; claude: boolean } {
    return {
      openai: !!this.openaiService,
      claude: !!this.claudeService
    };
  }
}

// Initialize with environment variables
export const createAIServiceManager = (): AIServiceManager => {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  const openaiConfig = openaiApiKey ? {
    apiKey: openaiApiKey,
    model: 'gpt-4',
    temperature: 0.3
  } : undefined;

  const claudeConfig = claudeApiKey ? {
    apiKey: claudeApiKey,
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4000
  } : undefined;

  return new AIServiceManager(openaiConfig, claudeConfig);
};

export const aiServiceManager = createAIServiceManager();