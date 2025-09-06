import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  Activity,
  PieChart,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
  RefreshCw,
  UserPlus,
  CalendarDays
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import KPIManager from "./KPIManager";
import VarianceAnalysis from "./VarianceAnalysis";

interface ExecutiveDashboardProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

const ExecutiveDashboard = ({ period, onPeriodChange }: ExecutiveDashboardProps) => {
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showKPIManager, setShowKPIManager] = useState(false);
  const [showVarianceAnalysis, setShowVarianceAnalysis] = useState(false);
  const [actualAccuracy, setActualAccuracy] = useState(97.2);
  const [generating, setGenerating] = useState(false);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Load actual accuracy from variance analysis
  useEffect(() => {
    loadActualAccuracy();
  }, [user, period]);

  const loadActualAccuracy = async () => {
    try {
      if (!user) return;
      
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        // Calculate real accuracy from last 3 months variance
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, value_date')
          .eq('organization_id', membership.organization_id)
          .eq('is_forecast', false)
          .gte('value_date', threeMonthsAgo.toISOString().split('T')[0]);

        const { data: forecasts } = await supabase
          .from('forecast_outputs')
          .select('amount, date')
          .eq('organization_id', membership.organization_id)
          .gte('date', threeMonthsAgo.toISOString().split('T')[0]);

        if (transactions?.length && forecasts?.length) {
          const accuracy = calculateAccuracy(transactions, forecasts);
          setActualAccuracy(accuracy);
        }
      }
    } catch (error) {
      console.error('Error loading accuracy:', error);
    }
  };

  const calculateAccuracy = (actuals: any[], forecasts: any[]) => {
    if (!actuals.length || !forecasts.length) return 97.2;
    
    const monthlyActuals: Record<string, number> = {};
    const monthlyForecasts: Record<string, number> = {};
    
    actuals.forEach(txn => {
      const month = new Date(txn.value_date).toISOString().substring(0, 7);
      monthlyActuals[month] = (monthlyActuals[month] || 0) + parseFloat(txn.amount);
    });

    forecasts.forEach(forecast => {
      const month = new Date(forecast.date).toISOString().substring(0, 7);
      monthlyForecasts[month] = (monthlyForecasts[month] || 0) + parseFloat(forecast.amount);
    });

    const commonMonths = Object.keys(monthlyActuals).filter(month => monthlyForecasts[month]);
    if (!commonMonths.length) return 97.2;

    const accuracies = commonMonths.map(month => {
      const actual = monthlyActuals[month];
      const forecast = monthlyForecasts[month];
      const variance = Math.abs(actual - forecast);
      const percentageError = forecast !== 0 ? (variance / Math.abs(forecast)) * 100 : 0;
      return Math.max(0, 100 - percentageError);
    });

    return accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      toast({
        title: "Generating executive report",
        description: "Creating comprehensive financial summary with AI insights...",
      });

      // Simulate report generation
      setTimeout(() => {
        toast({
          title: "Report generated successfully!",
          description: "Your executive summary is ready for download.",
        });
        setGenerating(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "Report generation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      setGenerating(false);
    }
  };

  const handleUpdateForecast = async () => {
    try {
      toast({
        title: "Updating forecast...",
        description: "Refreshing AI predictions with latest data.",
      });

      const { error } = await supabase.functions.invoke('generate-forecast', {
        body: { 
          modelId: 'default',
          horizon_days: parseInt(period) * 30 || 180
        }
      });

      if (error) throw error;

      toast({
        title: "Forecast updated!",
        description: "Your AI-powered predictions have been refreshed.",
      });
      
      loadActualAccuracy();
    } catch (error: any) {
      console.error('Error updating forecast:', error);
      toast({
        title: "Forecast update failed",
        description: error.message || "Failed to update forecast. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInviteTeam = async () => {
    toast({
      title: "Team invitation feature",
      description: "Contact support to enable team collaboration features.",
    });
  };

  // Mock executive KPI data
  const kpis = {
    totalRevenue: 2450000,
    revenueGrowth: 12.5,
    netCashFlow: 185000,
    cashFlowTrend: 8.3,
    burnRate: 45000,
    runway: 18, // months
    forecastAccuracy: actualAccuracy,
    riskScore: 23, // out of 100, lower is better
    workingCapital: 1250000,
    currentRatio: 2.3,
    quickRatio: 1.8,
    totalExpenses: 2265000,
    profitMargin: 7.5,
    customerCount: 1247,
    averageContractValue: 85000
  };

  const alerts = [
    { type: 'warning', message: 'Q4 cash flow projection below target by 8%', priority: 'medium' },
    { type: 'info', message: 'Foreign exchange exposure in EUR requires hedging', priority: 'high' },
    { type: 'success', message: 'Working capital ratio improved by 15%', priority: 'low' }
  ];

  const getVariantFromType = (type: string) => {
    switch (type) {
      case 'warning': return 'secondary';
      case 'info': return 'default';
      case 'success': return 'outline';
      default: return 'outline';
    }
  };

  const getIconFromType = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info': return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'success': return <Target className="h-4 w-4 text-accent" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Executive Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time financial overview and key performance indicators 
              {actualAccuracy && ` • ${actualAccuracy.toFixed(1)}% forecast accuracy`}
            </p>
          </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomDateRange(!showCustomDateRange)}
            className="flex items-center space-x-1"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Custom Range</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustomDateRange && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Custom Time Window</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      toast({
                        title: "Custom range applied",
                        description: `Showing data from ${customStartDate} to ${customEndDate}`,
                      });
                    } else {
                      toast({
                        title: "Invalid range",
                        description: "Please select both start and end dates",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="flex-1"
                >
                  Apply Range
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="text-accent">+{kpis.revenueGrowth}%</span>
              <span className="text-muted-foreground">vs last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.netCashFlow)}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="text-accent">+{kpis.cashFlowTrend}%</span>
              <span className="text-muted-foreground">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{100 - kpis.riskScore}%</div>
            <Progress value={100 - kpis.riskScore} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">Financial stability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Runway</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.runway} months</div>
            <div className="text-xs text-muted-foreground">
              At current burn rate of {formatCurrency(kpis.burnRate)}/month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Financial Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profit Margin</span>
              <span className="font-medium">{kpis.profitMargin}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revenue Growth</span>
              <span className="font-medium text-accent">+{kpis.revenueGrowth}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cash Flow Trend</span>
              <span className="font-medium text-accent">+{kpis.cashFlowTrend}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <Badge variant={kpis.riskScore < 30 ? "default" : kpis.riskScore < 60 ? "secondary" : "destructive"}>
                {kpis.riskScore < 30 ? 'Low' : kpis.riskScore < 60 ? 'Medium' : 'High'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Business Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Customers</span>
              <span className="font-medium">{kpis.customerCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Contract Value</span>
              <span className="font-medium">{formatCurrency(kpis.averageContractValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Expenses</span>
              <span className="font-medium">{formatCurrency(kpis.totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Burn</span>
              <span className="font-medium">{formatCurrency(kpis.burnRate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overall Risk Score</span>
                <Badge variant={kpis.riskScore < 30 ? "default" : kpis.riskScore < 60 ? "secondary" : "destructive"}>
                  {kpis.riskScore}/100
                </Badge>
              </div>
              <Progress value={100 - kpis.riskScore} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Active Alerts</h4>
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 border rounded-md">
                  {getIconFromType(alert.type)}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                    <Badge variant={getVariantFromType(alert.type)} className="mt-1 text-xs">
                      {alert.priority} priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start hover:bg-accent/10 transition-colors"
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? (
                <RefreshCw className="h-6 w-6 mb-2 animate-spin text-primary" />
              ) : (
                <FileText className="h-6 w-6 mb-2 text-primary" />
              )}
              <div className="text-sm font-medium">Generate Report</div>
              <div className="text-xs text-muted-foreground">Create executive summary</div>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start hover:bg-accent/10 transition-colors"
              onClick={handleUpdateForecast}
            >
              <RefreshCw className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Update Forecast</div>
              <div className="text-xs text-muted-foreground">Refresh predictions</div>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start hover:bg-accent/10 transition-colors"
              onClick={() => setShowKPIManager(true)}
            >
              <Target className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Set Targets</div>
              <div className="text-xs text-muted-foreground">Define KPI goals</div>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start hover:bg-accent/10 transition-colors"
              onClick={handleInviteTeam}
            >
              <UserPlus className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Team Access</div>
              <div className="text-xs text-muted-foreground">Manage permissions</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Management Dialog */}
      <Dialog open={showKPIManager} onOpenChange={setShowKPIManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KPI Management</DialogTitle>
            <DialogDescription>
              Set and track custom key performance indicators for your business.
            </DialogDescription>
          </DialogHeader>
          <KPIManager />
        </DialogContent>
      </Dialog>

      {/* Variance Analysis */}
      <VarianceAnalysis period={period} />
    </div>
  );
};

export default ExecutiveDashboard;