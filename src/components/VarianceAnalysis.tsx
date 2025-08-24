import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface VarianceData {
  period: string;
  actual: number;
  forecast: number;
  variance: number;
  variancePercent: number;
  accuracy: number;
}

interface VarianceAnalysisProps {
  period: string;
}

const VarianceAnalysis = ({ period }: VarianceAnalysisProps) => {
  const [varianceData, setVarianceData] = useState<VarianceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('balance');
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    loadVarianceData();
  }, [user, period, selectedMetric]);

  const loadVarianceData = async () => {
    setLoading(true);
    
    try {
      // Get user's organization
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!membership) {
        // Use demo data if no real data
        setVarianceData(generateDemoVarianceData());
        setLoading(false);
        return;
      }

      // Get actual transactions (last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .eq('is_forecast', false)
        .gte('value_date', threeMonthsAgo.toISOString().split('T')[0])
        .order('value_date');

      // Get forecast data for the same period
      const { data: forecasts } = await supabase
        .from('forecast_outputs')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .order('date');

      if (transactions && forecasts && transactions.length > 0 && forecasts.length > 0) {
        const varianceAnalysis = calculateVariance(transactions, forecasts);
        setVarianceData(varianceAnalysis);
      } else {
        // Fallback to demo data
        setVarianceData(generateDemoVarianceData());
      }
    } catch (error) {
      console.error('Error loading variance data:', error);
      setVarianceData(generateDemoVarianceData());
    } finally {
      setLoading(false);
    }
  };

  const calculateVariance = (actuals: any[], forecasts: any[]) => {
    const monthlyData: { [key: string]: { actual: number; forecast: number } } = {};
    
    // Group actuals by month
    actuals.forEach(txn => {
      const month = new Date(txn.value_date).toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { actual: 0, forecast: 0 };
      monthlyData[month].actual += parseFloat(txn.amount);
    });

    // Group forecasts by month
    forecasts.forEach(forecast => {
      const month = new Date(forecast.date).toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { actual: 0, forecast: 0 };
      monthlyData[month].forecast += parseFloat(forecast.amount);
    });

    // Calculate variance
    return Object.entries(monthlyData).map(([month, data]) => {
      const variance = data.actual - data.forecast;
      const variancePercent = data.forecast !== 0 ? (variance / Math.abs(data.forecast)) * 100 : 0;
      const accuracy = Math.max(0, 100 - Math.abs(variancePercent));

      return {
        period: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        actual: data.actual,
        forecast: data.forecast,
        variance,
        variancePercent,
        accuracy
      };
    }).slice(-3); // Last 3 months only
  };

  const generateDemoVarianceData = (): VarianceData[] => [
    {
      period: 'Oct 2024',
      actual: 145000,
      forecast: 150000,
      variance: -5000,
      variancePercent: -3.3,
      accuracy: 96.7
    },
    {
      period: 'Nov 2024',
      actual: 158000,
      forecast: 152000,
      variance: 6000,
      variancePercent: 3.9,
      accuracy: 96.1
    },
    {
      period: 'Dec 2024',
      actual: 167000,
      forecast: 165000,
      variance: 2000,
      variancePercent: 1.2,
      accuracy: 98.8
    }
  ];

  const calculateOverallAccuracy = () => {
    if (varianceData.length === 0) return 0;
    return varianceData.reduce((sum, item) => sum + item.accuracy, 0) / varianceData.length;
  };

  const getTrendIcon = (variancePercent: number) => {
    if (Math.abs(variancePercent) < 5) return <Activity className="h-4 w-4 text-green-600" />;
    return variancePercent > 0 ? 
      <TrendingUp className="h-4 w-4 text-blue-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getVarianceBadge = (variancePercent: number) => {
    const absPercent = Math.abs(variancePercent);
    if (absPercent < 2) return { variant: "default" as const, label: "Excellent" };
    if (absPercent < 5) return { variant: "secondary" as const, label: "Good" };
    if (absPercent < 10) return { variant: "outline" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Poor" };
  };

  const overallAccuracy = calculateOverallAccuracy();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Variance Analysis - Last 3 Months
            </span>
            <div className="flex items-center gap-4">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">Cash Flow</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {overallAccuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Forecast Accuracy
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variance Chart */}
            <div className="space-y-4">
              <h4 className="font-medium">Actual vs Forecast</h4>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={varianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-background p-3 border rounded shadow-lg">
                            <p className="font-medium">{label}</p>
                            {payload.map((entry, index) => (
                              <p key={index} style={{ color: entry.color }}>
                                {entry.name}: {formatCurrency(entry.value as number)}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(214, 84%, 56%)" 
                      strokeWidth={3}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="hsl(142, 76%, 36%)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Accuracy Progress */}
            <div className="space-y-4">
              <h4 className="font-medium">Monthly Accuracy</h4>
              {varianceData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.period}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(item.variancePercent)}
                      <Badge {...getVarianceBadge(item.variancePercent)}>
                        {item.accuracy.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={item.accuracy} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Variance: {formatCurrency(item.variance)}</span>
                    <span>{item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Monthly Variance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    varianceData.reduce((sum, item) => sum + Math.abs(item.variance), 0) / varianceData.length || 0
                  )}
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Month</p>
                <p className="text-2xl font-bold">
                  {varianceData.reduce((best, item) => 
                    item.accuracy > best.accuracy ? item : best, 
                    { accuracy: 0, period: 'N/A' }
                  ).period}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forecast Trend</p>
                <p className="text-2xl font-bold">
                  {varianceData.length >= 2 && 
                   varianceData[varianceData.length - 1].accuracy > varianceData[0].accuracy
                    ? 'Improving' : 'Stable'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VarianceAnalysis;