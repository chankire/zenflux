import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpIcon, 
  ArrowDownIcon,
  Calendar,
  RefreshCw,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useAuth } from '@/lib/auth';
import { generateMockTransactions, generateMockBankAccounts, MockTransaction } from '@/lib/mock-data';
import RefreshIndicator from './RefreshIndicator';
import { refreshManager } from '@/lib/refresh-manager';

interface ExecutiveMetrics {
  totalRevenue: {
    amount: number;
    currency: string;
    period: TimePeriod;
    trend: TrendData;
  };
  totalPayments: {
    amount: number;
    currency: string;
    period: TimePeriod;
    categoryBreakdown: CategoryMetric[];
  };
  netCashFlow: {
    amount: number;
    currency: string;
    period: TimePeriod;
    projection: ForecastData[];
  };
  currentBalance: {
    total: number;
    byAccount: AccountBalance[];
    currency: string;
    lastUpdated: Date;
  };
}

interface TimePeriod {
  type: 'daily' | 'weekly' | 'monthly';
  value: string;
  dateRange: { from: Date; to: Date };
}

interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  previousValue: number;
}

interface CategoryMetric {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ForecastData {
  date: Date;
  projected: number;
  actual?: number;
}

interface AccountBalance {
  accountName: string;
  balance: number;
  accountType: string;
}

const EnhancedExecutiveDashboard: React.FC = () => {
  const { user, organizations } = useAuth();
  const [selectedOrg] = useState(organizations[0]?.id || 'org-1');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedOrg, timePeriod, dateRange]);

  const loadDashboardData = async () => {
    try {
      // Generate mock data
      const accounts = generateMockBankAccounts(selectedOrg);
      const transactionData = generateMockTransactions(selectedOrg, accounts, 12);
      setTransactions(transactionData);
      
      // Calculate metrics based on selected period
      const calculatedMetrics = calculateExecutiveMetrics(transactionData, accounts, timePeriod, dateRange);
      setMetrics(calculatedMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshManager.performRefresh(
        selectedOrg,
        'dashboard_metrics',
        async () => {
          await loadDashboardData();
          return { recordsProcessed: transactions.length };
        },
        user?.id
      );
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateExecutiveMetrics = (
    transactions: MockTransaction[], 
    accounts: any[], 
    period: 'daily' | 'weekly' | 'monthly',
    range: string
  ): ExecutiveMetrics => {
    const now = new Date();
    const periodDays = range === 'last_7_days' ? 7 : range === 'last_30_days' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    const filteredTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);
    
    // Calculate revenue (positive amounts)
    const revenueTransactions = filteredTransactions.filter(t => t.amount > 0);
    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate payments (negative amounts)
    const paymentTransactions = filteredTransactions.filter(t => t.amount < 0);
    const totalPayments = Math.abs(paymentTransactions.reduce((sum, t) => sum + t.amount, 0));
    
    // Calculate net cash flow
    const netCashFlow = totalRevenue - totalPayments;
    
    // Calculate category breakdown for payments
    const categoryBreakdown = calculateCategoryBreakdown(paymentTransactions);
    
    // Calculate trend (compare with previous period)
    const previousPeriodStart = new Date(cutoffDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const previousTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= previousPeriodStart && date < cutoffDate;
    });
    
    const previousRevenue = previousTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const revenueTrend = calculateTrend(totalRevenue, previousRevenue);
    
    // Generate forecast projection
    const forecastProjection = generateForecastProjection(filteredTransactions, periodDays);
    
    // Calculate current balances
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountBalances = accounts.map(acc => ({
      accountName: acc.name,
      balance: acc.balance,
      accountType: acc.account_type
    }));

    return {
      totalRevenue: {
        amount: totalRevenue,
        currency: 'USD',
        period: {
          type: period,
          value: range,
          dateRange: { from: cutoffDate, to: now }
        },
        trend: revenueTrend
      },
      totalPayments: {
        amount: totalPayments,
        currency: 'USD',
        period: {
          type: period,
          value: range,
          dateRange: { from: cutoffDate, to: now }
        },
        categoryBreakdown
      },
      netCashFlow: {
        amount: netCashFlow,
        currency: 'USD',
        period: {
          type: period,
          value: range,
          dateRange: { from: cutoffDate, to: now }
        },
        projection: forecastProjection
      },
      currentBalance: {
        total: currentBalance,
        byAccount: accountBalances,
        currency: 'USD',
        lastUpdated: now
      }
    };
  };

  const calculateCategoryBreakdown = (transactions: MockTransaction[]): CategoryMetric[] => {
    const categoryTotals = new Map<string, number>();
    const total = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));
    
    transactions.forEach(t => {
      // Mock category assignment based on description
      let category = 'Other';
      if (t.description.toLowerCase().includes('office')) category = 'Office Expenses';
      else if (t.description.toLowerCase().includes('software')) category = 'Software';
      else if (t.description.toLowerCase().includes('salary') || t.description.toLowerCase().includes('payroll')) category = 'Payroll';
      else if (t.description.toLowerCase().includes('marketing')) category = 'Marketing';
      else if (t.description.toLowerCase().includes('rent')) category = 'Rent';
      else if (t.description.toLowerCase().includes('utility') || t.description.toLowerCase().includes('electric')) category = 'Utilities';
      
      const current = categoryTotals.get(category) || 0;
      categoryTotals.set(category, current + Math.abs(t.amount));
    });
    
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];
    
    return Array.from(categoryTotals.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / total) * 100,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories
  };

  const calculateTrend = (current: number, previous: number): TrendData => {
    if (previous === 0) {
      return { direction: 'stable', percentage: 0, previousValue: previous };
    }
    
    const change = ((current - previous) / previous) * 100;
    
    return {
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
      percentage: Math.abs(change),
      previousValue: previous
    };
  };

  const generateForecastProjection = (transactions: MockTransaction[], days: number): ForecastData[] => {
    const dailyAvg = transactions.reduce((sum, t) => sum + t.amount, 0) / days;
    const projection: ForecastData[] = [];
    
    for (let i = 1; i <= 30; i++) { // 30-day projection
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Add some randomness and trend
      const trendFactor = 1 + (Math.random() - 0.5) * 0.1;
      const projected = dailyAvg * trendFactor;
      
      projection.push({
        date,
        projected
      });
    }
    
    return projection;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: TrendData) => {
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <ArrowUpIcon className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: TrendData) => {
    if (trend.direction === 'up') return 'text-green-600';
    if (trend.direction === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChartData = () => {
    if (!metrics) return [];
    
    return metrics.netCashFlow.projection.slice(0, 7).map((item, index) => ({
      day: `Day ${index + 1}`,
      projection: Math.round(item.projected),
      date: item.date.toLocaleDateString()
    }));
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Executive Dashboard</span>
              </CardTitle>
              <CardDescription>
                Simplified financial metrics and cash flow analysis
              </CardDescription>
            </div>
            <RefreshIndicator 
              lastRefreshTime={lastRefresh} 
              onRefresh={handleRefresh}
              isLoading={isRefreshing}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Time Period Controls */}
      <div className="flex items-center space-x-4">
        <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue.amount)}</p>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metrics.totalRevenue.trend)}`}>
                  {getTrendIcon(metrics.totalRevenue.trend)}
                  <span>{metrics.totalRevenue.trend.percentage.toFixed(1)}%</span>
                  <span className="text-muted-foreground">vs prev period</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalPayments.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.totalPayments.categoryBreakdown.length} categories
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                <p className={`text-3xl font-bold ${metrics.netCashFlow.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netCashFlow.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {timePeriod} {dateRange.replace('_', ' ')}
                </p>
              </div>
              <div className={`h-12 w-12 ${metrics.netCashFlow.amount >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <DollarSign className={`h-6 w-6 ${metrics.netCashFlow.amount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.currentBalance.total)}</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.currentBalance.byAccount.length} accounts
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projection">Cash Flow Projection</TabsTrigger>
          <TabsTrigger value="breakdown">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="accounts">Account Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="projection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Cash Flow Projection</CardTitle>
              <CardDescription>
                Projected daily cash flow based on historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Projected']} />
                    <Area 
                      type="monotone" 
                      dataKey="projection" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
              <CardDescription>
                Top spending categories for selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.totalPayments.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(category.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
              <CardDescription>
                Current balances across all accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.currentBalance.byAccount.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{account.accountName}</p>
                      <Badge variant="outline" className="text-xs">
                        {account.accountType}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedExecutiveDashboard;