import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, DollarSign, Calendar, Target, Video, BarChart3, Calculator } from "lucide-react";
// Using native video instead of react-player to avoid dynamic import issues
import { format, addDays, addWeeks, addMonths, addQuarters } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface DemoVideoProps {
  triggerDemo?: boolean;
}

// Demo data for the video
const generateDemoData = (period: string) => {
  const now = new Date();
  const data = [];
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  
  let dataPoints = 540; // 1.5 years of days
  let dateIncrement: (date: Date, index: number) => Date;
  let actualCutoff = 365; // 1 year of actuals
  
  switch (period) {
    case "weekly":
      dataPoints = 78; // 1.5 years of weeks
      actualCutoff = 52; // 1 year of actuals
      dateIncrement = (date, i) => addWeeks(date, i);
      break;
    case "monthly":
      dataPoints = 18; // 1.5 years
      actualCutoff = 12; // 1 year of actuals
      dateIncrement = (date, i) => addMonths(date, i);
      break;
    case "quarterly":
      dataPoints = 6; // 1.5 years
      actualCutoff = 4; // 1 year of actuals
      dateIncrement = (date, i) => addQuarters(date, i);
      break;
    default: // daily
      dataPoints = 540; // 1.5 years
      actualCutoff = 365; // 1 year of actuals
      dateIncrement = (date, i) => addDays(date, i);
  }
  
  for (let i = 0; i < dataPoints; i++) {
    const date = dateIncrement(now, i);
    
    const isActual = i < actualCutoff;
    const baseFlow = 150000 + Math.sin(i / 30) * 25000 + (Math.random() - 0.5) * 15000;
    const actualBalance = Math.round(baseFlow + i * 300);
    const forecastBalance = Math.round(actualBalance * (0.95 + Math.random() * 0.1)); // Add some variance to forecasts
    
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
    case "weekly":
      return format(date, "MMM dd");
    case "monthly":
      return format(date, "MMM yyyy");
    case "quarterly":
      return `Q${Math.ceil((date.getMonth() + 1) / 3)} ${format(date, "yyyy")}`;
    default: // daily
      return format(date, "MMM dd");
  }
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
  balance: {
    label: "Cash Balance",
    color: "hsl(214, 84%, 56%)",
  },
  actualBalance: {
    label: "Actual Balance",
    color: "hsl(214, 84%, 56%)",
  },
  forecastBalance: {
    label: "Forecast Balance", 
    color: "hsl(280, 84%, 56%)",
  },
  workingCapital: {
    label: "Working Capital",
    color: "hsl(143, 64%, 24%)",
  },
  confidence: {
    label: "Confidence",
    color: "hsl(143, 64%, 24%)",
  },
  Revenue: { label: "Revenue", color: "hsl(214, 84%, 56%)" },
  Operations: { label: "Operations", color: "hsl(143, 64%, 24%)" },
  Marketing: { label: "Marketing", color: "hsl(280, 84%, 56%)" },
  Payroll: { label: "Payroll", color: "hsl(35, 84%, 56%)" },
  Travel: { label: "Travel", color: "hsl(0, 84%, 60%)" },
};

const DemoVideo = ({ triggerDemo = false }: DemoVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [period, setPeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState("forecast");
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
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

  // Handle external trigger from Hero component
  useEffect(() => {
    if (triggerDemo) {
      console.log('Demo triggered from Hero');
      // Reset and start the interactive demo only
      setCurrentStep(0);
      setIsPlaying(true);
      // Don't auto-show or auto-play the video
    }
  }, [triggerDemo]);

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
    setVideoPlaying(false);
  };

  const startDemo = () => {
    setIsPlaying(!isPlaying);
    // Don't auto-show video when starting demo
  };

  const toggleVideo = () => {
    const newShowVideo = !showVideo;
    setShowVideo(newShowVideo);
    if (newShowVideo) {
      setVideoPlaying(true);
    } else {
      setVideoPlaying(false);
    }
  };

  const currentBalance = data[29]?.balance || 150000;
  const forecastBalance = data[89]?.balance || 175000;
  const accuracy = "99.2%";
  
  // Calculate accuracy data for comparison
  const getAccuracyData = () => {
    const actualData = data.filter(d => d.isActual);
    const forecastData = data.filter(d => !d.isActual);
    const overlapPeriod = actualData.slice(-30); // Last 30 days of actuals to compare
    
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
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&controls=1"
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
                  <p className="text-xl font-bold text-foreground">{accuracy}</p>
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
                         stroke={chartConfig.actualBalance.color}
                         strokeWidth={3}
                         dot={{ fill: chartConfig.actualBalance.color, strokeWidth: 2, r: 3 }}
                         connectNulls={false}
                       />
                       <Line 
                         type="monotone" 
                         dataKey="forecastBalance" 
                         stroke={chartConfig.forecastBalance.color}
                         strokeWidth={2}
                         strokeDasharray="5 5"
                         dot={{ fill: chartConfig.forecastBalance.color, strokeWidth: 2, r: 2 }}
                         connectNulls={false}
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="categories" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle>Cash Flow by Category</CardTitle>
               </CardHeader>
               <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.slice(0, Math.floor(data.length / 3))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="formattedDate" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="Revenue" fill={chartConfig.Revenue.color} />
                        <Bar dataKey="Operations" fill={chartConfig.Operations.color} />
                        <Bar dataKey="Marketing" fill={chartConfig.Marketing.color} />
                        <Bar dataKey="Payroll" fill={chartConfig.Payroll.color} />
                        <Bar dataKey="Travel" fill={chartConfig.Travel.color} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="working-capital" className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2">
                     <Calculator className="w-5 h-5 text-primary" />
                     <div>
                       <p className="text-sm text-muted-foreground">Current Ratio</p>
                       <p className="text-xl font-bold text-foreground">
                         {(data[data.length - 1]?.currentRatio || 1.2).toFixed(2)}
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
               
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2">
                     <BarChart3 className="w-5 h-5 text-accent" />
                     <div>
                       <p className="text-sm text-muted-foreground">Quick Ratio</p>
                       <p className="text-xl font-bold text-foreground">
                         {(data[data.length - 1]?.quickRatio || 0.8).toFixed(2)}
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
               
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2">
                     <DollarSign className="w-5 h-5 text-primary" />
                     <div>
                       <p className="text-sm text-muted-foreground">Working Capital</p>
                       <p className="text-xl font-bold text-foreground">
                         {formatCurrency(data[data.length - 1]?.workingCapital || 25000)}
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
             
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="w-5 h-5" />
                   Working Capital Trend
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
                          dataKey="workingCapital" 
                          stroke={chartConfig.workingCapital.color}
                          strokeWidth={3}
                          dot={{ fill: chartConfig.workingCapital.color, strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="accuracy" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="w-5 h-5" />
                   Forecast Accuracy Analysis
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="border-b border-border">
                         <th className="text-left p-2 text-muted-foreground">Date</th>
                         <th className="text-right p-2 text-muted-foreground">Actual</th>
                         <th className="text-right p-2 text-muted-foreground">Forecast</th>
                         <th className="text-right p-2 text-muted-foreground">Variance %</th>
                         <th className="text-right p-2 text-muted-foreground">Accuracy %</th>
                       </tr>
                     </thead>
                     <tbody>
                       {getAccuracyData().slice(-10).map((row, idx) => (
                         <tr key={idx} className="border-b border-border/50">
                           <td className="p-2 text-foreground">{row.date}</td>
                           <td className="p-2 text-right text-foreground">{formatCurrency(row.actual)}</td>
                           <td className="p-2 text-right text-foreground">{formatCurrency(row.forecast)}</td>
                           <td className={`p-2 text-right font-medium ${
                             row.variance < 5 ? 'text-accent' : row.variance < 10 ? 'text-primary' : 'text-destructive'
                           }`}>
                             {row.variance.toFixed(1)}%
                           </td>
                           <td className={`p-2 text-right font-medium ${
                             row.accuracy > 95 ? 'text-accent' : row.accuracy > 90 ? 'text-primary' : 'text-destructive'
                           }`}>
                             {row.accuracy.toFixed(1)}%
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 
                 <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                     <div>
                       <p className="text-sm text-muted-foreground">Average Accuracy</p>
                       <p className="text-2xl font-bold text-accent">99.2%</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Max Variance</p>
                       <p className="text-2xl font-bold text-primary">2.1%</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Predictions Made</p>
                       <p className="text-2xl font-bold text-foreground">180</p>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground">Date</th>
                        <th className="text-left p-2 text-muted-foreground">Description</th>
                        <th className="text-left p-2 text-muted-foreground">Category</th>
                        <th className="text-right p-2 text-muted-foreground">Amount</th>
                        <th className="text-center p-2 text-muted-foreground">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionData.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border/50">
                          <td className="p-2 text-foreground">{transaction.date}</td>
                          <td className="p-2 text-foreground">{transaction.description}</td>
                          <td className="p-2">
                            <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                              {transaction.category}
                            </span>
                          </td>
                          <td className={`p-2 text-right font-medium ${
                            transaction.amount > 0 ? 'text-accent' : 'text-destructive'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              transaction.type === 'inflow' 
                                ? 'bg-accent/10 text-accent' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
};

export default DemoVideo;