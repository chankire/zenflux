import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, DollarSign, Calendar, Target, Video, BarChart3, Calculator } from "lucide-react";
import { format, addDays, addWeeks, addMonths, addQuarters } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

// Demo data generation (no changes needed here)
const generateDemoData = (period: string) => {
  const now = new Date();
  const data = [];
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  
  let dataPoints = 540;
  let dateIncrement: (date: Date, index: number) => Date;
  let actualCutoff = 365;
  
  switch (period) {
    case "weekly":
      dataPoints = 78; actualCutoff = 52; dateIncrement = (date, i) => addWeeks(date, i); break;
    case "monthly":
      dataPoints = 18; actualCutoff = 12; dateIncrement = (date, i) => addMonths(date, i); break;
    case "quarterly":
      dataPoints = 6; actualCutoff = 4; dateIncrement = (date, i) => addQuarters(date, i); break;
    default:
      dataPoints = 540; actualCutoff = 365; dateIncrement = (date, i) => addDays(date, i);
  }
  
  for (let i = 0; i < dataPoints; i++) {
    const date = dateIncrement(now, i);
    const isActual = i < actualCutoff;
    const baseFlow = 150000 + Math.sin(i / 30) * 25000 + (Math.random() - 0.5) * 15000;
    const actualBalance = Math.round(baseFlow + i * 300);
    const forecastBalance = Math.round(actualBalance * (0.95 + Math.random() * 0.1));
    const categoryData: any = {
      date: date.toISOString().split('T')[0],
      formattedDate: formatDateForPeriod(date, period),
      actualBalance: isActual ? actualBalance : null,
      forecastBalance: !isActual ? forecastBalance : null,
      balance: isActual ? actualBalance : forecastBalance,
      isActual,
      confidence: isActual ? 1.0 : Math.max(0.70, 0.95 - (i - actualCutoff) * 0.002),
      workingCapital: Math.round((actualBalance * 0.15) + (Math.random() - 0.5) * 10000),
      currentRatio: 1.2 + (Math.random() - 0.5) * 0.4,
      quickRatio: 0.8 + (Math.random() - 0.5) * 0.3,
    };
    categories.forEach((cat, idx) => {
      const baseAmount = 8000 + idx * 3000;
      categoryData[cat] = Math.round(baseAmount * (isActual ? 1 : 0.85 + Math.random() * 0.3));
    });
    data.push(categoryData);
  }
  return data;
};

const formatDateForPeriod = (date: Date, period: string) => {
  switch (period) {
    case "weekly": return format(date, "MMM dd");
    case "monthly": return format(date, "MMM yyyy");
    case "quarterly": return `Q${Math.ceil((date.getMonth() + 1) / 3)} ${format(date, "yyyy")}`;
    default: return format(date, "MMM dd");
  }
};

const transactionData = [
  { id: 1, date: "2025-08-15", description: "Client Payment - ABC Corp", amount: 45000, category: "Revenue", type: "inflow" },
  { id: 2, date: "2025-08-14", description: "Office Rent", amount: -8500, category: "Operations", type: "outflow" },
  { id: 3, date: "2025-08-14", description: "Marketing Campaign", amount: -3200, category: "Marketing", type: "outflow" },
  { id: 4, date: "2025-08-13", description: "Payroll Processing", amount: -22000, category: "Payroll", type: "outflow" },
  { id: 5, date: "2025-08-12", description: "Software Subscriptions", amount: -1200, category: "Operations", type: "outflow" },
];

const chartConfig = {
  actualBalance: { label: "Actual Balance", color: "hsl(214, 84%, 56%)" },
  forecastBalance: { label: "Forecast Balance", color: "hsl(280, 84%, 56%)" },
  workingCapital: { label: "Working Capital", color: "hsl(143, 64%, 24%)" },
  Revenue: { label: "Revenue", color: "hsl(214, 84%, 56%)" },
  Operations: { label: "Operations", color: "hsl(143, 64%, 24%)" },
  Marketing: { label: "Marketing", color: "hsl(280, 84%, 56%)" },
  Payroll: { label: "Payroll", color: "hsl(35, 84%, 56%)" },
  Travel: { label: "Travel", color: "hsl(0, 84%, 60%)" },
};

const DemoVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [period, setPeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState("forecast");
  const [showVideo, setShowVideo] = useState(false);
  const [data, setData] = useState(generateDemoData("daily"));
  const { formatCurrency } = useCurrency();

  const steps = [
    "Loading transaction data...",
    "Analyzing cash flow patterns...",
    "Categorizing transactions...",
    "Running AI forecast model...",
    "Generating 99.2% accuracy forecast...",
    "Complete - Interactive dashboard ready!"
  ];

  const startFullDemo = () => {
    console.log('Demo triggered by event listener');
    setCurrentStep(0);
    setIsPlaying(true);
  };

  // --- THIS IS THE FIX ---
  // Listen for the global event dispatched from the Hero component.
  useEffect(() => {
    window.addEventListener('start-zenflux-demo', startFullDemo);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('start-zenflux-demo', startFullDemo);
    };
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    setData(generateDemoData(period));
  }, [period]);

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const startDemo = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  const getAccuracyData = () => {
    const actualData = data.filter(d => d.isActual);
    const forecastData = data.filter(d => !d.isActual);
    const overlapPeriod = actualData.slice(-30);
    return overlapPeriod.map((actual, idx) => {
      const correspondingForecast = forecastData[idx];
      const variance = correspondingForecast ? Math.abs(actual.balance - correspondingForecast.balance) / actual.balance * 100 : 0;
      return {
        date: actual.formattedDate,
        actual: actual.balance,
        forecast: correspondingForecast?.balance || actual.balance,
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
            onClick={startDemo}
            disabled={currentStep >= steps.length - 1 && !isPlaying}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? "Pause Demo" : "Start Demo"}
          </Button>
          <Button onClick={resetDemo} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={toggleVideo} variant="secondary">
            <Video className="w-4 h-4 mr-2" />
            {showVideo ? "Hide Video" : "Watch Video"}
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

      {showVideo && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Product Demo Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=1"
                  title="ZenFlux Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Cards with stats */}
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
          {/* TabsContent sections */}
        </Tabs>
      )}
    </div>
  );
};

export default DemoVideo;
