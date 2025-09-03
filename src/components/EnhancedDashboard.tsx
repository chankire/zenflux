import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Building2, 
  Upload, 
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Database,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import DataModeToggle from "./DataModeToggle";
import ExecutiveDashboard from "./ExecutiveDashboard";
import ScenarioPlanning from "./ScenarioPlanning";
import { FileUploadInterface } from "./enterprise/FileUploadInterface";

interface Organization {
  id: string;
  name: string;
  base_currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  value_date: string;
  memo: string;
  currency: string;
}

const EnhancedDashboard = () => {
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastPeriod, setForecastPeriod] = useState<'3' | '6' | '12'>('6');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user data and determine if they have real data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Fetch organizations
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', (await supabase
          .from('memberships')
          .select('organization_id')
          .eq('user_id', user?.id)
          .single()
        ).data?.organization_id);

      if (orgError && orgError.code !== 'PGRST116') {
        throw orgError;
      }

      setOrganizations(orgs || []);

      // Fetch transactions if we have an organization
      if (orgs && orgs.length > 0) {
        const { data: txns, error: txnError } = await supabase
          .from('transactions')
          .select('*')
          .eq('organization_id', orgs[0].id)
          .eq('is_forecast', false)
          .order('value_date', { ascending: false })
          .limit(100);

        if (txnError) {
          throw txnError;
        }

        setTransactions(txns || []);

        // If they have real transactions, suggest switching to live mode
        if (txns && txns.length > 0 && dataMode === 'demo') {
          toast({
            title: "Real data detected!",
            description: "You have transaction data. Consider switching to Live Data mode for accurate forecasts.",
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: 'demo' | 'live') => {
    setDataMode(mode);
    toast({
      title: `Switched to ${mode === 'demo' ? 'Demo' : 'Live Data'} mode`,
      description: mode === 'demo' 
        ? "Now showing sample data for exploration." 
        : "Now showing your real financial data and forecasts.",
    });
  };

  const generateForecast = async () => {
    try {
      toast({
        title: "Generating forecast...",
        description: `Creating ${forecastPeriod}-month AI-powered forecast.`,
      });

      const { error } = await supabase.functions.invoke('generate-forecast', {
        body: { 
          modelId: 'default',
          horizon_days: parseInt(forecastPeriod) * 30 
        }
      });

      if (error) throw error;

      toast({
        title: "Forecast generated!",
        description: "Your AI-powered cash flow forecast is ready.",
      });
      
      // Refresh the dashboard
      loadUserData();
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      toast({
        title: "Forecast generation failed",
        description: error.message || "Failed to generate forecast. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePeriodChange = (period: string) => {
    setForecastPeriod(period as '3' | '6' | '12');
  };

  const hasRealData = transactions.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Flow Intelligence</h1>
          <p className="text-muted-foreground">
            {dataMode === 'demo' 
              ? "Explore AI-powered forecasting with sample data" 
              : "Real-time forecasting with your financial data"
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={dataMode === 'demo' ? 'default' : 'secondary'}>
            {dataMode === 'demo' ? 'Demo Mode' : 'Live Data'}
          </Badge>
          {dataMode === 'live' && (
            <div className="flex items-center gap-2">
              <label htmlFor="forecast-period" className="text-sm font-medium">Forecast Period:</label>
              <select
                id="forecast-period"
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(e.target.value as '3' | '6' | '12')}
                className="px-3 py-1 border border-input rounded-md bg-background text-sm"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Data Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Source
          </CardTitle>
          <CardDescription>
            Choose between demo data for exploration or your real financial data for accurate forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataModeToggle 
            currentMode={dataMode}
            onModeChange={handleModeChange}
            hasRealData={hasRealData}
          />
        </CardContent>
      </Card>

      {/* Demo Mode Info */}
      {dataMode === 'demo' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You're in Demo Mode. This uses sample data from a SaaS company to demonstrate ZenFlux capabilities. 
            {!hasRealData && (
              <span> Upload your data or connect your bank to switch to Live Data mode.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExecutiveDashboard 
            period={forecastPeriod} 
            onPeriodChange={handlePeriodChange}
          />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  AI Forecast Generation
                </CardTitle>
                <CardDescription>
                  Generate rolling forecasts using machine learning models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">LSTM Model</p>
                    <p className="text-xs text-muted-foreground">99.2% accuracy</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <BarChart3 className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium">Prophet Model</p>
                    <p className="text-xs text-muted-foreground">Seasonal trends</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <PieChart className="w-6 h-6 mx-auto text-primary-glow mb-2" />
                    <p className="text-sm font-medium">Ensemble</p>
                    <p className="text-xs text-muted-foreground">Combined power</p>
                  </div>
                </div>
                
                <Button 
                  onClick={generateForecast} 
                  className="w-full"
                  variant="hero"
                  disabled={dataMode === 'demo'}
                >
                  Generate {forecastPeriod}-Month Forecast
                </Button>
                
                {dataMode === 'demo' && (
                  <p className="text-xs text-muted-foreground text-center">
                    Switch to Live Data to generate real forecasts
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>Model performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>3-month accuracy</span>
                    <Badge variant="default">99.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>6-month accuracy</span>
                    <Badge variant="default">94.8%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>12-month accuracy</span>
                    <Badge variant="secondary">87.3%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence interval</span>
                    <Badge variant="outline">95%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Coming soon - Advanced analytics dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced analytics features will be available soon.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioPlanning 
            data={dataMode === 'demo' ? [] : transactions}
            period={`${forecastPeriod}M`}
          />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Data Import
                </CardTitle>
                <CardDescription>
                  Upload transaction history or connect data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadInterface />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Data Summary
                </CardTitle>
                <CardDescription>
                  Overview of your financial data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-lg font-semibold">{transactions.length}</p>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-lg font-semibold">{organizations.length}</p>
                    <p className="text-sm text-muted-foreground">Organizations</p>
                  </div>
                </div>
                
                {organizations.map(org => (
                  <div key={org.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{org.name}</span>
                    <Badge variant="outline">{org.base_currency}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;