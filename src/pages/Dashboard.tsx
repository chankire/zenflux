import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Building2, BarChart3, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/DashboardHeader';
import { useCurrency } from '@/hooks/useCurrency';

interface Organization {
  id: string;
  name: string;
  slug: string;
  base_currency: string;
}

interface BankAccount {
  id: string;
  name: string;
  currency: string;
  current_balance: number;
  account_type: string;
}

const Dashboard = () => {
  const { user, organizations: authOrganizations } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingData, setSeedingData] = useState(false);
  const [generatingForecast, setGeneratingForecast] = useState(false);

  useEffect(() => {
    const fetchMockData = async () => {
      try {
        // Use organizations from auth provider
        setOrganizations(authOrganizations || []);

        // Mock bank accounts data
        const mockBankAccounts: BankAccount[] = [
          {
            id: 'acc-1',
            name: 'Business Checking',
            currency: 'USD',
            current_balance: 125000,
            account_type: 'checking'
          },
          {
            id: 'acc-2', 
            name: 'Savings Account',
            currency: 'USD',
            current_balance: 75000,
            account_type: 'savings'
          },
          {
            id: 'acc-3',
            name: 'EUR Business Account',
            currency: 'EUR',
            current_balance: 50000,
            account_type: 'checking'
          }
        ];
        
        setBankAccounts(mockBankAccounts);

      } catch (error: any) {
        console.error('Error loading mock data:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading dashboard',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMockData();
    }
  }, [user, toast]);

  const handleSeedDemoData = async () => {
    setSeedingData(true);
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Demo data loaded!',
        description: 'Sample organization, accounts, and transactions have been created.',
      });
      
      // Data is already loaded via useEffect - just show success message
      
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading demo data',
        description: error.message,
      });
    } finally {
      setSeedingData(false);
    }
  };

  const handleGenerateForecast = async () => {
    if (organizations.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No organization found',
        description: 'Please load demo data first or connect to an organization.',
      });
      return;
    }

    setGeneratingForecast(true);
    try {
      // Simulate forecast generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Forecast generated!',
        description: `Generated 90-day cash flow forecast successfully.`,
      });
      
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating forecast',
        description: error.message,
      });
    } finally {
      setGeneratingForecast(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = bankAccounts.reduce((sum, account) => sum + Number(account.current_balance), 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">90-Day Forecast</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance * 0.95)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline w-3 h-3 mr-1" />
                95% confidence interval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankAccounts.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Your connected financial accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {bankAccounts.length > 0 ? (
                <div className="space-y-3">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{account.account_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(account.current_balance))}</p>
                        <Badge variant="outline">{account.currency}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No banks connected</h3>
                  <p className="text-muted-foreground mb-4">Connect your first bank to start tracking cash flow</p>
                  <Button>
                    <Building2 className="w-4 h-4 mr-2" />
                    Connect Bank Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Your organization memberships</CardDescription>
            </CardHeader>
            <CardContent>
              {organizations.length > 0 ? (
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground">@{org.slug}</p>
                      </div>
                      <Badge variant="outline">{org.base_currency}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Join an organization</h3>
                  <p className="text-muted-foreground mb-4">Get invited to an organization to start collaborating</p>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Request Access
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with ZenFlux</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={handleSeedDemoData}
                disabled={seedingData}
              >
                <DollarSign className="w-6 h-6 mb-2" />
                {seedingData ? 'Loading...' : 'Load Demo Data'}
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={handleGenerateForecast}
                disabled={generatingForecast || organizations.length === 0}
              >
                <BarChart3 className="w-6 h-6 mb-2" />
                {generatingForecast ? 'Generating...' : 'Generate Forecast'}
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Building2 className="w-6 h-6 mb-2" />
                Connect Bank
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="w-6 h-6 mb-2" />
                Invite Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;