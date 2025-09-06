import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Play,
  Save,
  Download,
  Copy,
  Settings,
  Zap,
  Globe,
  DollarSign,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { EconomicScenario } from '@/lib/economic-data';

interface Scenario {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  economicParams: EconomicScenario & {
    customerGrowthRate: number;
    operationalEfficiency: number;
    marketExpansion: number;
  };
  results?: ScenarioResults;
  createdAt: Date;
  updatedAt: Date;
}

interface ScenarioResults {
  forecastData: Array<{
    month: string;
    baseCase: number;
    optimistic: number;
    pessimistic: number;
    revenue: number;
    expenses: number;
    netCashFlow: number;
  }>;
  keyMetrics: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    burnRate: number;
    runway: number;
    breakEvenMonth: string | null;
    riskScore: number;
  };
  insights: Array<{
    type: 'opportunity' | 'risk' | 'neutral';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

const ScenarioPlanningInterface: React.FC = () => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Base Case',
      description: 'Current economic conditions with steady growth',
      isActive: true,
      economicParams: {
        gdpGrowth: 2.4,
        inflationRate: 3.2,
        interestRates: 5.25,
        forexRates: [],
        marketVolatility: 15,
        customerGrowthRate: 5,
        operationalEfficiency: 0,
        marketExpansion: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Optimistic Growth',
      description: 'Strong economic recovery with accelerated business growth',
      isActive: false,
      economicParams: {
        gdpGrowth: 4.2,
        inflationRate: 2.8,
        interestRates: 4.5,
        forexRates: [],
        marketVolatility: 10,
        customerGrowthRate: 15,
        operationalEfficiency: 20,
        marketExpansion: 25
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Economic Downturn',
      description: 'Recession scenario with reduced demand and increased costs',
      isActive: false,
      economicParams: {
        gdpGrowth: -1.5,
        inflationRate: 4.8,
        interestRates: 6.5,
        forexRates: [],
        marketVolatility: 25,
        customerGrowthRate: -10,
        operationalEfficiency: -15,
        marketExpansion: -30
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Generate mock scenario results
  const generateScenarioResults = (scenario: Scenario): ScenarioResults => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const forecastData = months.map((month, index) => {
      const baseRevenue = 25000;
      const growthFactor = 1 + (scenario.economicParams.gdpGrowth / 100) * 0.5;
      const customerFactor = 1 + (scenario.economicParams.customerGrowthRate / 100);
      const expansionFactor = 1 + (scenario.economicParams.marketExpansion / 100);
      
      const revenue = baseRevenue * growthFactor * customerFactor * expansionFactor * (1 + index * 0.02);
      
      const baseExpenses = 18000;
      const inflationFactor = 1 + (scenario.economicParams.inflationRate / 100) * 0.3;
      const efficiencyFactor = 1 - (scenario.economicParams.operationalEfficiency / 100);
      
      const expenses = baseExpenses * inflationFactor * efficiencyFactor * (1 + index * 0.01);
      
      const volatility = scenario.economicParams.marketVolatility / 100;
      const optimistic = revenue * (1 + volatility);
      const pessimistic = revenue * (1 - volatility);
      
      return {
        month,
        baseCase: Math.round(revenue),
        optimistic: Math.round(optimistic),
        pessimistic: Math.round(pessimistic),
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        netCashFlow: Math.round(revenue - expenses)
      };
    });

    const totalRevenue = forecastData.reduce((sum, data) => sum + data.revenue, 0);
    const totalExpenses = forecastData.reduce((sum, data) => sum + data.expenses, 0);
    const netIncome = totalRevenue - totalExpenses;
    const avgMonthlyBurn = totalExpenses / 12;
    const currentBalance = 150000; // Mock current balance
    const runway = avgMonthlyBurn > 0 ? currentBalance / avgMonthlyBurn : Infinity;
    
    const breakEvenIndex = forecastData.findIndex(data => data.netCashFlow > 0);
    const breakEvenMonth = breakEvenIndex >= 0 ? forecastData[breakEvenIndex].month : null;

    // Calculate risk score based on various factors
    let riskScore = 30; // Base risk
    if (scenario.economicParams.gdpGrowth < 0) riskScore += 25;
    if (scenario.economicParams.inflationRate > 4) riskScore += 15;
    if (scenario.economicParams.marketVolatility > 20) riskScore += 20;
    if (scenario.economicParams.customerGrowthRate < 0) riskScore += 20;
    riskScore = Math.min(100, riskScore);

    const insights = [];
    
    if (scenario.economicParams.gdpGrowth > 3) {
      insights.push({
        type: 'opportunity' as const,
        title: 'Strong Economic Growth',
        description: 'High GDP growth creates favorable conditions for business expansion',
        impact: 'high' as const
      });
    }

    if (scenario.economicParams.customerGrowthRate > 10) {
      insights.push({
        type: 'opportunity' as const,
        title: 'Accelerated Customer Acquisition',
        description: 'High customer growth rate suggests strong market demand',
        impact: 'high' as const
      });
    }

    if (scenario.economicParams.inflationRate > 4) {
      insights.push({
        type: 'risk' as const,
        title: 'Inflation Pressure',
        description: 'High inflation may increase operational costs and reduce margins',
        impact: 'medium' as const
      });
    }

    if (scenario.economicParams.marketVolatility > 20) {
      insights.push({
        type: 'risk' as const,
        title: 'Market Uncertainty',
        description: 'High volatility increases forecast uncertainty and planning challenges',
        impact: 'high' as const
      });
    }

    if (netIncome > 0) {
      insights.push({
        type: 'opportunity' as const,
        title: 'Positive Cash Flow',
        description: 'Scenario projects profitable operations throughout the forecast period',
        impact: 'high' as const
      });
    }

    return {
      forecastData,
      keyMetrics: {
        totalRevenue,
        totalExpenses,
        netIncome,
        burnRate: avgMonthlyBurn,
        runway: isFinite(runway) ? runway : 999,
        breakEvenMonth,
        riskScore
      },
      insights
    };
  };

  const handleCreateScenario = () => {
    setSelectedScenario({
      id: '',
      name: '',
      description: '',
      isActive: false,
      economicParams: {
        gdpGrowth: 2.4,
        inflationRate: 3.2,
        interestRates: 5.25,
        forexRates: [],
        marketVolatility: 15,
        customerGrowthRate: 5,
        operationalEfficiency: 0,
        marketExpansion: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsEditing(false);
    setShowScenarioDialog(true);
  };

  const handleEditScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsEditing(true);
    setShowScenarioDialog(true);
  };

  const handleSaveScenario = () => {
    if (!selectedScenario) return;

    if (isEditing) {
      setScenarios(prev => prev.map(scenario => 
        scenario.id === selectedScenario.id 
          ? { ...selectedScenario, updatedAt: new Date() }
          : scenario
      ));
    } else {
      const newScenario = {
        ...selectedScenario,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setScenarios(prev => [...prev, newScenario]);
    }

    setShowScenarioDialog(false);
    setSelectedScenario(null);
    toast({
      title: isEditing ? "Scenario updated" : "Scenario created",
      description: `${selectedScenario.name} has been saved successfully`,
    });
  };

  const handleRunScenario = async (scenarioId: string) => {
    setIsRunning(true);
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Simulate running the scenario
    setTimeout(() => {
      const results = generateScenarioResults(scenario);
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId 
          ? { ...s, results, updatedAt: new Date() }
          : s
      ));
      
      setIsRunning(false);
      toast({
        title: "Scenario analysis complete",
        description: `${scenario.name} results have been generated`,
      });
    }, 2000);
  };

  const handleRunAllScenarios = async () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const updatedScenarios = scenarios.map(scenario => ({
        ...scenario,
        results: generateScenarioResults(scenario),
        updatedAt: new Date()
      }));
      
      setScenarios(updatedScenarios);
      setIsRunning(false);
      toast({
        title: "All scenarios analyzed",
        description: "Results have been generated for all scenarios",
      });
    }, 3000);
  };

  const getComparisonData = () => {
    const selected = scenarios.filter(s => selectedScenarios.includes(s.id) && s.results);
    if (selected.length === 0) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => {
      const dataPoint: any = { month };
      selected.forEach(scenario => {
        if (scenario.results) {
          dataPoint[scenario.name] = scenario.results.forecastData[index]?.netCashFlow || 0;
        }
      });
      return dataPoint;
    });
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Low';
    if (score < 60) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Scenario Planning</h2>
          <p className="text-muted-foreground">
            Model different economic scenarios and analyze their impact on your business
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {comparisonMode ? 'Single View' : 'Compare'}
          </Button>
          <Button
            variant="outline"
            onClick={handleRunAllScenarios}
            disabled={isRunning}
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run All
          </Button>
          <Button onClick={handleCreateScenario}>
            <Target className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </div>
      </div>

      {comparisonMode ? (
        // Comparison Mode
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {scenarios.filter(s => s.results).map(scenario => (
                  <label key={scenario.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedScenarios.includes(scenario.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScenarios([...selectedScenarios, scenario.id]);
                        } else {
                          setSelectedScenarios(selectedScenarios.filter(id => id !== scenario.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Badge variant="outline">{scenario.name}</Badge>
                  </label>
                ))}
              </div>
            </CardHeader>
            
            {selectedScenarios.length > 0 && (
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={getComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value: any) => [formatCurrency(value), 'Net Cash Flow']} />
                      <Legend />
                      {scenarios.filter(s => selectedScenarios.includes(s.id)).map((scenario, index) => (
                        <Line
                          key={scenario.id}
                          type="monotone"
                          dataKey={scenario.name}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          strokeWidth={2}
                        />
                      ))}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Comparison Metrics */}
          {selectedScenarios.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedScenarios.map(scenarioId => {
                const scenario = scenarios.find(s => s.id === scenarioId);
                if (!scenario?.results) return null;

                return (
                  <Card key={scenarioId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Income:</span>
                        <span className={scenario.results.keyMetrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(scenario.results.keyMetrics.netIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Score:</span>
                        <span className={getRiskScoreColor(scenario.results.keyMetrics.riskScore)}>
                          {scenario.results.keyMetrics.riskScore}/100 ({getRiskLevel(scenario.results.keyMetrics.riskScore)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runway:</span>
                        <span>
                          {scenario.results.keyMetrics.runway === 999 ? '∞' : `${scenario.results.keyMetrics.runway.toFixed(1)}m`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Single Scenario View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map(scenario => (
            <Card key={scenario.id} className={scenario.isActive ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{scenario.name}</span>
                      {scenario.isActive && <Badge>Active</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditScenario(scenario)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Economic Parameters */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Economic Parameters</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GDP Growth:</span>
                      <span>{scenario.economicParams.gdpGrowth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inflation:</span>
                      <span>{scenario.economicParams.inflationRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest:</span>
                      <span>{scenario.economicParams.interestRates}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volatility:</span>
                      <span>{scenario.economicParams.marketVolatility}%</span>
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                {scenario.results && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Forecast Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Income:</span>
                        <span className={scenario.results.keyMetrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(scenario.results.keyMetrics.netIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Score:</span>
                        <span className={getRiskScoreColor(scenario.results.keyMetrics.riskScore)}>
                          {getRiskLevel(scenario.results.keyMetrics.riskScore)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runway:</span>
                        <span>
                          {scenario.results.keyMetrics.runway === 999 ? '∞' : `${scenario.results.keyMetrics.runway.toFixed(1)} months`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                {scenario.results?.insights && scenario.results.insights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Insights</h4>
                    <div className="space-y-1">
                      {scenario.results.insights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2 text-xs">
                          {insight.type === 'opportunity' ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                          ) : insight.type === 'risk' ? (
                            <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5" />
                          ) : (
                            <Activity className="h-3 w-3 text-blue-500 mt-0.5" />
                          )}
                          <span className="text-muted-foreground">{insight.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleRunScenario(scenario.id)}
                    disabled={isRunning}
                    className="flex-1"
                  >
                    {isRunning ? (
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    Run
                  </Button>
                  {scenario.results && (
                    <Button variant="outline" size="sm">
                      <LineChart className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scenario Creation/Edit Dialog */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Scenario' : 'Create New Scenario'}
            </DialogTitle>
            <DialogDescription>
              Configure economic parameters and business assumptions for scenario analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedScenario && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="economic">Economic Factors</TabsTrigger>
                <TabsTrigger value="business">Business Assumptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Scenario Name</Label>
                    <Input
                      id="name"
                      value={selectedScenario.name}
                      onChange={(e) => setSelectedScenario({
                        ...selectedScenario,
                        name: e.target.value
                      })}
                      placeholder="Enter scenario name"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="active"
                      checked={selectedScenario.isActive}
                      onChange={(e) => setSelectedScenario({
                        ...selectedScenario,
                        isActive: e.target.checked
                      })}
                    />
                    <Label htmlFor="active">Set as active scenario</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={selectedScenario.description}
                    onChange={(e) => setSelectedScenario({
                      ...selectedScenario,
                      description: e.target.value
                    })}
                    placeholder="Describe the scenario conditions and assumptions"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="economic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>GDP Growth Rate: {selectedScenario.economicParams.gdpGrowth}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.gdpGrowth]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            gdpGrowth: value[0]
                          }
                        })}
                        min={-5}
                        max={8}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Inflation Rate: {selectedScenario.economicParams.inflationRate}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.inflationRate]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            inflationRate: value[0]
                          }
                        })}
                        min={0}
                        max={10}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Interest Rates: {selectedScenario.economicParams.interestRates}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.interestRates]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            interestRates: value[0]
                          }
                        })}
                        min={0}
                        max={15}
                        step={0.25}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Market Volatility: {selectedScenario.economicParams.marketVolatility}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.marketVolatility]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            marketVolatility: value[0]
                          }
                        })}
                        min={5}
                        max={50}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Customer Growth Rate: {selectedScenario.economicParams.customerGrowthRate}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.customerGrowthRate]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            customerGrowthRate: value[0]
                          }
                        })}
                        min={-30}
                        max={50}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Operational Efficiency: {selectedScenario.economicParams.operationalEfficiency}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.operationalEfficiency]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            operationalEfficiency: value[0]
                          }
                        })}
                        min={-25}
                        max={40}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Market Expansion: {selectedScenario.economicParams.marketExpansion}%</Label>
                      <Slider
                        value={[selectedScenario.economicParams.marketExpansion]}
                        onValueChange={(value) => setSelectedScenario({
                          ...selectedScenario,
                          economicParams: {
                            ...selectedScenario.economicParams,
                            marketExpansion: value[0]
                          }
                        })}
                        min={-50}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowScenarioDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveScenario}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update' : 'Create'} Scenario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenarioPlanningInterface;