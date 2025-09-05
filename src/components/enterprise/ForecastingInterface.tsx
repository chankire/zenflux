import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from './LoadingSpinner';
import { Brain, TrendingUp, BarChart3, Activity, Zap, Sparkles, LineChart, Target, Settings, AlertTriangle } from 'lucide-react';
import { forecastingEngine, ForecastConfig, ForecastResult, ForecastModel } from '@/lib/forecasting-engine';
import { useAuth } from '@/lib/auth';
import { generateMockTransactions, generateMockBankAccounts } from '@/lib/mock-data';
import { economicDataManager, EconomicScenario } from '@/lib/economic-data';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const forecastModels = [
  {
    type: 'lstm',
    name: 'LSTM Neural Network',
    description: 'Deep learning model for complex pattern recognition in financial time series',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    accuracy: 94,
  },
  {
    type: 'arima',
    name: 'ARIMA Time Series',
    description: 'Classical statistical model for trend and seasonality analysis',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    accuracy: 89,
  },
  {
    type: 'exponential',
    name: 'Exponential Smoothing',
    description: 'Weighted average approach with exponential decay for recent observations',
    icon: Activity,
    color: 'from-green-500 to-green-600',
    accuracy: 87,
  },
  {
    type: 'linear',
    name: 'Linear Regression',
    description: 'Linear trend analysis with feature engineering for financial indicators',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    accuracy: 82,
  },
  {
    type: 'ensemble',
    name: 'Ensemble Model',
    description: 'Combines all models using weighted averaging for maximum accuracy',
    icon: Sparkles,
    color: 'from-gradient-500 to-gradient-600',
    accuracy: 96,
  }
];

