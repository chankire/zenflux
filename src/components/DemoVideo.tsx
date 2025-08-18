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
  const cats = ["Revenue", "Operations", "Marketing", "Payroll", "Travel"];
  let points = 540, actualCutoff = 365;
  let step = (d: Date, i: number) => addDays(d, i);
  if (period === "weekly") { points = 78; actualCutoff = 52; step = (d,i)=>addWeeks(d,i); }
  if (period === "monthly") { points = 18; actualCutoff = 12; step = (d,i)=>addMonths(d,i); }
  if (period === "quarterly") { points = 6; actualCutoff = 4; step = (d,i)=>addQuarters(d,i); }
  for (let i = 0; i < points; i++) {
    const date = step(now, i);
    const isActual = i < actualCutoff;
    const baseFlow = 150000 + Math.sin(i/30)*25000 + (Math.random()-0.5)*15000;
    const actualBalance = Math.round(baseFlow + i*300);
    const forecastBalance = Math.round(actualBalance * (0.95 + Math.random()*0.1));
    const row: any = {
      date: date.toISOString().split("T")[0],
      formattedDate: formatDateForPeriod(date, period),
      actualBalance: isActual ? actualBalance : null,
      forecastBalance: !isActual ? forecastBalance : null,
      balance: isActual ? actualBalance : forecastBalance,
      isActual,
      confidence: isActual ? 1 : Math.max(0.7, 0.95 - (i - actualCutoff) * 0.002),
      workingCapital: Math.round(actualBalance*0.15 + (Math.random()-0.5)*10000),
      currentRatio: 1.2 + (Math.random()-0.5)*0.4,
      quickRatio: 0.8 + (Math.random()-0.5)*0.3,
    };
    cats.forEach((cat, idx) => {
      const base = 8000 + idx*3000;
      row[cat] = Math.round(base * (isActual ? 1 : 0.85 + Math.random()*0.3));
    });
    data.push(row);
  }
  return data;
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
    let t: any;
    if (isPlaying && currentStep < steps.length - 1) {
      t = setInterval(() => setCurrentStep(p => p + 1), 1500);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => t && clearInterval(t);
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    setData(generateDemoData(period));
  }, [period]);

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const startOrPause = () => {
    setIsPlaying(prev => !prev);
    if (!isPlaying) setCurrentStep(0);
  };

  const currentBalance = data[29]?.balance || 150000;
  const forecastBalance = data[data.length - 90]?.balance || 175000;

  const getAccuracyData = () => {
    const actual = data.filter(d => d.isActual);
    const fc = data.filter(d => !d.isActual);
    return actual.slice(-30).map((a, idx) => {
      const f = fc[idx];
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

      {/* …rest of your tabs/charts exactly as before… */}
      {/* Keep your existing content here */}
    </div>
  );
});

DemoVideo.displayName = "DemoVideo";
export default DemoVideo;
