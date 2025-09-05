import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Globe, 
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { economicDataManager, ForexRate, EconomicIndicator, MarketData } from '@/lib/economic-data';
import RefreshIndicator from './RefreshIndicator';

const EconomicDashboard: React.FC = () => {
  const [forexRates, setForexRates] = useState<ForexRate[]>([]);
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicator[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadEconomicData();
    // Sync data on component mount
    economicDataManager.syncEconomicData();
  }, []);

  const loadEconomicData = () => {
    setForexRates(economicDataManager.getForexRates());
    setEconomicIndicators(economicDataManager.getEconomicIndicators());
    setMarketData(economicDataManager.getMarketData());
    setLastRefresh(new Date());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await economicDataManager.syncEconomicData();
      loadEconomicData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 4,
      maximumFractionDigits: currency === 'JPY' ? 0 : 5
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(3)}%`;
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Live Economic Data</span>
              </CardTitle>
              <CardDescription>
                Real-time financial market data and economic indicators
              </CardDescription>
            </div>
            <RefreshIndicator 
              lastRefreshTime={lastRefresh} 
              onRefresh={handleRefresh}
              isLoading={isRefreshing}
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="forex" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forex">Forex Rates</TabsTrigger>
          <TabsTrigger value="markets">Market Indices</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="indicators">Economic Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="forex" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forexRates.map((rate) => (
              <Card key={rate.symbol}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{rate.symbol}</h3>
                    {getTrendIcon(rate.change)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {rate.rate.toFixed(5)}
                    </div>
                    <div className={`text-sm flex items-center space-x-2 ${getTrendColor(rate.change)}`}>
                      <span>{rate.change >= 0 ? '+' : ''}{rate.change.toFixed(5)}</span>
                      <span>({formatPercentage(rate.change_percent)})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rate.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {forexRates.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No forex data available</p>
                <Button onClick={handleRefresh} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="markets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.filter(data => data.market !== 'Commodity').map((market) => (
              <Card key={market.symbol}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{market.name}</h3>
                      <p className="text-sm text-muted-foreground">{market.symbol}</p>
                    </div>
                    {getTrendIcon(market.change)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {market.value.toLocaleString()}
                    </div>
                    <div className={`text-sm flex items-center space-x-2 ${getTrendColor(market.change)}`}>
                      <span>{market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}</span>
                      <span>({formatPercentage(market.change_percent)})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {market.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.filter(data => data.market === 'Commodity').map((commodity) => (
              <Card key={commodity.symbol}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{commodity.name}</h3>
                      <p className="text-sm text-muted-foreground">{commodity.symbol}</p>
                    </div>
                    {getTrendIcon(commodity.change)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      ${commodity.value.toFixed(2)}
                    </div>
                    <div className={`text-sm flex items-center space-x-2 ${getTrendColor(commodity.change)}`}>
                      <span>{commodity.change >= 0 ? '+' : ''}${commodity.change.toFixed(2)}</span>
                      <span>({formatPercentage(commodity.change_percent)})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {commodity.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {economicIndicators.map((indicator, index) => (
              <Card key={`${indicator.country}-${indicator.indicator}-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{indicator.country}</Badge>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{indicator.indicator}</h3>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold">{indicator.value}</span>
                      <span className="text-sm text-muted-foreground">{indicator.unit}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {indicator.period}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {economicIndicators.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No economic indicators available</p>
                <Button onClick={handleRefresh} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Data Source Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Sources</CardTitle>
          <CardDescription>Live connection status to economic data providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {economicDataManager.getDataSources().map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium capitalize">{source.provider.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {source.dataType.replace('_', ' ')}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {source.updateFrequency}
                  </Badge>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomicDashboard;