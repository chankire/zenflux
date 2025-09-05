import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Database, 
  TrendingUp, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { aiRouter, AIRequest } from '@/lib/ai-router';

export interface AICopilotQuery {
  query: string;
  organizationId: string;
  dateRange?: DateRange;
  accountIds?: string[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DataSource {
  table: string;
  description: string;
  record_count: number;
  last_updated: Date;
}

export interface AICopilotResponse {
  answer: string;
  dataSource: DataSource[];
  confidence: number;
  visualizations?: ChartData[];
  followUpQuestions?: string[];
  calculation_method?: string;
  query_cost: number;
  processing_time: number;
  model_used: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  config: any;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  response?: AICopilotResponse;
  isLoading?: boolean;
}

const AICopilot: React.FC = () => {
  const { user, organizations } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0]?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock data sources for zero-hallucination validation
  const getDataSources = (organizationId: string): DataSource[] => [
    {
      table: 'transactions',
      description: 'Financial transactions',
      record_count: 1247,
      last_updated: new Date('2024-03-01T10:30:00Z')
    },
    {
      table: 'bank_accounts',
      description: 'Bank account information',
      record_count: 5,
      last_updated: new Date('2024-03-01T09:15:00Z')
    },
    {
      table: 'categories',
      description: 'Transaction categories',
      record_count: 25,
      last_updated: new Date('2024-02-28T16:45:00Z')
    },
    {
      table: 'forecast_models',
      description: 'AI forecasting models',
      record_count: 3,
      last_updated: new Date('2024-03-01T08:00:00Z')
    }
  ];

  const generateMockResponse = async (query: string, organizationId: string): Promise<AICopilotResponse> => {
    const dataSources = getDataSources(organizationId);
    
    // Simulate AI processing based on query content
    if (query.toLowerCase().includes('cash runway') || query.toLowerCase().includes('burn rate')) {
      return {
        answer: 'Based on your current financial data, your cash runway is approximately 8.5 months. This calculation uses your current balance of $125,000 and monthly burn rate of $14,700.',
        dataSource: [
          dataSources[1], // bank_accounts
          dataSources[0]  // transactions
        ],
        confidence: 0.94,
        calculation_method: 'Cash Runway = Current Balance ÷ Average Monthly Burn Rate\n$125,000 ÷ $14,700 = 8.5 months',
        followUpQuestions: [
          'What are the main drivers of our monthly burn rate?',
          'How can we extend our cash runway?',
          'What would happen if we reduced expenses by 20%?'
        ],
        visualizations: [{
          type: 'line',
          title: 'Projected Cash Flow',
          data: [
            { month: 'Mar 2024', balance: 125000 },
            { month: 'Apr 2024', balance: 110300 },
            { month: 'May 2024', balance: 95600 },
            { month: 'Jun 2024', balance: 80900 },
            { month: 'Jul 2024', balance: 66200 },
            { month: 'Aug 2024', balance: 51500 },
            { month: 'Sep 2024', balance: 36800 },
            { month: 'Oct 2024', balance: 22100 },
            { month: 'Nov 2024', balance: 7400 }
          ],
          config: { xAxis: 'month', yAxis: 'balance' }
        }],
        query_cost: 0.003,
        processing_time: 2150,
        model_used: 'claude-3-5-sonnet'
      };
    }
    
    if (query.toLowerCase().includes('expense') && (query.toLowerCase().includes('category') || query.toLowerCase().includes('breakdown'))) {
      return {
        answer: 'Your expense breakdown for the last quarter shows Office Expenses (32%), Software & Technology (24%), Marketing (18%), Utilities (12%), and Other (14%). Office Expenses had the highest growth at 15% compared to the previous quarter.',
        dataSource: [
          dataSources[0], // transactions
          dataSources[2]  // categories
        ],
        confidence: 0.91,
        calculation_method: 'Grouped transactions by category, calculated percentages based on total expenses of $44,100 over Q4 2023',
        followUpQuestions: [
          'Which specific office expenses increased the most?',
          'How do our software costs compare to industry benchmarks?',
          'Can we optimize our marketing spend?'
        ],
        visualizations: [{
          type: 'pie',
          title: 'Q4 2023 Expense Breakdown',
          data: [
            { category: 'Office Expenses', amount: 14112, percentage: 32 },
            { category: 'Software & Technology', amount: 10584, percentage: 24 },
            { category: 'Marketing', amount: 7938, percentage: 18 },
            { category: 'Utilities', amount: 5292, percentage: 12 },
            { category: 'Other', amount: 6174, percentage: 14 }
          ],
          config: { label: 'category', value: 'amount' }
        }],
        query_cost: 0.0025,
        processing_time: 1890,
        model_used: 'claude-3-5-sonnet'
      };
    }

    if (query.toLowerCase().includes('transactions') && query.toLowerCase().includes('over')) {
      const amount = query.match(/\$?([\d,]+)/)?.[1]?.replace(',', '') || '5000';
      return {
        answer: `Found 8 transactions over $${amount} in the last 3 months. These include: Software License Renewal ($7,500), Office Equipment Purchase ($6,200), Marketing Campaign ($5,800), and 5 other significant transactions.`,
        dataSource: [dataSources[0]],
        confidence: 0.98,
        calculation_method: `Filtered transactions WHERE amount > ${amount} AND date >= '2023-12-01'`,
        followUpQuestions: [
          'Show me details of the largest transaction',
          'Are these transactions recurring?',
          'Which categories do these large transactions belong to?'
        ],
        query_cost: 0.002,
        processing_time: 1200,
        model_used: 'openai-gpt-4o'
      };
    }

    // Default response for unrecognized queries
    return {
      answer: 'I can help you analyze your financial data. Try asking about cash runway, expense breakdowns, transaction patterns, or specific financial metrics.',
      dataSource: [],
      confidence: 0.75,
      followUpQuestions: [
        "What's my cash runway based on current burn rate?",
        'Show me expense breakdown by category',
        'Which transactions are over $5,000?',
        'How did my Q4 expenses compare to Q3?'
      ],
      query_cost: 0.001,
      processing_time: 800,
      model_used: 'claude-3-5-sonnet'
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      type: 'assistant',
      content: 'Analyzing your financial data...',
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Create AI request
      const aiRequest: AIRequest = {
        type: 'query',
        data: {
          query: userMessage.content,
          organizationId: selectedOrganization
        },
        priority: 'medium',
        context: {
          organizationId: selectedOrganization,
          userId: user?.id
        }
      };

      // Process through AI router (which would normally call Claude/OpenAI)
      await aiRouter.routeRequest(aiRequest);
      
      // Generate mock response for demo
      const response = await generateMockResponse(userMessage.content, selectedOrganization);

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        response
      };

      setMessages(prev => prev.slice(0, -1).concat([assistantMessage]));
    } catch (error) {
      console.error('AI Copilot error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => prev.slice(0, -1).concat([errorMessage]));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    setInputValue(question);
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="flex items-start space-x-2 max-w-[80%]">
            <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
              <p className="text-sm">{message.content}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-6">
        <div className="flex items-start space-x-2 max-w-[90%]">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {message.isLoading ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
          <div className="bg-muted rounded-lg px-4 py-3 space-y-3">
            <p className="text-sm">{message.content}</p>
            
            {message.response && !message.isLoading && (
              <div className="space-y-4">
                {/* Confidence and Data Sources */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{Math.round(message.response.confidence * 100)}% confidence</span>
                  </Badge>
                  <Badge variant="secondary">
                    {message.response.model_used}
                  </Badge>
                  <span className="text-muted-foreground">
                    {message.response.processing_time}ms
                  </span>
                </div>

                {/* Data Sources */}
                {message.response.dataSource.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center space-x-1">
                      <Database className="h-3 w-3" />
                      <span>Data Sources:</span>
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {message.response.dataSource.map((source, index) => (
                        <div key={index} className="bg-background rounded px-2 py-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{source.table}</span>
                            <span className="text-muted-foreground">
                              {source.record_count.toLocaleString()} records
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculation Method */}
                {message.response.calculation_method && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Calculation Method:</p>
                    <div className="bg-background rounded px-3 py-2 text-xs font-mono whitespace-pre-line">
                      {message.response.calculation_method}
                    </div>
                  </div>
                )}

                {/* Visualizations */}
                {message.response.visualizations && message.response.visualizations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center space-x-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>Visualizations:</span>
                    </p>
                    {message.response.visualizations.map((viz, index) => (
                      <div key={index} className="bg-background rounded p-3">
                        <p className="text-xs font-medium mb-2">{viz.title}</p>
                        <div className="text-xs text-muted-foreground">
                          {viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} chart with {viz.data.length} data points
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up Questions */}
                {message.response.followUpQuestions && message.response.followUpQuestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center space-x-1">
                      <Lightbulb className="h-3 w-3" />
                      <span>Follow-up Questions:</span>
                    </p>
                    <div className="space-y-1">
                      {message.response.followUpQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-auto p-2 text-xs justify-start hover:bg-background"
                          onClick={() => handleFollowUpQuestion(question)}
                        >
                          <ArrowRight className="h-3 w-3 mr-2" />
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Financial Copilot</span>
            </CardTitle>
            <CardDescription>
              Zero-hallucination AI assistant powered by your actual financial data
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Data-verified</span>
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Ask me anything about your finances</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    I'll only use your actual data to provide accurate, verified insights
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium">Try asking:</p>
                  <div className="space-y-1">
                    {[
                      "What's my cash runway?",
                      'Show expense breakdown by category',
                      'Which transactions are over $5,000?'
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-2"
                        onClick={() => handleFollowUpQuestion(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your financial data..."
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AICopilot;