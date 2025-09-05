export interface AIRequest {
  type: 'categorization' | 'forecasting' | 'analysis' | 'query' | 'reasoning';
  data: any;
  priority: 'low' | 'medium' | 'high';
  context?: {
    organizationId: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface AIResponse {
  result: any;
  confidence: number;
  model_used: 'openai' | 'claude' | 'hybrid';
  processing_time: number;
  cost_estimate: number;
  reasoning?: string;
}

export interface UsageMetrics {
  openai_requests: number;
  claude_requests: number;
  total_cost: number;
  avg_response_time: number;
  success_rate: number;
  monthly_limit_reached: boolean;
}

export interface ModelStrategy {
  preferred_model: 'openai' | 'claude';
  fallback_model: 'openai' | 'claude';
  cost_optimization: boolean;
  performance_optimization: boolean;
}

export interface OpenAIConfig {
  apiKey: string;
  models: {
    categorization: 'gpt-4o-mini';
    forecasting: 'gpt-4o';
    analysis: 'gpt-4o';
    reasoning: 'gpt-4o';
  };
  pricing: Record<string, number>;
}

export interface ClaudeConfig {
  apiKey: string;
  models: {
    categorization: 'claude-3-5-sonnet-20241022';
    reasoning: 'claude-3-opus-20240229';
    analysis: 'claude-3-5-sonnet-20241022';
    query: 'claude-3-5-sonnet-20241022';
  };
  pricing: Record<string, number>;
}

class AIRouter {
  private static instance: AIRouter;
  private usageMetrics: UsageMetrics = {
    openai_requests: 0,
    claude_requests: 0,
    total_cost: 0,
    avg_response_time: 0,
    success_rate: 1,
    monthly_limit_reached: false
  };

  private openaiConfig: OpenAIConfig = {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'mock-openai-key',
    models: {
      categorization: 'gpt-4o-mini',
      forecasting: 'gpt-4o',
      analysis: 'gpt-4o',
      reasoning: 'gpt-4o'
    },
    pricing: {
      'gpt-4o-mini': 0.0001,
      'gpt-4o': 0.005
    }
  };

  private claudeConfig: ClaudeConfig = {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || 'mock-claude-key',
    models: {
      categorization: 'claude-3-5-sonnet-20241022',
      reasoning: 'claude-3-opus-20240229',
      analysis: 'claude-3-5-sonnet-20241022',
      query: 'claude-3-5-sonnet-20241022'
    },
    pricing: {
      'claude-3-5-sonnet-20241022': 0.003,
      'claude-3-opus-20240229': 0.015
    }
  };

  private constructor() {
    this.loadUsageMetrics();
  }

  public static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  private loadUsageMetrics(): void {
    try {
      const stored = localStorage.getItem('ai-usage-metrics');
      if (stored) {
        const metrics = JSON.parse(stored);
        // Reset monthly metrics if it's a new month
        const lastReset = new Date(metrics.last_reset || 0);
        const now = new Date();
        if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
          this.resetMonthlyMetrics();
        } else {
          this.usageMetrics = { ...this.usageMetrics, ...metrics };
        }
      }
    } catch (error) {
      console.warn('Failed to load AI usage metrics:', error);
    }
  }

  private saveUsageMetrics(): void {
    try {
      const metricsToSave = {
        ...this.usageMetrics,
        last_reset: new Date().toISOString()
      };
      localStorage.setItem('ai-usage-metrics', JSON.stringify(metricsToSave));
    } catch (error) {
      console.warn('Failed to save AI usage metrics:', error);
    }
  }

  private resetMonthlyMetrics(): void {
    this.usageMetrics = {
      openai_requests: 0,
      claude_requests: 0,
      total_cost: 0,
      avg_response_time: 0,
      success_rate: 1,
      monthly_limit_reached: false
    };
    this.saveUsageMetrics();
  }

  public selectModel(requestType: AIRequest['type'], priority: AIRequest['priority']): 'openai' | 'claude' {
    // Cost optimization routing logic
    if (this.usageMetrics.monthly_limit_reached) {
      return 'claude'; // Fallback to Claude if OpenAI limits reached
    }

    // Model selection based on request type and strengths
    switch (requestType) {
      case 'forecasting':
        // OpenAI excels at numerical analysis and forecasting
        return priority === 'high' ? 'openai' : 'openai';
      
      case 'categorization':
        // Both models are good, use cost-effective approach
        return this.usageMetrics.total_cost > 50 ? 'claude' : 'openai';
      
      case 'reasoning':
        // Claude excels at business logic and complex reasoning
        return 'claude';
      
      case 'analysis':
        // Claude for business context, OpenAI for numerical analysis
        return priority === 'high' ? 'claude' : 'openai';
      
      case 'query':
        // Claude for natural language understanding
        return 'claude';
      
      default:
        return 'claude';
    }
  }

  private async callOpenAI(request: AIRequest): Promise<any> {
    const startTime = Date.now();

    try {
      // Mock OpenAI response (replace with actual OpenAI API call)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      let mockResponse;
      
      switch (request.type) {
        case 'categorization':
          mockResponse = {
            category: 'Office Expenses',
            confidence: 0.89,
            reasoning: 'Transaction description contains office supply keywords'
          };
          break;
        
        case 'forecasting':
          mockResponse = {
            forecast: [1250, 1320, 1180, 1400],
            confidence_interval: { lower: [1100, 1150, 1000, 1200], upper: [1400, 1490, 1360, 1600] },
            model_accuracy: 0.87
          };
          break;
        
        case 'analysis':
          mockResponse = {
            insights: [
              'Monthly expenses increased by 15% compared to last quarter',
              'Office supplies category shows consistent growth trend'
            ],
            metrics: { trend: 'increasing', volatility: 'low' }
          };
          break;
        
        default:
          mockResponse = { status: 'completed', data: request.data };
      }

      const processingTime = Date.now() - startTime;
      this.usageMetrics.openai_requests++;
      this.usageMetrics.total_cost += this.estimateCost('openai', request.type);
      this.saveUsageMetrics();

      return {
        result: mockResponse,
        confidence: 0.85 + Math.random() * 0.15,
        model_used: 'openai',
        processing_time: processingTime,
        cost_estimate: this.estimateCost('openai', request.type)
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private async callClaude(request: AIRequest): Promise<any> {
    const startTime = Date.now();

    try {
      // Mock Claude response (replace with actual Claude API call)
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

      let mockResponse;
      
      switch (request.type) {
        case 'categorization':
          mockResponse = {
            category: 'Professional Services',
            confidence: 0.92,
            reasoning: 'Based on the counterparty name and business context, this appears to be a professional services expense',
            subcategory: 'Consulting'
          };
          break;
        
        case 'reasoning':
          mockResponse = {
            explanation: 'The increase in operational costs is primarily driven by expanded marketing efforts and new software subscriptions',
            recommendations: [
              'Consider consolidating software licenses',
              'Review marketing ROI for budget optimization'
            ],
            confidence: 0.91
          };
          break;
        
        case 'query':
          mockResponse = {
            answer: 'Based on your transaction data, your current cash runway is approximately 8.5 months at the current burn rate',
            data_sources: ['bank_accounts', 'transactions', 'forecast_models'],
            supporting_data: {
              current_balance: 125000,
              monthly_burn_rate: 14700,
              runway_months: 8.5
            }
          };
          break;
        
        default:
          mockResponse = { status: 'completed', data: request.data };
      }

      const processingTime = Date.now() - startTime;
      this.usageMetrics.claude_requests++;
      this.usageMetrics.total_cost += this.estimateCost('claude', request.type);
      this.saveUsageMetrics();

      return {
        result: mockResponse,
        confidence: 0.88 + Math.random() * 0.12,
        model_used: 'claude',
        processing_time: processingTime,
        cost_estimate: this.estimateCost('claude', request.type)
      };

    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  private estimateCost(provider: 'openai' | 'claude', requestType: AIRequest['type']): number {
    // Rough cost estimation based on request complexity
    const baseTokens = 1000; // Estimate
    
    if (provider === 'openai') {
      const model = requestType === 'categorization' ? 'gpt-4o-mini' : 'gpt-4o';
      return baseTokens * this.openaiConfig.pricing[model];
    } else {
      const model = requestType === 'reasoning' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022';
      return baseTokens * this.claudeConfig.pricing[model];
    }
  }

  public async routeRequest(request: AIRequest): Promise<AIResponse> {
    const selectedModel = this.selectModel(request.type, request.priority);
    
    try {
      let response;
      
      if (selectedModel === 'openai') {
        response = await this.callOpenAI(request);
      } else {
        response = await this.callClaude(request);
      }
      
      // Update success rate
      const total = this.usageMetrics.openai_requests + this.usageMetrics.claude_requests;
      this.usageMetrics.success_rate = (this.usageMetrics.success_rate * (total - 1) + 1) / total;
      
      return response;
      
    } catch (error) {
      // Try fallback model
      const fallbackModel = selectedModel === 'openai' ? 'claude' : 'openai';
      console.warn(`${selectedModel} failed, trying ${fallbackModel}:`, error);
      
      try {
        let fallbackResponse;
        
        if (fallbackModel === 'openai') {
          fallbackResponse = await this.callOpenAI(request);
        } else {
          fallbackResponse = await this.callClaude(request);
        }
        
        return {
          ...fallbackResponse,
          model_used: 'hybrid' as const,
          fallback_reason: `${selectedModel} failed`
        };
        
      } catch (fallbackError) {
        console.error('Both AI providers failed:', fallbackError);
        
        // Update failure rate
        const total = this.usageMetrics.openai_requests + this.usageMetrics.claude_requests;
        this.usageMetrics.success_rate = (this.usageMetrics.success_rate * total) / (total + 1);
        
        throw new Error(`All AI providers failed: ${error.message}`);
      }
    }
  }

  public optimizeCosts(currentMetrics?: UsageMetrics): ModelStrategy {
    const metrics = currentMetrics || this.usageMetrics;
    
    const strategy: ModelStrategy = {
      preferred_model: 'claude',
      fallback_model: 'openai',
      cost_optimization: true,
      performance_optimization: false
    };

    // Adjust strategy based on usage and costs
    if (metrics.total_cost > 100) {
      strategy.cost_optimization = true;
      strategy.preferred_model = 'claude'; // Generally more cost-effective
    }

    if (metrics.success_rate < 0.9) {
      strategy.performance_optimization = true;
      strategy.preferred_model = metrics.openai_requests > metrics.claude_requests ? 'openai' : 'claude';
    }

    return strategy;
  }

  public getUsageMetrics(): UsageMetrics {
    return { ...this.usageMetrics };
  }

  public async testConnection(provider: 'openai' | 'claude'): Promise<boolean> {
    try {
      const testRequest: AIRequest = {
        type: 'analysis',
        data: { test: true },
        priority: 'low'
      };

      if (provider === 'openai') {
        await this.callOpenAI(testRequest);
      } else {
        await this.callClaude(testRequest);
      }
      
      return true;
    } catch (error) {
      console.error(`${provider} connection test failed:`, error);
      return false;
    }
  }
}

export const aiRouter = AIRouter.getInstance();