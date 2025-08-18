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

// ---------------------- Demo Data Generation ----------------------
const generateDemoData = (period: string) => {
  const now = new Date();
  const data = [];
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  let dataPoints = 730; // default to 2 years daily
  let actualCutoff = 365; // 1 year of actuals
  let dateIncrement: (date: Date, index: number) => Date;

  switch (period) {
    case "weekly":
      dataPoints = 104; // 2 years of weeks
      actualCutoff = 52; // 1 year
      dateIncrement = (date, i) => addWeeks(date, i);
      break;
    case "monthly":
      dataPoints = 24; // 2 years
      actualCutoff = 12;
      dateIncrement = (date, i) => addMonths(date, i);
      break;
    case "quarterly":
      dataPoints = 8; // 2 years
      actualCutoff = 4;
      dateIncrement = (date, i) => addQuarters(date, i);
      break;
    default: // daily
      dataPoints = 730; // 2 years
      actualCutoff = 365; // 1 year actuals
      dateIncrement = (date, i) => addDays(date, i);
  }

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

  // Rolling variance analysis: last 3 months actuals, next 6 months forecast
  const getAccuracyData = () => {
    const today = new Date();
    const threeMonthsAgo = dfAddMonths(today, -3);
    const sixMonthsAhead = dfAddMonths(today, 6);

    const actualData = data.filter((d) => d.isActual && new Date(d.date) >= threeMonthsAgo && new Date(d.date) <= today);
    const forecastData = data.filter((d) => !d.isActual && new Date(d.date) > today && new Date(d.date) <= sixMonthsAhead);

    return actualData.map((a) => {
      const f = forecastData.find((f) => f.formattedDate === a.formattedDate);
      const variance = f ? (Math.abs(a.balance - f.balance) / a.balance) * 100 : 0;
      return {
        date: a.formattedDate,
        actual: a.balance,
        forecast: f?.balance ?? a.balance,
        variance: Math.round(variance * 100) / 100,
        accuracy: Math.max(0, 100 - variance),
      };
    });
  };

  const currentBalance = data[29]?.balance || 150000;
  const forecastBalance = data[data.length - 90]?.balance || 175000;
  const accuracy = "99.2%";

  const chartConfig: ChartConfig = {
    actualBalance: { label: "Actual Balance", color: "hsl(var(--chart-1))" },
    forecastBalance: { label: "Forecast Balance", color: "hsl(var(--chart-2))" },
  };

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

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Cash Flow Forecast - 2 Years (Actuals vs Forecasts)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
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
        </Tabs>
      )}
    </div>
  );
});

DemoVideo.displayName = "DemoVideo";
export default DemoVideo;