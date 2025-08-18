import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Shield, AlertTriangle, DollarSign, Euro, PoundSterling, Bitcoin } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface ForexRate {
  pair: string;
  rate: number;
  change24h: number;
  change7d: number;
  volatility: number;
  hedgingRecommendation: 'LOW' | 'MEDIUM' | 'HIGH';
  lastUpdated: string;
}

interface ExposurePosition {
  currency: string;
  amount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  hedged: boolean;
  hedgingStrategy?: string;
}

const ForexAnalysis = () => {
  const { currency, formatCurrency } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [exposures, setExposures] = useState<ExposurePosition[]>([]);
  const [forexRates, setForexRates] = useState<ForexRate[]>([]);

  useEffect(() => {
    // Mock forex data - in production, this would come from real-time forex APIs
    const mockRates: ForexRate[] = [
      {
        pair: 'EUR/USD',
        rate: 1.0892,
        change24h: 0.12,
        change7d: -0.34,
        volatility: 0.85,
        hedgingRecommendation: 'MEDIUM',
        lastUpdated: new Date().toISOString()
      },
      {
        pair: 'GBP/USD',
        rate: 1.2743,
        change24h: -0.08,
        change7d: 0.67,
        volatility: 1.12,
        hedgingRecommendation: 'HIGH',
        lastUpdated: new Date().toISOString()
      },
      {
        pair: 'USD/JPY',
        rate: 149.82,
        change24h: 0.45,
        change7d: 1.23,
        volatility: 0.96,
        hedgingRecommendation: 'MEDIUM',
        lastUpdated: new Date().toISOString()
      },
      {
        pair: 'USD/CAD',
        rate: 1.3456,
        change24h: -0.23,
        change7d: -0.89,
        volatility: 0.72,
        hedgingRecommendation: 'LOW',
        lastUpdated: new Date().toISOString()
      }
    ];

    const mockExposures: ExposurePosition[] = [
      {
        currency: 'EUR',
        amount: 2450000,
        riskLevel: 'MEDIUM',
        hedged: true,
        hedgingStrategy: 'Forward Contract (90 days)'
      },
      {
        currency: 'GBP',
        amount: 1850000,
        riskLevel: 'HIGH',
        hedged: false,
        hedgingStrategy: 'Currency Options recommended'
      },
      {
        currency: 'JPY',
        amount: 185000000,
        riskLevel: 'MEDIUM',
        hedged: true,
        hedgingStrategy: 'Currency Swap (6 months)'
      },
      {
        currency: 'CAD',
        amount: 950000,
        riskLevel: 'LOW',
        hedged: false
      }
    ];

    setForexRates(mockRates);
    setExposures(mockExposures);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-destructive';
      case 'MEDIUM': return 'text-amber-600';
      case 'LOW': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'destructive' as const;
      case 'MEDIUM': return 'secondary' as const;
      case 'LOW': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'EUR': return <Euro className="h-4 w-4" />;
      case 'GBP': return <PoundSterling className="h-4 w-4" />;
      case 'USD': return <DollarSign className="h-4 w-4" />;
      default: return <Bitcoin className="h-4 w-4" />;
    }
  };

  const totalExposure = exposures.reduce((acc, exp) => acc + exp.amount, 0);
  const hedgedExposure = exposures.filter(exp => exp.hedged).reduce((acc, exp) => acc + exp.amount, 0);
  const hedgingRatio = (hedgedExposure / totalExposure) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Multi-Currency Forex Analysis</h2>
          <p className="text-muted-foreground">Monitor currency exposures and hedging strategies</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1D">1 Day</SelectItem>
            <SelectItem value="1W">1 Week</SelectItem>
            <SelectItem value="1M">1 Month</SelectItem>
            <SelectItem value="3M">3 Months</SelectItem>
            <SelectItem value="1Y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forex Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExposure)}</div>
            <p className="text-xs text-muted-foreground">Across {exposures.length} currencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hedging Ratio</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hedgingRatio.toFixed(1)}%</div>
            <Progress value={hedgingRatio} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(hedgedExposure)} hedged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">2</div>
            <p className="text-xs text-muted-foreground">
              High-risk positions requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rates">Live Rates</TabsTrigger>
          <TabsTrigger value="exposures">Currency Exposures</TabsTrigger>
          <TabsTrigger value="hedging">Hedging Strategies</TabsTrigger>
          <TabsTrigger value="analytics">Risk Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Exchange Rates</CardTitle>
              <CardDescription>Live forex rates with volatility indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forexRates.map((rate) => (
                  <div key={rate.pair} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium">{rate.pair}</div>
                      <Badge variant={getRiskBadgeVariant(rate.hedgingRecommendation)}>
                        {rate.hedgingRecommendation}
                      </Badge>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-lg">{rate.rate.toFixed(4)}</div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`flex items-center ${rate.change24h >= 0 ? 'text-accent' : 'text-destructive'}`}>
                          {rate.change24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {Math.abs(rate.change24h)}%
                        </span>
                        <span className="text-muted-foreground">
                          Vol: {rate.volatility}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exposures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Exposure Breakdown</CardTitle>
              <CardDescription>Current positions and risk assessment by currency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exposures.map((exposure, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getCurrencyIcon(exposure.currency)}
                      <div>
                        <div className="font-medium">{exposure.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(exposure.amount)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={getRiskBadgeVariant(exposure.riskLevel)}>
                        {exposure.riskLevel} RISK
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Badge variant={exposure.hedged ? "default" : "outline"}>
                          {exposure.hedged ? "Hedged" : "Unhedged"}
                        </Badge>
                        {exposure.hedged && <Shield className="h-4 w-4 text-accent" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hedging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hedging Strategies</CardTitle>
              <CardDescription>Current and recommended hedging instruments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {exposures.map((exposure, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCurrencyIcon(exposure.currency)}
                        <span className="font-medium">{exposure.currency}</span>
                        <Badge variant={getRiskBadgeVariant(exposure.riskLevel)}>
                          {exposure.riskLevel}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(exposure.amount)}
                      </div>
                    </div>
                    
                    {exposure.hedged ? (
                      <div className="bg-accent/10 p-3 rounded-md">
                        <div className="flex items-center space-x-2 text-accent mb-1">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">Currently Hedged</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exposure.hedgingStrategy}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-3 rounded-md">
                        <div className="flex items-center space-x-2 text-amber-600 mb-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Hedging Recommended</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {exposure.hedgingStrategy || 'Consider forward contracts or currency options'}
                        </p>
                        <Button size="sm" variant="outline">
                          Create Hedge
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Value at Risk (VaR)</CardTitle>
                <CardDescription>95% confidence interval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-destructive">
                    {formatCurrency(156780)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maximum potential loss over 1 day
                  </p>
                  <Progress value={12.8} className="mt-2" />
                  <p className="text-xs text-muted-foreground">
                    12.8% of total portfolio value
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlation Matrix</CardTitle>
                <CardDescription>Currency pair correlations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>EUR/USD - GBP/USD</span>
                    <span className="font-medium">0.78</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>EUR/USD - USD/JPY</span>
                    <span className="font-medium">-0.42</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GBP/USD - USD/CAD</span>
                    <span className="font-medium">-0.35</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>USD/JPY - USD/CAD</span>
                    <span className="font-medium">0.61</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForexAnalysis;