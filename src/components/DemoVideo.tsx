import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, DollarSign, Calendar, Target, BarChart3, Calculator, Home, Bot, Settings } from "lucide-react";
import { format, addDays, addWeeks, addMonths, addQuarters, addMonths as dfAddMonths } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ExecutiveDashboard from "@/components/ExecutiveDashboard";
import GenAICopilot from "@/components/GenAICopilot";
import ScenarioPlanning from "@/components/ScenarioPlanning";
import DataUploadExport from "@/components/DataUploadExport";
import { useNavigate } from "react-router-dom";

// ---------------------- Demo Data Generation ----------------------
const generateTransactionData = (period: string) => {
  const transactions = [];
  const now = new Date();
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  const descriptions = {
    Revenue: ["Client Payment - ABC Corp", "Subscription Revenue", "Project Milestone", "Consulting Services"],
    Operations: ["Office Rent", "Utilities", "Insurance", "Software Subscriptions"],
    Marketing: ["Digital Advertising", "Conference Tickets", "Marketing Campaign", "Content Creation"],
    Payroll: ["Payroll Processing", "Employee Benefits", "Contractor Payments", "Bonus Payments"],
    Travel: ["Travel Expenses", "Hotel Accommodation", "Flight Tickets", "Taxi & Transport"]
  };

  for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const isRevenue = category === "Revenue";
    const amount = isRevenue 
      ? Math.floor(Math.random() * 50000) + 10000
      : Math.floor(Math.random() * 15000) + 500;
    
    const date = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: `txn-${i}`,
      date: date.toISOString().split('T')[0],
      description: descriptions[category][Math.floor(Math.random() * descriptions[category].length)],
      category,
      amount: isRevenue ? amount : -amount,
      type: isRevenue ? "inflow" : "outflow"
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateDemoData = (period: string) => {
  const now = new Date();
  const data = [];
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  
  // Rolling window: 3 months back for actuals, 6 months forward for forecasts
  const threeMonthsAgo = dfAddMonths(now, -3);
  const sixMonthsAhead = dfAddMonths(now, 6);
  
  let dataPoints: number;
  let dateIncrement: (date: Date, index: number) => Date;
  let startDate: Date;

  switch (period) {
    case "weekly":
      dataPoints = Math.ceil(39 / 7); // ~9 months in weeks
      startDate = threeMonthsAgo;
      dateIncrement = (date, i) => addWeeks(date, i);
      break;
    case "monthly":
      dataPoints = 9; // 3 months past + 6 months future
      startDate = threeMonthsAgo;
      dateIncrement = (date, i) => addMonths(date, i);
      break;
    case "quarterly":
      dataPoints = 3; // 1 quarter past + 2 quarters future
      startDate = dfAddMonths(now, -3);
      dateIncrement = (date, i) => addQuarters(date, i);
      break;
    default: // daily
      dataPoints = Math.ceil((sixMonthsAhead.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24));
      startDate = threeMonthsAgo;
      dateIncrement = (date, i) => addDays(date, i);
  }

  for (let i = 0; i < dataPoints; i++) {
    const date = dateIncrement(startDate, i);
    const isActual = date <= now;
    const baseFlow = 150000 + Math.sin(i / 30) * 25000 + (Math.random() - 0.5) * 15000;
    const actualBalance = Math.round(baseFlow + i * 300);
    const forecastBalance = Math.round(actualBalance * (0.95 + Math.random() * 0.1));
    const baseForWC = isActual ? actualBalance : forecastBalance;
    const currentAssets = Math.max(0, Math.round(baseForWC * (0.6 + (Math.random() - 0.5) * 0.05)));
    const currentLiabilities = Math.max(1, Math.round(baseForWC * (0.45 + (Math.random() - 0.5) * 0.05)));

    // Calculate variance for past data
    let variance = null;
    let accuracy = null;
    if (isActual) {
      const predicted = Math.round(actualBalance * (0.97 + Math.random() * 0.06)); // 97% avg accuracy
      variance = Math.abs((actualBalance - predicted) / actualBalance) * 100;
      accuracy = Math.max(0, 100 - variance);
    }

    const row: any = {
      date: date.toISOString().split("T")[0],
      formattedDate: formatDateForPeriod(date, period),
      actualBalance: isActual ? actualBalance : null,
      forecastBalance: !isActual ? forecastBalance : null,
      balance: isActual ? actualBalance : forecastBalance,
      isActual,
      variance,
      accuracy,
      confidence: isActual ? 1 : Math.max(0.7, 0.95 - (i * 0.002)),
      currentAssets,
      currentLiabilities,
      workingCapital: currentAssets - currentLiabilities,
      currentRatio: Number((currentAssets / currentLiabilities).toFixed(2)),
      quickRatio: Number((0.8 + (Math.random() - 0.5) * 0.3).toFixed(2)),
    };

    categories.forEach((cat, idx) => {
      const base = 8000 + idx * 3000;
      row[cat] = Math.round(base * (isActual ? 1 : 0.85 + Math.random() * 0.3));
    });

    data.push(row);
  }
  return data;
};

const formatDateForPeriod = (date: Date, period: string) => {
  switch (period) {
    case "weekly":
      return format(date, "MMM dd");
    case "monthly":
      return format(date, "MMM yyyy");
    case "quarterly":
      return `Q${Math.ceil((date.getMonth() + 1) / 3)} ${format(date, "yyyy")}`;
    default:
      return format(date, "MMM dd");
  }
};

// ---------------------- Demo Component ----------------------
const DemoVideo = forwardRef<{ reset: () => void; startDemoFromHero: () => void }>((_, ref) => {
  const navigate = useNavigate();
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [period, setPeriod] = useState("monthly");
  const [currentTab, setCurrentTab] = useState("executive");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactions, setTransactions] = useState(() => generateTransactionData("monthly"));
  const { formatCurrency } = useCurrency();

  const data = generateDemoData(period);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setCurrentTab("executive");
      setSelectedCategory(null);
      setIsDemoActive(false);
    },
    startDemoFromHero: () => {
      console.log('Demo started from Hero button');
      setIsDemoActive(true);
    }
  }));

  const handleDataUpdate = (newTransactions: any[]) => {
    setTransactions(newTransactions);
  };

  const goHome = () => {
    navigate('/');
  };

  const categoryChartData = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"].map((cat) => ({
    category: cat,
    amount: data.filter(d => d.isActual).reduce((sum, d) => sum + d[cat], 0),
    forecast: data.filter(d => !d.isActual).reduce((sum, d) => sum + d[cat], 0),
  }));

  const chartConfig: ChartConfig = {
    Revenue: { label: "Revenue", color: "hsl(214, 84%, 56%)" },
    Operations: { label: "Operations", color: "hsl(142, 71%, 45%)" },
    Marketing: { label: "Marketing", color: "hsl(47, 96%, 53%)" },
    Payroll: { label: "Payroll", color: "hsl(280, 84%, 56%)" },
    Travel: { label: "Travel", color: "hsl(25, 95%, 53%)" },
  };

  const filteredTransactions = selectedCategory 
    ? transactions.filter(t => t.category === selectedCategory)
    : transactions;

  const getCategoryColor = (category: string) => {
    const colorMap = {
      Revenue: "bg-primary text-primary-foreground",
      Operations: "bg-accent text-accent-foreground", 
      Marketing: "bg-amber-500 text-white",
      Payroll: "bg-purple-600 text-white",
      Travel: "bg-orange-500 text-white"
    };
    return colorMap[category] || "bg-muted text-muted-foreground";
  };

  const getTypeColor = (type: string) => {
    return type === "inflow" ? "text-accent" : "text-destructive";
  };

  // Rolling window: last 3 months and next 6 months
  const today = new Date();
  const threeMonthsAgo = dfAddMonths(today, -3);
  const sixMonthsAhead = dfAddMonths(today, 6);
  const windowAll = data.filter((d) => new Date(d.date) >= threeMonthsAgo && new Date(d.date) <= sixMonthsAhead);

  const accuracyData = windowAll.slice(0, 20).map((row, idx) => {
    if (row.isActual) {
      // Only show variance and accuracy for actual data (past dates)
      const predicted = Math.round(row.actualBalance * (0.97 + Math.random() * 0.06));
      const variance = Math.abs((row.actualBalance - predicted) / row.actualBalance) * 100;
      return {
        ...row,
        predicted,
        variance,
        accuracy: Math.max(0, 100 - variance)
      };
    } else {
      // For future dates (forecasts), don't show variance and accuracy since they can't be calculated yet
      return {
        ...row,
        predicted: row.forecastBalance,
        variance: null,
        accuracy: null
      };
    }
  });

  if (!isDemoActive) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-card rounded-2xl border border-border shadow-elegant text-center">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Experience ZenFlux?</h3>
            <p className="text-muted-foreground mb-6">
              Click "Watch Demo" above to explore our comprehensive Finance AI Analytics Platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Real-time Cash Flow Forecasting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Multi-Currency Forex Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-glow rounded-full" />
                  <span>Executive Dashboard Overview</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Interactive Category Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Working Capital Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-glow rounded-full" />
                  <span>AI Forecast Accuracy Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-card rounded-2xl border border-border shadow-elegant">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">FinanceAI Analytics Platform</h3>
        <p className="text-muted-foreground">Comprehensive Financial Analytics and Forecasting</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">ZenFlux Analytics Demo</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goHome}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => setIsDemoActive(false)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Exit Demo
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1 p-1 h-auto">
          <TabsTrigger value="executive" className="text-xs lg:text-sm px-2 py-1.5">Executive</TabsTrigger>
          <TabsTrigger value="overview" className="text-xs lg:text-sm px-2 py-1.5">Cash Flow</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs lg:text-sm px-2 py-1.5">Categories</TabsTrigger>
          <TabsTrigger value="working" className="text-xs lg:text-sm px-2 py-1.5">Working Capital</TabsTrigger>
          <TabsTrigger value="accuracy" className="text-xs lg:text-sm px-2 py-1.5">Accuracy</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs lg:text-sm px-2 py-1.5">Transactions</TabsTrigger>
          <TabsTrigger value="copilot" className="text-xs lg:text-sm px-2 py-1.5">AI Copilot</TabsTrigger>
          <TabsTrigger value="scenario" className="text-xs lg:text-sm px-2 py-1.5">Scenarios</TabsTrigger>
          <TabsTrigger value="data" className="text-xs lg:text-sm px-2 py-1.5">Data Mgmt</TabsTrigger>
        </TabsList>

        {/* Executive Dashboard */}
        <TabsContent value="executive" className="mt-6">
          <ExecutiveDashboard 
            period={period} 
            onPeriodChange={setPeriod}
          />
        </TabsContent>

        {/* Cash Flow Forecast */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Cash Flow Forecast — Rolling Window (Past 3 Months & Next 6 Months)
                </CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Blue line: Actual cash positions (past 3 months). Purple dashed line: AI-generated forecasts (next 6 months). 
                Forecast accuracy starts at 97% and gradually decreases for longer horizons.
              </p>
              <ChartContainer
                config={{
                  actualBalance: { label: "Actual Balance", color: "hsl(214, 84%, 56%)" },
                  forecastBalance: { label: "Forecast Balance", color: "hsl(280, 84%, 56%)" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={windowAll}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="actualBalance"
                      stroke="hsl(214, 84%, 56%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(214, 84%, 56%)", strokeWidth: 2, r: 3 }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastBalance"
                      stroke="hsl(280, 84%, 56%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(280, 84%, 56%)", strokeWidth: 2, r: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Analysis */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Analysis — Interactive Breakdown
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on any category bar to view detailed transactions for that category
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} onClick={(data) => {
                    if (data && data.activePayload) {
                      const category = data.activePayload[0]?.payload?.category;
                      setSelectedCategory(category === selectedCategory ? null : category);
                    }
                  }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {categoryChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.category === selectedCategory ? "hsl(214, 84%, 70%)" : chartConfig[entry.category]?.color}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {selectedCategory && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Selected Category: {selectedCategory}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}

              {/* Transaction Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedCategory ? `${selectedCategory} Transactions` : 'Recent Transactions'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory ? 
                      `Showing transactions for ${selectedCategory} category` :
                      'All recent transactions across categories'
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.slice(0, 20).map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {format(new Date(transaction.date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <Badge className={getCategoryColor(transaction.category)}>
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${getTypeColor(transaction.type)}`}>
                              {transaction.amount > 0 ? '+' : ''}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === "inflow" ? "default" : "secondary"}>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found for the selected category
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Capital */}
        <TabsContent value="working" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Working Capital — Rolling Window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Formula: <span className="font-medium text-foreground">Working Capital = Current Assets − Current Liabilities</span>.
                For demo data, Current Assets are ~60% of balance and Current Liabilities are ~45% (with slight variation).
              </p>
              <ChartContainer
                config={{
                  currentAssets: { label: "Current Assets", color: "hsl(214, 84%, 56%)" },
                  currentLiabilities: { label: "Current Liabilities", color: "hsl(0, 84%, 56%)" },
                  workingCapital: { label: "Working Capital", color: "hsl(142, 71%, 45%)" },
                }}
                className="h-[380px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={windowAll}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="formattedDate" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="currentAssets" stroke="hsl(214, 84%, 56%)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="currentLiabilities" stroke="hsl(0, 84%, 56%)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="workingCapital" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Accuracy */}
        <TabsContent value="accuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Forecast Accuracy — Actuals vs Backcast Prediction (Last 3 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-sm text-muted-foreground">
                 Past 3 months: Actual vs predicted values showing ~97% accuracy. Future 6 months: Projected accuracy declining from 97% to 85% over time.
               </p>
              <ChartContainer
                config={{
                  actualBalance: { label: "Actual", color: "hsl(214, 84%, 56%)" },
                  predicted: { label: "Predicted", color: "hsl(280, 84%, 56%)" },
                }}
                className="h-[360px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="formattedDate" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="actualBalance" stroke="hsl(214, 84%, 56%)" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="predicted" stroke="hsl(280, 84%, 56%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction Details */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Forecast Accuracy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Forecast</TableHead>
                      <TableHead className="text-right">Variance %</TableHead>
                      <TableHead className="text-right">Accuracy %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accuracyData.map((row, idx) => (
                      <TableRow key={`${row.date}-${idx}`}>
                        <TableCell className="font-medium">{row.formattedDate}</TableCell>
                        <TableCell className="text-right">
                          {row.actualBalance ? (
                            <span className="text-blue-600 font-medium">
                              {formatCurrency(row.actualBalance)}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.predicted ? (
                            <span className="text-purple-600 font-medium">
                              {formatCurrency(row.predicted)}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.variance !== null ? (
                            <span className={`font-medium ${
                              row.variance > 10 ? "text-red-600" : 
                              row.variance > 5 ? "text-orange-600" : 
                              "text-green-600"
                            }`}>
                              {row.variance.toFixed(1)}%
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.accuracy !== null ? (
                            <span className={`font-medium ${
                              row.accuracy >= 95 ? "text-green-600" :
                              row.accuracy >= 90 ? "text-blue-600" :
                              "text-orange-600"
                            }`}>
                              {row.accuracy.toFixed(1)}%
                            </span>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copilot">
          <GenAICopilot 
            data={data} 
            transactions={transactions} 
            period={period} 
          />
        </TabsContent>

        <TabsContent value="scenario">
          <ScenarioPlanning 
            data={data} 
            period={period} 
          />
        </TabsContent>

        <TabsContent value="data">
          <DataUploadExport 
            transactions={transactions} 
            data={data} 
            onDataUpdate={handleDataUpdate} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

DemoVideo.displayName = "DemoVideo";
export default DemoVideo;