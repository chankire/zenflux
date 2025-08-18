"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { RotateCcw, TrendingUp, DollarSign, Calendar, Target, BarChart3, Calculator } from "lucide-react";
import { format, addDays, addWeeks, addMonths, addQuarters } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

export type DemoVideoHandle = { startDemoFromHero: () => void };

const formatDateForPeriod = (date: Date, period: string) => {
  switch (period) {
    case "weekly": return format(date, "MMM dd");
    case "monthly": return format(date, "MMM yyyy");
    case "quarterly": return `Q${Math.ceil((date.getMonth() + 1) / 3)} ${format(date, "yyyy")}`;
    default: return format(date, "MMM dd");
  }
};

const generateDemoData = (period: string) => {
  const now = new Date();
  const data: any[] = [];
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  let dataPoints = 540, actualCutoff = 365;
  let dateIncrement: (d: Date, i: number) => Date = (d, i) => addDays(d, i);
  if (period === "weekly") { dataPoints = 78; actualCutoff = 52; dateIncrement = (d,i)=>addWeeks(d,i); }
  if (period === "monthly") { dataPoints = 18; actualCutoff = 12; dateIncrement = (d,i)=>addMonths(d,i); }
  if (period === "quarterly") { dataPoints = 6; actualCutoff = 4; dateIncrement = (d,i)=>addQuarters(d,i); }

  for (let i = 0; i < dataPoints; i++) {
    const date = dateIncrement(now, i);
    const isActual = i < actualCutoff;
    const baseFlow = 150000 + Math.sin(i / 30) * 25000 + (Math.random() - 0.5) * 15000;
    const actualBalance = Math.round(baseFlow + i * 300);
    const forecastBalance = Math.round(actualBalance * (0.95 + Math.random() * 0.1));
    const row: any = {
      date: date.toISOString().split("T")[0],
      formattedDate: formatDateForPeriod(date, period),
      actualBalance: isActual ? actualBalance : null,
      forecastBalance: !isActual ? forecastBalance : null,
      balance: isActual ? actualBalance : forecastBalance,
      isActual,
      confidence: isActual ? 1 : Math.max(0.7, 0.95 - (i - actualCutoff) * 0.002),
      workingCapital: Math.round(actualBalance * 0.15 + (Math.random() - 0.5) * 10000),
      currentRatio: 1.2 + (Math.random() - 0.5) * 0.4,
      quickRatio: 0.8 + (Math.random() - 0.5) * 0.3,
    };
    categories.forEach((cat, idx) => {
      const baseAmount = 8000 + idx * 3000;
      row[cat] = Math.round(baseAmount * (isActual ? 1 : 0.85 + Math.random() * 0.3));
    });
    data.push(row);
  }
  return data;
};

const transactionData = [
  { id: 1, date: "2025-08-15", description: "Client Payment - ABC Corp", amount: 45000, category: "Revenue", type: "inflow" },
  { id: 2, date: "2025-08-14", description: "Office Rent", amount: -8500, category: "Operations", type: "outflow" },
  { id: 3, date: "2025-08-14", description: "Marketing Campaign", amount: -3200, category: "Marketing", type: "outflow" },
  { id: 4, date: "2025-08-13", description: "Payroll Processing", amount: -22000, category: "Payroll", type: "outflow" },
  { id: 5, date: "2025-08-12", description: "Software Subscriptions", amount: -1200, category: "Operations", type: "outflow" },
  { id: 6, date: "2025-08-11", description: "Client Payment - XYZ Ltd", amount: 32000, category: "Revenue", type: "inflow" },
  { id: 7, date: "2025-08-10", description: "Travel Expenses", amount: -2800, category: "Travel", type: "outflow" },
  { id: 8, date: "2025-08-09", description: "Conference Tickets", amount: -1500, category: "Marketing", type: "outflow" },
];

const chartConfig = {
  balance: { label: "Cash Balance", color: "hsl(214, 84%, 56%)" },
  actualBalance: { label: "Actual Balance", color: "hsl(214, 84%, 56%)" },
  forecastBalance: { label: "Forecast Balance", color: "hsl(280, 84%, 56%)" },
  workingCapital: { label: "Working Capital", color: "hsl(143, 64%, 24%)" },
  confidence: { label: "Confidence", color: "hsl(143, 64%, 24%)" },
  Revenue: { label: "Revenue", color: "hsl(214, 84%, 56%)" },
  Operations: { label: "Operations", color: "hsl(143, 64%, 24%)" },
  Marketing: { label: "Marketing", color: "hsl(280, 84%, 56%)" },
  Payroll: { label: "Payroll", color: "hsl(35, 84%, 56%)" },
  Travel: { label: "Travel", color: "hsl(0, 84%, 60%)" },
};

const DemoVideo = forwardRef<DemoVideoHandle, {}>((props, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [period, setPeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState("forecast");
  const [data, setData] = useState(generateDemoData("daily"));
  const { formatCurrency } = useCurrency();

  const steps = [
    "Loading transaction data...",
    "Analyzing cash flow patterns...",
    "Categorizing transactions...",
    "Running AI forecast model...",
    "Generating 99.2% accuracy forecast...",
    "Complete - Interactive dashboard ready!",
  ];

  useImperativeHandle(ref, () => ({
    startDemoFromHero: () => {
      setActiveTab("forecast");
      setPeriod("daily");
      setCurrentStep(0);
      setIsPlaying(true);
    },
  }), []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => setCurrentStep((p) => p + 1), 1500);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => interval && clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    setData(generateDemoData(period));
  }, [period]);

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const startOrPause = () => {
    setIsPlaying((p) => !p);
    if (!isPlaying) setCurrentStep(0);
  };

  const currentBalance = data[29]?.balance || 150000;
  const forecastBalance = data[data.length - 90]?.balance || 175000;

  const getAccuracyData = () => {
    const actualData = data.filter((d) => d.isActual);
    const forecastData = data.filter((d) => !d.isActual);
    const overlap = actualData.slice(-30);
    return overlap.map((actual, idx) => {
      const f = forecastData[idx];
      const variance = f ? (Math.abs(actual.balance - f.balance) / actual.balance) * 100 : 0;
      return {
        date: actual.formattedDate,
        actual: actual.balance,
        forecast: f?.balance ?? actual.balance,
        variance: Math.round(variance * 100) / 100,
        accuracy: Math.max(0, 100 - variance),
      };
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-card rounded-2xl border border-border shadow-elegant">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">ZenFlux Live Demo</h3>
        <p className="text-muted-foreground">AI-Powered Cash Flow Forecasting in Action</p>

        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            onClick={startOrPause}
            disabled={currentStep >= steps.length - 1 && !isPlaying}
            className="bg-gradient-primary hover:opacity-90"
            data-demo-start="true"
          >
            {isPlaying ? "Pause Demo" : "Start Demo"}
          </Button>
          <Button onClick={resetDemo} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {currentStep < steps.length && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-primary font-medium">{steps[currentStep]}</p>
            <div className="w-full bg-border rounded-full h-2 mt-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {currentStep >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(currentBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">90-Day Forecast</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(forecastBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-xl font-bold text-foreground">99.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-full mt-1">
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep >= 4 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
            <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
            <TabsTrigger value="accuracy">Forecast Accuracy</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Details</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Cash Flow Forecast - 1.5 Years (Actuals vs Forecasts)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="formattedDate" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="actualBalance" stroke={chartConfig.actualBalance.color} strokeWidth={3} dot={{ fill: chartConfig.actualBalance.color, strokeWidth: 2, r: 3 }} connectNulls={false} />
                      <Line type="monotone" dataKey="forecastBalance" stroke={chartConfig.forecastBalance.color} strokeWidth={2} strokeDasharray="5 5" dot={{ fill: chartConfig.forecastBalance.color, strokeWidth: 2, r: 2 }} connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ...the rest of your TabsContent (categories, working-capital, accuracy, transactions) unchanged... */}
          <TabsContent value="categories" className="space-y-4">{/* (unchanged) */}</TabsContent>
          <TabsContent value="working-capital" className="space-y-4">{/* (unchanged) */}</TabsContent>
          <TabsContent value="accuracy" className="space-y-4">{/* (unchanged) */}</TabsContent>
          <TabsContent value="transactions" className="space-y-4">{/* (unchanged) */}</TabsContent>
        </Tabs>
      )}

      {currentStep >= steps.length - 1 && (
        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20 text-center">
          <p className="text-accent font-medium mb-2">✅ Demo Complete!</p>
          <p className="text-muted-foreground text-sm">
            Experience real-time cash flow forecasting with 99.2% accuracy powered by advanced AI models.
          </p>
        </div>
      )}
    </div>
  );
});

DemoVideo.displayName = "DemoVideo";
export default DemoVideo;