const ForecastingInterface: React.FC = () => {
  const { user, organizations } = useAuth();
  const [selectedOrganization] = useState(organizations[0]?.id || 'org-1');
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [models, setModels] = useState<ForecastModel[]>([]);
  const [economicScenario, setEconomicScenario] = useState<EconomicScenario | null>(null);
  
  // Forecast configuration
  const [config, setConfig] = useState<ForecastConfig>({
    organizationId: selectedOrganization,
    horizon: 90, // Default 3 months
    confidence: 0.95,
    scenario: 'moderate',
    modelType: 'auto',
    rollingWindow: 365 // 12-month rolling window
  });

  useEffect(() => {
    loadModels();
    loadEconomicScenario();
  }, [selectedOrganization]);

  const loadModels = () => {
    const orgModels = forecastingEngine.getModels(selectedOrganization);
    setModels(orgModels);
  };

  const loadEconomicScenario = () => {
    // Create economic scenario from current market data
    const forexRates = economicDataManager.getForexRates();
    const indicators = economicDataManager.getEconomicIndicators('US');
    
    if (indicators.length > 0) {
      const gdpIndicator = indicators.find(i => i.indicator.toLowerCase().includes('gdp'));
      const inflationIndicator = indicators.find(i => i.indicator.toLowerCase().includes('inflation'));
      
      const scenario: EconomicScenario = {
        gdpGrowth: gdpIndicator?.value || 2.4,
        inflationRate: inflationIndicator?.value || 3.2,
        interestRates: 5.25, // Mock federal funds rate
        forexRates: forexRates,
        marketVolatility: 0.15 // Mock volatility index
      };
      
      setEconomicScenario(scenario);
    }
  };

  const runForecast = async () => {
    setIsLoading(true);
    try {
      // Generate mock historical data
      const accounts = generateMockBankAccounts(selectedOrganization);
      const transactions = generateMockTransactions(selectedOrganization, accounts, 12);
      
      // Update config with economic factors if available
      const forecastConfig: ForecastConfig = {
        ...config,
        economicFactors: economicScenario || undefined
      };
      
      const result = await forecastingEngine.generateForecast(forecastConfig, transactions);
      setForecast(result);
    } catch (error) {
      console.error('Forecast generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatChartData = () => {
    if (!forecast) return [];
    
    return forecast.forecast.map((point, index) => ({
      date: point.date.toLocaleDateString(),
      predicted: Math.round(point.predicted_value),
      lower_bound: Math.round(point.lower_bound),
      upper_bound: Math.round(point.upper_bound),
      confidence: Math.round(point.confidence * 100),
      day: index + 1
    }));
  };

  const getModelIcon = (modelType: string) => {
    const model = forecastModels.find(m => m.type === modelType);
    return model?.icon || Target;
  };

  const getModelColor = (modelType: string) => {
    const model = forecastModels.find(m => m.type === modelType);
    return model?.color || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Advanced Financial Forecasting</span>
          </CardTitle>
          <CardDescription>
            AI-powered multi-model forecasting with economic scenario analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="configure" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forecast Configuration</CardTitle>
                <CardDescription>
                  Set parameters for your financial forecast
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Forecast Horizon (12-Month Rolling)</Label>
                  <div className="px-3">
                    <Slider
                      value={[config.horizon]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, horizon: value[0] }))}
                      max={365} // 12 months maximum
                      min={30}  // 1 month minimum
                      step={30} // Monthly increments
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 month</span>
                    <span className="font-medium">{Math.round(config.horizon / 30)} months ({config.horizon} days)</span>
                    <span>12 months</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rolling forecast using last 12 months of data for optimal accuracy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Confidence Level</Label>
                  <Select
                    value={config.confidence.toString()}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, confidence: parseFloat(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.90">90% Confidence</SelectItem>
                      <SelectItem value="0.95">95% Confidence</SelectItem>
                      <SelectItem value="0.99">99% Confidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Economic Scenario</Label>
                  <Select
                    value={config.scenario}
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, scenario: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model Selection</Label>
                  <Select
                    value={config.modelType || 'auto'}
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, modelType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-Select Best Model</SelectItem>
                      {forecastModels.map((model) => (
                        <SelectItem key={model.type} value={model.type}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={runForecast} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Generating Forecast...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Economic Context</CardTitle>
                <CardDescription>
                  Current economic indicators affecting forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {economicScenario ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">GDP Growth</p>
                        <p className="text-2xl font-bold text-green-600">
                          {economicScenario.gdpGrowth.toFixed(1)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Inflation Rate</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {economicScenario.inflationRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Interest Rates</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {economicScenario.interestRates.toFixed(2)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Market Volatility</p>
                        <p className="text-2xl font-bold text-red-600">
                          {(economicScenario.marketVolatility * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Forex Rates</p>
                      <div className="space-y-1">
                        {economicScenario.forexRates.slice(0, 3).map((rate) => (
                          <div key={rate.symbol} className="flex justify-between items-center text-sm">
                            <span>{rate.symbol}</span>
                            <span className="font-medium">{rate.rate.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No economic data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecastModels.map((model) => {
              const Icon = model.icon;
              const isActive = models.some(m => m.type === model.type && m.status === 'active');
              
              return (
                <motion.div
                  key={model.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Card className={`cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${model.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {model.accuracy}% accuracy
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{model.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {model.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {isActive ? 'Active' : 'Available'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {forecast ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5" />
                    <span>Forecast Results</span>
                    <Badge variant="outline" className="ml-auto">
                      {forecast.horizon_days} days
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Generated using {forecast.modelType.toUpperCase()} model with {Math.round(forecast.accuracy_metrics.accuracy * 100)}% accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value, name) => [
                            typeof value === 'number' ? `$${value.toLocaleString()}` : value,
                            name === 'predicted' ? 'Predicted Value' : 
                            name === 'lower_bound' ? 'Lower Bound' : 'Upper Bound'
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="upper_bound"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                          name="Confidence Interval"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower_bound"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#ffffff"
                          name=""
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Predicted Value"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Model Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {Math.round(forecast.accuracy_metrics.accuracy * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MAPE: {forecast.accuracy_metrics.meanAbsolutePercentageError.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Trend Analysis</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {forecast.forecast[forecast.forecast.length - 1].predicted_value > forecast.forecast[0].predicted_value ? 'Positive' : 'Negative'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Based on {forecast.horizon_days}-day projection
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">Confidence</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {Math.round(forecast.accuracy_metrics.confidenceScore * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Average across forecast period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-sm">Variance</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {forecast.accuracy_metrics.variance.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Model prediction stability
                    </p>
                  </CardContent>
                </Card>
              </div>

              {forecast.scenario_impact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Economic Scenario Impact</CardTitle>
                    <CardDescription>
                      How current economic conditions affect the forecast
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Revenue Impact</p>
                        <p className="text-lg font-bold text-green-600">
                          {((forecast.scenario_impact.revenueMultiplier - 1) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Expense Impact</p>
                        <p className="text-lg font-bold text-red-600">
                          {((forecast.scenario_impact.expenseMultiplier - 1) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Cash Flow</p>
                        <p className="text-lg font-bold text-blue-600">
                          {(forecast.scenario_impact.cashFlowAdjustment * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-lg font-bold text-purple-600">
                          {(forecast.scenario_impact.confidenceAdjustment * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Forecast Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your parameters and generate a forecast to see results
                </p>
                <Button onClick={runForecast} disabled={isLoading}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Your First Forecast
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {models.map((model) => {
              const Icon = getModelIcon(model.type);
              return (
                <Card key={model.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getModelColor(model.type)}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {model.type.toUpperCase()} Model
                        </p>
                      </div>
                      <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy</span>
                        <span className="text-sm font-medium">
                          {Math.round(model.accuracy * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${model.accuracy * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last trained: {model.last_trained.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {forecast && forecast.accuracy_metrics.backtestResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backtest Results</CardTitle>
                <CardDescription>
                  Historical performance validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Period</th>
                        <th className="text-left p-2">Predicted</th>
                        <th className="text-left p-2">Actual</th>
                        <th className="text-left p-2">Error</th>
                        <th className="text-left p-2">MAPE %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.accuracy_metrics.backtestResults.map((result, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{result.period}</td>
                          <td className="p-2">${result.predicted.toLocaleString()}</td>
                          <td className="p-2">${result.actual.toLocaleString()}</td>
                          <td className="p-2">${result.error.toLocaleString()}</td>
                          <td className="p-2">
                            <span className={result.error_percentage > 0 ? 'text-red-600' : 'text-green-600'}>
                              {result.error_percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForecastingInterface;