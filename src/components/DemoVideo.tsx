import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, DollarSign, Calendar, Target } from "lucide-react";

// Demo data for the video
const generateDemoData = (period: string) => {
  const now = new Date();
  const data = [];
  const categories = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  const colors = ["hsl(214, 84%, 56%)", "hsl(143, 64%, 24%)", "hsl(280, 84%, 56%)", "hsl(35, 84%, 56%)", "hsl(0, 84%, 60%)"];
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    const isActual = i < 30;
    const baseFlow = 50000 + Math.sin(i / 7) * 15000 + (Math.random() - 0.5) * 10000;
    
    const categoryData: any = {
      date: date.toISOString().split('T')[0],
      balance: Math.round(baseFlow + i * 500),
      isActual,
      confidence: isActual ? 1.0 : Math.max(0.75, 0.95 - (i - 30) * 0.005),
    };
    
    categories.forEach((cat, idx) => {
      categoryData[cat] = Math.round((Math.random() * 15000 + 5000) * (isActual ? 1 : 0.8 + Math.random() * 0.4));
    });
    
    data.push(categoryData);
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
  balance: {
    label: "Cash Balance",
    color: "hsl(214, 84%, 56%)",
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

const DemoVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [period, setPeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState("forecast");
  const [data, setData] = useState(generateDemoData("daily"));

  const steps = [
    "Loading transaction data...",
    "Analyzing cash flow patterns...", 
    "Categorizing transactions...",
    "Running AI forecast model...",
    "Generating 99.2% accuracy forecast...",
    "Complete - Interactive dashboard ready!"
  ];

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

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const currentBalance = data[29]?.balance || 150000;
  const forecastBalance = data[89]?.balance || 175000;
  const accuracy = "99.2%";

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
            <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Details</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Cash Flow Forecast - Next 90 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke={chartConfig.balance.color}
                        strokeWidth={3}
                        dot={{ fill: chartConfig.balance.color, strokeWidth: 2, r: 4 }}
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
                    <BarChart data={data.slice(0, 30)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
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