import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, DollarSign, Calendar, Target, BarChart3, Calculator } from "lucide-react";
import { format, addDays, addWeeks, addMonths, addQuarters, addMonths as dfAddMonths } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ---------------------- Demo Data Generation ----------------------
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
const DemoVideo = forwardRef<any, {}>((props, ref) => {
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
    "Generating forecast with high accuracy...",
    "Complete - Interactive dashboard ready!",
  ];

  useImperativeHandle(ref, () => ({
    startDemoFromHero: () => {
      setCurrentStep(0);
      setIsPlaying(true);
    },
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => setCurrentStep((prev) => prev + 1), 1500);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => interval && clearInterval(interval);
  }, [isPlaying, currentStep]);

  useEffect(() => {
    setData(generateDemoData(period));
  }, [period]);

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Generate forecast accuracy data with 97% average accuracy for past 3 months
  const getAccuracyData = () => {
    const today = new Date();
    const threeMonthsAgo = dfAddMonths(today, -3);
    const sixMonthsAhead = dfAddMonths(today, 6);

    // Past 3 months - actual vs predicted with ~97% accuracy
    const historical = data.filter(
      (d) => d.isActual && new Date(d.date) >= threeMonthsAgo && new Date(d.date) <= today
    );

    const pastAccuracy = historical.map((a, i) => {
      // Generate predicted values with ~97% accuracy (3% variance)
      const variance = 1.5 + Math.random() * 3; // 1.5% to 4.5% variance
      const predicted = Math.round(a.balance * (1 + (Math.random() - 0.5) * (variance / 100)));
      const actualVariance = Math.abs((a.balance || 0) - predicted) / Math.max(1, a.balance || 1) * 100;
      
      return {
        date: a.formattedDate,
        actual: a.balance,
        predicted,
        variance: Math.round(actualVariance * 100) / 100,
        accuracy: Math.max(0, 100 - actualVariance),
        type: 'past'
      };
    });

    // Future 6 months - forecast accuracy projections
    const future = data.filter(
      (d) => !d.isActual && new Date(d.date) > today && new Date(d.date) <= sixMonthsAhead
    );

    const futureAccuracy = future.slice(0, Math.min(future.length, 30)).map((f, i) => {
      // Project decreasing accuracy over time (95% to 85%)
      const projectedAccuracy = Math.max(85, 97 - (i * 0.4));
      const variance = 100 - projectedAccuracy;
      const predicted = Math.round(f.balance * (1 + (Math.random() - 0.5) * (variance / 100)));
      
      return {
        date: f.formattedDate,
        actual: null, // No actuals for future
        predicted: f.balance,
        variance: Math.round(variance * 100) / 100,
        accuracy: projectedAccuracy,
        type: 'forecast'
      };
    });

    return [...pastAccuracy, ...futureAccuracy];
  };

  const currentBalance = data[29]?.balance || 150000;
  const forecastBalance = data[data.length - 90]?.balance || 175000;
  const accuracy = "99.2%";

  const chartConfig: ChartConfig = {
    actualBalance: { label: "Actual Balance", color: "hsl(214, 84%, 56%)" },
    forecastBalance: { label: "Forecast Balance", color: "hsl(280, 84%, 56%)" },
  };

  // Rolling window: last 3 months and next 6 months
  const today = new Date();
  const threeMonthsAgo = dfAddMonths(today, -3);
  const sixMonthsAhead = dfAddMonths(today, 6);

  const windowPast = data.filter((d) => new Date(d.date) >= threeMonthsAgo && new Date(d.date) <= today);
  const windowFuture = data.filter((d) => new Date(d.date) > today && new Date(d.date) <= sixMonthsAhead);
  const windowAll = data.filter((d) => new Date(d.date) >= threeMonthsAgo && new Date(d.date) <= sixMonthsAhead);

  // Category comparison data with realistic variations
  const categoryNames = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const categoryComparison = categoryNames.map((name, idx) => {
    const past = windowPast.map((d: any) => d[name]).filter((v: any) => typeof v === "number") as number[];
    const future = windowFuture.map((d: any) => d[name]).filter((v: any) => typeof v === "number") as number[];
    
    // Add realistic variations - some categories increase, others decrease
    const pastAvg = avg(past);
    const futureBase = avg(future);
    let adjustedFuture = futureBase;
    
    switch (name) {
      case "Revenue":
        adjustedFuture = futureBase * 1.15; // 15% growth expected
        break;
      case "Operations":
        adjustedFuture = futureBase * 1.08; // 8% increase
        break;
      case "Marketing":
        adjustedFuture = futureBase * 0.85; // 15% reduction
        break;
      case "Payroll":
        adjustedFuture = futureBase * 1.12; // 12% increase
        break;
      case "Travel":
        adjustedFuture = futureBase * 0.75; // 25% reduction
        break;
    }
    
    return { 
      category: name, 
      Past: Math.round(pastAvg), 
      Forecast: Math.round(adjustedFuture) 
    };
  });

  const accuracySeries = getAccuracyData();
  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-card rounded-2xl border border-border shadow-elegant">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">ZenFlux Live Demo</h3>
        <p className="text-muted-foreground">AI-Powered Cash Flow Forecasting in Action</p>

        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentStep >= steps.length - 1 && !isPlaying}
            className="bg-gradient-primary hover:opacity-90"
            data-demo-start="true"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
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

      {currentStep >= 4 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
            <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
            <TabsTrigger value="accuracy">Forecast Accuracy</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Details</TabsTrigger>
          </TabsList>

          {/* Forecast - Rolling window */}
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Cash Flow Forecast (Past 3 Months & Next 6 Months)
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
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
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
                  Category Analysis — Avg Past 3 Months vs Next 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    Past: { label: "Past 3 Months Avg", color: "hsl(214, 84%, 56%)" },
                    Forecast: { label: "Next 6 Months Avg", color: "hsl(280, 84%, 56%)" },
                  }}
                  className="h-[360px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="Past" fill="hsl(214, 84%, 56%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Forecast" fill="hsl(280, 84%, 56%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Working Capital */}
          <TabsContent value="working-capital" className="space-y-4">
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
                    actual: { label: "Actual", color: "hsl(214, 84%, 56%)" },
                    predicted: { label: "Predicted", color: "hsl(280, 84%, 56%)" },
                  }}
                  className="h-[360px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracySeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="actual" stroke="hsl(214, 84%, 56%)" strokeWidth={3} dot={false} />
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
                      {windowAll.slice(0, 20).map((row, idx) => {
                        let actual: number | null = null;
                        let forecast: number | null = null;
                        let variance: number | null = null;
                        let accuracy: number | null = null;

                        if (row.isActual) {
                          // Past 3 months: Show actual vs forecast variance
                          actual = row.actualBalance;
                          const predicted = Math.round(row.actualBalance * (0.97 + Math.random() * 0.06));
                          forecast = predicted;
                          variance = Math.abs((row.actualBalance - predicted) / row.actualBalance) * 100;
                          accuracy = Math.max(0, 100 - variance);
                        } else {
                          // Next 6 months: Show forecast only
                          forecast = row.forecastBalance;
                          // Project decreasing accuracy over time
                          const monthsOut = Math.floor(idx / 30 * 6);
                          accuracy = Math.max(85, 97 - (monthsOut * 2));
                          variance = 100 - accuracy;
                        }

                        return (
                          <TableRow key={`${row.date}-${idx}`}>
                            <TableCell className="font-medium">{row.formattedDate}</TableCell>
                            <TableCell className="text-right">
                              {actual ? (
                                <span className="text-blue-600 font-medium">
                                  {formatCurrency(actual)}
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {forecast ? (
                                <span className="text-purple-600 font-medium">
                                  {formatCurrency(forecast)}
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {variance !== null ? (
                                <span className={`font-medium ${
                                  variance > 10 ? "text-red-600" : 
                                  variance > 5 ? "text-orange-600" : 
                                  "text-green-600"
                                }`}>
                                  {variance.toFixed(1)}%
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {accuracy !== null ? (
                                <span className={`font-medium ${
                                  accuracy >= 95 ? "text-green-600" :
                                  accuracy >= 90 ? "text-blue-600" :
                                  "text-orange-600"
                                }`}>
                                  {accuracy.toFixed(1)}%
                                </span>
                              ) : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

    </div>
  );
});

DemoVideo.displayName = "DemoVideo";
export default DemoVideo;