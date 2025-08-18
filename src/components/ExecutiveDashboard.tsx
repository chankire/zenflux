import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  AlertTriangle
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface ExecutiveDashboardProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

const ExecutiveDashboard = ({ period, onPeriodChange }: ExecutiveDashboardProps) => {
  const { formatCurrency } = useCurrency();

  // Mock executive KPI data
  const kpis = {
    totalRevenue: 2450000,
    revenueGrowth: 12.5,
    netCashFlow: 185000,
    cashFlowTrend: 8.3,
    burnRate: 45000,
    runway: 18, // months
    forecastAccuracy: 97.2,
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
          <p className="text-muted-foreground">Real-time financial overview and key performance indicators</p>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.forecastAccuracy}%</div>
            <Progress value={kpis.forecastAccuracy} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
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
              <span className="text-sm text-muted-foreground">Working Capital</span>
              <span className="font-medium">{formatCurrency(kpis.workingCapital)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Ratio</span>
              <span className="font-medium">{kpis.currentRatio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Quick Ratio</span>
              <span className="font-medium">{kpis.quickRatio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profit Margin</span>
              <span className="font-medium">{kpis.profitMargin}%</span>
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
            <button className="p-4 border rounded-lg hover:bg-accent/10 transition-colors text-left">
              <PieChart className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Generate Report</div>
              <div className="text-xs text-muted-foreground">Create executive summary</div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent/10 transition-colors text-left">
              <TrendingUp className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Update Forecast</div>
              <div className="text-xs text-muted-foreground">Refresh predictions</div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent/10 transition-colors text-left">
              <Target className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Set Targets</div>
              <div className="text-xs text-muted-foreground">Define KPI goals</div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent/10 transition-colors text-left">
              <Users className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Team Access</div>
              <div className="text-xs text-muted-foreground">Manage permissions</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;