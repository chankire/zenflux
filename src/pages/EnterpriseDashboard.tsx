import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, transactionsAPI } from '@/lib/api';
import { MetricCard } from '@/components/enterprise/MetricCard';
import { LoadingSpinner, LoadingSkeleton } from '@/components/enterprise/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Brain,
  Upload,
  Settings
} from 'lucide-react';
import { ForecastingInterface } from '@/components/enterprise/ForecastingInterface';
import { TransactionTable } from '@/components/enterprise/TransactionTable';
import { FileUploadInterface } from '@/components/enterprise/FileUploadInterface';

export const EnterpriseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsAPI.getDashboardMetrics,
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsAPI.getTransactions,
  });

  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <LoadingSkeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
          <LoadingSkeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5">
      {/* Header */}
      <div className="border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financial Command Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time insights and AI-powered forecasting
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Total Balance"
            value={`$${metrics?.totalBalance?.toLocaleString() || '0'}`}
            change={{ value: 12.5, period: 'last month' }}
            icon={DollarSign}
            trend="up"
          />
          <MetricCard
            title="Monthly Income"
            value={`$${metrics?.monthlyIncome?.toLocaleString() || '0'}`}
            change={{ value: 8.2, period: 'last month' }}
            icon={TrendingUp}
            trend="up"
          />
          <MetricCard
            title="Monthly Expenses"
            value={`$${metrics?.monthlyExpenses?.toLocaleString() || '0'}`}
            change={{ value: -3.1, period: 'last month' }}
            icon={TrendingDown}
            trend="down"
          />
          <MetricCard
            title="Runway"
            value={`${metrics?.runwayMonths || '0'} months`}
            change={{ value: 5.8, period: 'last quarter' }}
            icon={Calendar}
            trend="up"
          />
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm border border-border/60">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="forecasting" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Forecasting</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Data Upload</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="chart-container">
                  <CardHeader>
                    <CardTitle>Cash Flow Trend</CardTitle>
                    <CardDescription>
                      Historical and projected cash flow over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Chart will be rendered here with Recharts
                    </div>
                  </CardContent>
                </Card>

                <Card className="chart-container">
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>
                      Category-wise expense distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Pie chart will be rendered here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forecasting">
              <ForecastingInterface />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionTable transactions={transactions || []} isLoading={transactionsLoading} />
            </TabsContent>

            <TabsContent value="upload">
              <FileUploadInterface />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="metric-card p-6">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Profile Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Update your personal details and preferences
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Notification Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure alerts and email notifications
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage passwords and two-factor authentication
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};