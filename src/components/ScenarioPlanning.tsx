import { useState, useEffect, createElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Target } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface ScenarioInputs {
  interestRate: number;
  inflationRate: number;
  usdEurFxRate: number;
  gdpGrowth: number;
  commodityPrices: number;
  marketVolatility: number;
}

interface ScenarioResults {
  cashFlow: number;
  revenue: number;
  expenses: number;
  workingCapital: number;
  riskScore: number;
  impactLevel: 'low' | 'medium' | 'high';
}

interface ScenarioPlanningProps {
  data: any[];
  period: string;
}

const ScenarioPlanning = ({ data, period }: ScenarioPlanningProps) => {
  const { formatCurrency } = useCurrency();
  const [scenarios, setScenarios] = useState<ScenarioInputs>({
    interestRate: 5.0,
    inflationRate: 3.2,
    usdEurFxRate: 1.08,
    gdpGrowth: 2.5,
    commodityPrices: 100,
    marketVolatility: 15
  });
  
  const [baselineData] = useState(() => data.filter(d => !d.isActual));
  const [scenarioData, setScenarioData] = useState(baselineData);
  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const baselineScenarios = {
    interestRate: 5.0,
    inflationRate: 3.2,
    usdEurFxRate: 1.08,
    gdpGrowth: 2.5,
    commodityPrices: 100,
    marketVolatility: 15
  };

  const calculateScenarioImpact = (inputs: ScenarioInputs) => {
    // Calculate percentage changes from baseline
    const interestImpact = (inputs.interestRate - baselineScenarios.interestRate) / baselineScenarios.interestRate;
    const inflationImpact = (inputs.inflationRate - baselineScenarios.inflationRate) / baselineScenarios.inflationRate;
    const fxImpact = (inputs.usdEurFxRate - baselineScenarios.usdEurFxRate) / baselineScenarios.usdEurFxRate;
    const gdpImpact = (inputs.gdpGrowth - baselineScenarios.gdpGrowth) / baselineScenarios.gdpGrowth;
    const commodityImpact = (inputs.commodityPrices - baselineScenarios.commodityPrices) / baselineScenarios.commodityPrices;
    const volatilityImpact = (inputs.marketVolatility - baselineScenarios.marketVolatility) / baselineScenarios.marketVolatility;

    // Apply impacts to future projections
    const newData = baselineData.map(point => {
      // Revenue impacts: GDP growth (+), FX changes (+/-), commodity prices (+/-)
      const revenueMultiplier = 1 + (gdpImpact * 0.8) + (fxImpact * 0.3) + (commodityImpact * 0.2);
      
      // Expense impacts: Interest rates (+), inflation (+), commodity prices (+)
      const expenseMultiplier = 1 + (interestImpact * 0.4) + (inflationImpact * 0.6) + (commodityImpact * 0.3);
      
      // Volatility affects variance in projections
      const volatilityMultiplier = 1 + (volatilityImpact * 0.1);
      
      return {
        ...point,
        balance: point.balance * revenueMultiplier / expenseMultiplier,
        Revenue: point.Revenue * revenueMultiplier * volatilityMultiplier,
        Operations: point.Operations * expenseMultiplier,
        Marketing: point.Marketing * expenseMultiplier,
        Payroll: point.Payroll * (1 + inflationImpact * 0.5),
        Travel: point.Travel * (1 + inflationImpact * 0.7),
        workingCapital: point.workingCapital * revenueMultiplier,
        currentRatio: point.currentRatio / expenseMultiplier
      };
    });

    // Calculate overall results
    const totalRevenue = newData.reduce((sum, point) => sum + point.Revenue, 0);
    const totalExpenses = newData.reduce((sum, point) => sum + (point.Operations + point.Marketing + point.Payroll + point.Travel), 0);
    const netCashFlow = totalRevenue - totalExpenses;
    const avgWorkingCapital = newData.reduce((sum, point) => sum + point.workingCapital, 0) / newData.length;
    
    // Calculate risk score based on volatility and negative impacts
    const riskFactors = [
      Math.abs(interestImpact),
      Math.abs(inflationImpact),
      Math.abs(fxImpact),
      Math.abs(volatilityImpact)
    ];
    const riskScore = Math.min(100, riskFactors.reduce((sum, risk) => sum + risk, 0) * 100);
    
    // Determine impact level
    let impactLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 30) impactLevel = 'high';
    else if (riskScore > 15) impactLevel = 'medium';

    return {
      data: newData,
      results: {
        cashFlow: netCashFlow,
        revenue: totalRevenue,
        expenses: totalExpenses,
        workingCapital: avgWorkingCapital,
        riskScore,
        impactLevel
      }
    };
  };

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      const { data: newData, results: newResults } = calculateScenarioImpact(scenarios);
      setScenarioData(newData);
      setResults(newResults);
      setIsCalculating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [scenarios]);

  const handleScenarioChange = (key: keyof ScenarioInputs, value: number[]) => {
    setScenarios(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const resetToBaseline = () => {
    setScenarios(baselineScenarios);
  };

  const impactIcon = results?.impactLevel === 'high' ? TrendingDown : 
                    results?.impactLevel === 'medium' ? AlertTriangle : TrendingUp;
  const impactColor = results?.impactLevel === 'high' ? 'text-red-600' : 
                     results?.impactLevel === 'medium' ? 'text-orange-600' : 'text-green-600';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Economic Scenario Planning
            </span>
            <Button variant="outline" size="sm" onClick={resetToBaseline}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Interest Rate
                  <Badge variant="outline">{scenarios.interestRate.toFixed(1)}%</Badge>
                </Label>
                <Slider
                  value={[scenarios.interestRate]}
                  onValueChange={(value) => handleScenarioChange('interestRate', value)}
                  max={10}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="flex items-center justify-between">
                  Inflation Rate
                  <Badge variant="outline">{scenarios.inflationRate.toFixed(1)}%</Badge>
                </Label>
                <Slider
                  value={[scenarios.inflationRate]}
                  onValueChange={(value) => handleScenarioChange('inflationRate', value)}
                  max={8}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  USD/EUR FX Rate
                  <Badge variant="outline">{scenarios.usdEurFxRate.toFixed(2)}</Badge>
                </Label>
                <Slider
                  value={[scenarios.usdEurFxRate]}
                  onValueChange={(value) => handleScenarioChange('usdEurFxRate', value)}
                  max={1.5}
                  min={0.8}
                  step={0.01}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="flex items-center justify-between">
                  GDP Growth
                  <Badge variant="outline">{scenarios.gdpGrowth.toFixed(1)}%</Badge>
                </Label>
                <Slider
                  value={[scenarios.gdpGrowth]}
                  onValueChange={(value) => handleScenarioChange('gdpGrowth', value)}
                  max={6}
                  min={-2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Commodity Prices (Index)
                  <Badge variant="outline">{scenarios.commodityPrices.toFixed(0)}</Badge>
                </Label>
                <Slider
                  value={[scenarios.commodityPrices]}
                  onValueChange={(value) => handleScenarioChange('commodityPrices', value)}
                  max={150}
                  min={50}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="flex items-center justify-between">
                  Market Volatility
                  <Badge variant="outline">{scenarios.marketVolatility.toFixed(0)}%</Badge>
                </Label>
                <Slider
                  value={[scenarios.marketVolatility]}
                  onValueChange={(value) => handleScenarioChange('marketVolatility', value)}
                  max={40}
                  min={5}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.cashFlow)}</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${results.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.revenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Working Capital</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.workingCapital)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold">{results.riskScore.toFixed(0)}%</p>
                  <Badge variant={results.impactLevel === 'high' ? 'destructive' : results.impactLevel === 'medium' ? 'default' : 'secondary'}>
                    {results.impactLevel} impact
                  </Badge>
                </div>
                {createElement(impactIcon, { className: `h-8 w-8 ${impactColor}` })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scenario Impact on Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Calculating scenario impact...</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="hsl(214, 84%, 56%)" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(214, 84%, 56%)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioPlanning;