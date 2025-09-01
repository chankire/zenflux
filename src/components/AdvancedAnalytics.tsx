import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  Calendar,
  Zap,
  Brain,
  Shield,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { ForecastingService, ForecastInput, ForecastResult } from "@/lib/forecasting";

interface AnalyticsData {
  cashFlowTrends: any[];
  seasonalPatterns: any[];
  riskMetrics: any[];
  performanceKPIs: any[];
  varianceAnalysis: any[];
  confidenceIntervals: any[];
}

interface AdvancedAnalyticsProps {
  organizationId: string;
  period: string;
}

const AdvancedAnalytics = ({ organizationId, period }: AdvancedAnalyticsProps) => {
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'ai' | 'statistical' | 'ensemble'>('ensemble');
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [activeAnalysis, setActiveAnalysis] = useState('overview');

  // Sample data for demonstration
  const sampleData = {
    cashFlowTrends: [
      { month: 'Jan', actual: 125000, forecast: 120000, variance: 5000 },
      { month: 'Feb', actual: 132000, forecast: 128000, variance: 4000 },
      { month: 'Mar', actual: 118000, forecast: 125000, variance: -7000 },
      { month: 'Apr', actual: 145000, forecast: 140000, variance: 5000 },
      { month: 'May', actual: 138000, forecast: 142000, variance: -4000 },
      { month: 'Jun', actual: 156000, forecast: 150000, variance: 6000 }
    ],
    seasonalPatterns: [
      { quarter: 'Q1', revenue: 375000, expenses: 280000, net: 95000 },
      { quarter: 'Q2', revenue: 439000, expenses: 320000, net: 119000 },
      { quarter: 'Q3', revenue: 485000, expenses: 350000, net: 135000 },
      { quarter: 'Q4', revenue: 520000, expenses: 380000, net: 140000 }
    ],
    riskMetrics: [
      { category: 'Liquidity Risk', score: 15, status: 'low' },
      { category: 'Operational Risk', score: 35, status: 'medium' },
      { category: 'Market Risk', score: 25, status: 'low' },
      { category: 'Credit Risk', score: 45, status: 'medium' },
      { category: 'Regulatory Risk', score: 20, status: 'low' }
    ],
    performanceKPIs: [
      { metric: 'Cash Conversion Cycle', value: 32, target: 28, unit: 'days' },
      { metric: 'Working Capital Ratio', value: 2.4, target: 2.0, unit: 'ratio' },
      { metric: 'Cash Burn Rate', value: 15000, target: 12000, unit: 'monthly' },
      { metric: 'Revenue Growth', value: 18.5, target: 20.0, unit: 'percent' }
    ]
  };

  useEffect(() => {
    loadAnalytics();
  }, [organizationId, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch actual analytics data
      setAnalyticsData(sampleData);
      
      toast({
        title: "Analytics loaded",
        description: "Advanced analytics data has been updated.",
      });
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error loading analytics",
        description: error.message || "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAdvancedForecast = async () => {
    setLoading(true);
    try {
      const input: ForecastInput = {
        organizationId,
        horizon_days: parseInt(period) * 30,
        confidence_level: confidenceLevel,
        method: selectedMethod,
        includeSeasonality: true,
        customParameters: {
          includeRiskAdjustment: true,
          useEconomicIndicators: true,
          applySeasonalAdjustment: true
        }
      };

      const validation = ForecastingService.validateForecastInput(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      let result: ForecastResult;
      switch (selectedMethod) {
        case 'ai':
          result = await ForecastingService.generateAIForecast(input);
          break;
        case 'statistical':
          result = await ForecastingService.generateStatisticalForecast(input);
          break;
        case 'ensemble':
          result = await ForecastingService.generateEnsembleForecast(input);
          break;
        default:
          throw new Error('Invalid forecast method');
      }

      setForecastResult(result);
      
      toast({
        title: "Advanced forecast generated",
        description: `${selectedMethod.toUpperCase()} forecast completed with ${result.forecasts.length} data points.`,
      });
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      toast({
        title: "Forecast generation failed",
        description: error.message || "Failed to generate advanced forecast.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 25) return 'text-green-600';
    if (score < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKPIStatus = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 0.95 && ratio <= 1.05) return 'success';
    if (ratio >= 0.85 && ratio <= 1.15) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Generating advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Enterprise-grade financial intelligence and forecasting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai">AI Forecast</SelectItem>
              <SelectItem value="statistical">Statistical</SelectItem>
              <SelectItem value="ensemble">Ensemble</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateAdvancedForecast} disabled={loading}>
            <Brain className="w-4 h-4 mr-2" />
            Generate Forecast
          </Button>
        </div>
      </div>

      <Tabs value={activeAnalysis} onValueChange={setActiveAnalysis} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(645000)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1 text-green-500" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  3-month rolling average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">Medium</div>
                <p className="text-xs text-muted-foreground">
                  Operational risk elevated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Runway</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.2</div>
                <p className="text-xs text-muted-foreground">
                  months at current burn
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Trends</CardTitle>
                <CardDescription>Actual vs. forecasted cash flow over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData?.cashFlowTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="forecast" fill="#8884d8" fillOpacity={0.3} />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
                <CardDescription>Quarterly revenue and expense patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.seasonalPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                    <Bar dataKey="expenses" fill="#82ca9d" />
                    <Bar dataKey="net" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Forecast Configuration</CardTitle>
              <CardDescription>
                Configure advanced forecasting parameters for enterprise-grade predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confidence Level</label>
                  <Select value={confidenceLevel.toString()} onValueChange={(value) => setConfidenceLevel(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.80">80%</SelectItem>
                      <SelectItem value="0.90">90%</SelectItem>
                      <SelectItem value="0.95">95%</SelectItem>
                      <SelectItem value="0.99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Forecast Method</label>
                  <Select value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">AI-Powered (OpenAI)</SelectItem>
                      <SelectItem value="statistical">Statistical Models</SelectItem>
                      <SelectItem value="ensemble">Ensemble Method</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Horizon Period</label>
                  <Select value={period} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {forecastResult && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Forecast Results</h4>
                    <Badge variant="outline">Run ID: {forecastResult.runId.slice(-8)}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm font-medium">MAE</p>
                      <p className="text-lg font-bold">{formatCurrency(forecastResult.accuracy_metrics.mae)}</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm font-medium">RMSE</p>
                      <p className="text-lg font-bold">{formatCurrency(forecastResult.accuracy_metrics.rmse)}</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm font-medium">MAPE</p>
                      <p className="text-lg font-bold">{(forecastResult.accuracy_metrics.mape * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm font-medium">Risk Level</p>
                      <p className={`text-lg font-bold ${
                        forecastResult.risk_assessment === 'low' ? 'text-green-600' :
                        forecastResult.risk_assessment === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {forecastResult.risk_assessment.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Key Insights</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {forecastResult.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <CardDescription>Enterprise risk factors and scoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.riskMetrics.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{risk.category}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={risk.score} className="w-20" />
                        <span className={`text-sm font-medium ${getRiskColor(risk.score)}`}>
                          {risk.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Alerts</CardTitle>
                <CardDescription>Active risk notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Medium Risk:</strong> Credit risk elevated due to increased customer payment delays.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Low Risk:</strong> Liquidity position remains strong with adequate cash reserves.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Critical financial and operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData?.performanceKPIs.map((kpi, index) => {
                  const status = getKPIStatus(kpi.value, kpi.target);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{kpi.metric}</p>
                        <p className="text-sm text-muted-foreground">
                          Target: {kpi.target} {kpi.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          status === 'success' ? 'text-green-600' :
                          status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {kpi.value} {kpi.unit}
                        </p>
                        <Badge variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                          {status === 'success' ? 'On Target' : status === 'warning' ? 'Near Target' : 'Off Target'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                Machine learning powered financial intelligence and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
                  <h4 className="font-medium text-primary">Cash Flow Optimization</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your payment patterns, shifting vendor payments from weekly to bi-weekly could improve cash flow by approximately {formatCurrency(25000)} monthly.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-l-accent bg-accent/5 rounded-r-lg">
                  <h4 className="font-medium text-accent">Seasonal Trend Alert</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Historical data indicates a 15% revenue increase in Q4. Consider increasing inventory and marketing spend by October.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-500/5 rounded-r-lg">
                  <h4 className="font-medium text-yellow-700">Working Capital Efficiency</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your cash conversion cycle is 4 days above industry average. Focus on accelerating receivables collection to improve liquidity.
                  </p>
                </div>

                <div className="p-4 border-l-4 border-l-green-500 bg-green-500/5 rounded-r-lg">
                  <h4 className="font-medium text-green-700">Investment Opportunity</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Excess cash reserves of {formatCurrency(150000)} identified. Consider short-term treasury investments for additional yield.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;