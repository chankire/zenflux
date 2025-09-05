export interface EconomicDataSource {
  provider: 'alpha_vantage' | 'world_bank' | 'fred' | 'yahoo_finance' | 'mock';
  endpoint: string;
  dataType: 'forex' | 'gdp' | 'interest_rates' | 'commodities' | 'inflation' | 'market_indices';
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
  apiKey?: string;
}

export interface EconomicDataPoint {
  id: string;
  source: string;
  dataType: string;
  symbol: string;
  value: number;
  timestamp: Date;
  currency?: string;
  country?: string;
  metadata: Record<string, any>;
}

export interface ForexRate {
  symbol: string;
  rate: number;
  timestamp: Date;
  change: number;
  change_percent: number;
}

export interface EconomicIndicator {
  country: string;
  indicator: string;
  value: number;
  period: string;
  timestamp: Date;
  unit: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_percent: number;
  timestamp: Date;
  market: string;
}

class EconomicDataManager {
  private static instance: EconomicDataManager;
  private cache: Map<string, { data: EconomicDataPoint[], expiry: Date }> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  private dataSources: EconomicDataSource[] = [
    {
      provider: 'alpha_vantage',
      endpoint: 'https://www.alphavantage.co/query',
      dataType: 'forex',
      updateFrequency: 'real-time',
      apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo'
    },
    {
      provider: 'world_bank',
      endpoint: 'https://api.worldbank.org/v2/',
      dataType: 'gdp',
      updateFrequency: 'monthly'
    },
    {
      provider: 'fred',
      endpoint: 'https://api.stlouisfed.org/fred/series/observations',
      dataType: 'interest_rates',
      updateFrequency: 'daily',
      apiKey: import.meta.env.VITE_FRED_API_KEY || 'demo'
    },
    {
      provider: 'yahoo_finance',
      endpoint: 'https://query1.finance.yahoo.com/v8/finance/chart/',
      dataType: 'commodities',
      updateFrequency: 'real-time'
    }
  ];

  private constructor() {
    this.loadCachedData();
    this.startPeriodicUpdates();
  }

  public static getInstance(): EconomicDataManager {
    if (!EconomicDataManager.instance) {
      EconomicDataManager.instance = new EconomicDataManager();
    }
    return EconomicDataManager.instance;
  }

  private loadCachedData(): void {
    try {
      const cached = localStorage.getItem('economic-data-cache');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        Object.entries(parsedCache).forEach(([key, value]: [string, any]) => {
          this.cache.set(key, {
            data: value.data.map((point: any) => ({
              ...point,
              timestamp: new Date(point.timestamp)
            })),
            expiry: new Date(value.expiry)
          });
        });
      }
    } catch (error) {
      console.warn('Failed to load cached economic data:', error);
    }
  }

  private saveCacheToStorage(): void {
    try {
      const cacheObject: Record<string, any> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      localStorage.setItem('economic-data-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save economic data cache:', error);
    }
  }

  private generateMockForexData(): ForexRate[] {
    const pairs = ['USD/EUR', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'];
    const baseRates = { 'USD/EUR': 0.85, 'GBP/USD': 1.27, 'USD/JPY': 149.5, 'AUD/USD': 0.66, 'USD/CAD': 1.35, 'USD/CHF': 0.88 };
    
    return pairs.map(symbol => {
      const baseRate = baseRates[symbol as keyof typeof baseRates];
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility * baseRate;
      const rate = baseRate + change;
      
      return {
        symbol,
        rate: parseFloat(rate.toFixed(5)),
        timestamp: new Date(),
        change: parseFloat(change.toFixed(5)),
        change_percent: parseFloat(((change / baseRate) * 100).toFixed(3))
      };
    });
  }

  private generateMockEconomicIndicators(): EconomicIndicator[] {
    return [
      {
        country: 'US',
        indicator: 'GDP Growth Rate',
        value: 2.4,
        period: '2024-Q1',
        timestamp: new Date(),
        unit: '%'
      },
      {
        country: 'US',
        indicator: 'Unemployment Rate',
        value: 3.7,
        period: '2024-02',
        timestamp: new Date(),
        unit: '%'
      },
      {
        country: 'US',
        indicator: 'Inflation Rate',
        value: 3.2,
        period: '2024-02',
        timestamp: new Date(),
        unit: '%'
      },
      {
        country: 'EU',
        indicator: 'GDP Growth Rate',
        value: 0.8,
        period: '2024-Q1',
        timestamp: new Date(),
        unit: '%'
      },
      {
        country: 'EU',
        indicator: 'Inflation Rate',
        value: 2.6,
        period: '2024-02',
        timestamp: new Date(),
        unit: '%'
      }
    ];
  }

  private generateMockMarketData(): MarketData[] {
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500', base: 4800 },
      { symbol: '^IXIC', name: 'NASDAQ', base: 15000 },
      { symbol: '^DJI', name: 'Dow Jones', base: 38000 },
      { symbol: '^FTSE', name: 'FTSE 100', base: 7600 }
    ];

    return indices.map(index => {
      const change = (Math.random() - 0.5) * 200; // ±100 points volatility
      const value = index.base + change;
      const change_percent = (change / index.base) * 100;

      return {
        symbol: index.symbol,
        name: index.name,
        value: parseFloat(value.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        change_percent: parseFloat(change_percent.toFixed(3)),
        timestamp: new Date(),
        market: 'US'
      };
    });
  }

  private generateMockCommodityData(): MarketData[] {
    const commodities = [
      { symbol: 'GC=F', name: 'Gold', base: 2050 },
      { symbol: 'CL=F', name: 'Crude Oil', base: 78 },
      { symbol: 'SI=F', name: 'Silver', base: 24.5 },
      { symbol: 'NG=F', name: 'Natural Gas', base: 2.8 }
    ];

    return commodities.map(commodity => {
      const volatility = commodity.symbol === 'GC=F' ? 50 : commodity.symbol === 'CL=F' ? 5 : 2;
      const change = (Math.random() - 0.5) * volatility;
      const value = commodity.base + change;
      const change_percent = (change / commodity.base) * 100;

      return {
        symbol: commodity.symbol,
        name: commodity.name,
        value: parseFloat(value.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        change_percent: parseFloat(change_percent.toFixed(3)),
        timestamp: new Date(),
        market: 'Commodity'
      };
    });
  }

  private async fetchFromAlphaVantage(dataType: string, symbol?: string): Promise<EconomicDataPoint[]> {
    // Mock implementation - replace with actual API calls
    if (dataType === 'forex') {
      const forexData = this.generateMockForexData();
      return forexData.map((rate, index) => ({
        id: `forex-${index}-${Date.now()}`,
        source: 'alpha_vantage',
        dataType: 'forex',
        symbol: rate.symbol,
        value: rate.rate,
        timestamp: rate.timestamp,
        currency: rate.symbol.split('/')[1],
        country: 'Global',
        metadata: {
          change: rate.change,
          change_percent: rate.change_percent
        }
      }));
    }
    return [];
  }

  private async fetchFromWorldBank(indicator: string, country?: string): Promise<EconomicDataPoint[]> {
    // Mock implementation
    const indicators = this.generateMockEconomicIndicators();
    return indicators.map((indicator, index) => ({
      id: `wb-${index}-${Date.now()}`,
      source: 'world_bank',
      dataType: 'gdp',
      symbol: indicator.indicator.replace(/\s+/g, '_').toLowerCase(),
      value: indicator.value,
      timestamp: indicator.timestamp,
      country: indicator.country,
      metadata: {
        period: indicator.period,
        unit: indicator.unit
      }
    }));
  }

  private async fetchFromFRED(series: string): Promise<EconomicDataPoint[]> {
    // Mock implementation
    const interestRates = [
      { series: 'FEDFUNDS', name: 'Federal Funds Rate', value: 5.25 },
      { series: 'TB3MS', name: '3-Month Treasury', value: 5.18 },
      { series: 'TB10YS', name: '10-Year Treasury', value: 4.35 }
    ];

    return interestRates.map((rate, index) => ({
      id: `fred-${index}-${Date.now()}`,
      source: 'fred',
      dataType: 'interest_rates',
      symbol: rate.series,
      value: rate.value,
      timestamp: new Date(),
      country: 'US',
      metadata: {
        name: rate.name,
        unit: '%'
      }
    }));
  }

  private async fetchFromYahooFinance(symbols: string[]): Promise<EconomicDataPoint[]> {
    // Mock implementation
    const marketData = [...this.generateMockMarketData(), ...this.generateMockCommodityData()];
    
    return marketData.map((data, index) => ({
      id: `yahoo-${index}-${Date.now()}`,
      source: 'yahoo_finance',
      dataType: data.market === 'Commodity' ? 'commodities' : 'market_indices',
      symbol: data.symbol,
      value: data.value,
      timestamp: data.timestamp,
      metadata: {
        name: data.name,
        change: data.change,
        change_percent: data.change_percent,
        market: data.market
      }
    }));
  }

  public async syncEconomicData(): Promise<void> {
    console.log('Starting economic data sync...');
    
    try {
      // Fetch forex data
      const forexData = await this.fetchFromAlphaVantage('forex');
      this.cache.set('forex_rates', {
        data: forexData,
        expiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });

      // Fetch economic indicators
      const economicData = await this.fetchFromWorldBank('GDP');
      this.cache.set('economic_indicators', {
        data: economicData,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Fetch interest rates
      const interestRates = await this.fetchFromFRED('FEDFUNDS');
      this.cache.set('interest_rates', {
        data: interestRates,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Fetch market data
      const marketData = await this.fetchFromYahooFinance(['^GSPC', '^IXIC', 'GC=F', 'CL=F']);
      this.cache.set('market_data', {
        data: marketData,
        expiry: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });

      this.saveCacheToStorage();
      console.log('Economic data sync completed');
    } catch (error) {
      console.error('Economic data sync failed:', error);
    }
  }

  private startPeriodicUpdates(): void {
    // Update forex rates every 5 minutes
    const forexInterval = setInterval(() => {
      this.fetchFromAlphaVantage('forex').then(data => {
        this.cache.set('forex_rates', {
          data,
          expiry: new Date(Date.now() + 60 * 60 * 1000)
        });
        this.saveCacheToStorage();
      });
    }, 5 * 60 * 1000);

    // Update market data every 15 minutes
    const marketInterval = setInterval(() => {
      this.fetchFromYahooFinance(['^GSPC', '^IXIC', 'GC=F', 'CL=F']).then(data => {
        this.cache.set('market_data', {
          data,
          expiry: new Date(Date.now() + 15 * 60 * 1000)
        });
        this.saveCacheToStorage();
      });
    }, 15 * 60 * 1000);

    this.updateIntervals.set('forex', forexInterval);
    this.updateIntervals.set('market', marketInterval);
  }

  public getForexRates(symbols?: string[]): ForexRate[] {
    const cached = this.cache.get('forex_rates');
    if (!cached || cached.expiry < new Date()) {
      return [];
    }

    const forexData = cached.data.filter(point => point.dataType === 'forex');
    
    return forexData.map(point => ({
      symbol: point.symbol,
      rate: point.value,
      timestamp: point.timestamp,
      change: point.metadata.change || 0,
      change_percent: point.metadata.change_percent || 0
    })).filter(rate => !symbols || symbols.includes(rate.symbol));
  }

  public getEconomicIndicators(country?: string): EconomicIndicator[] {
    const cached = this.cache.get('economic_indicators');
    if (!cached || cached.expiry < new Date()) {
      return [];
    }

    return cached.data
      .filter(point => !country || point.country === country)
      .map(point => ({
        country: point.country || 'Unknown',
        indicator: point.metadata.name || point.symbol,
        value: point.value,
        period: point.metadata.period || 'Current',
        timestamp: point.timestamp,
        unit: point.metadata.unit || ''
      }));
  }

  public getMarketData(market?: string): MarketData[] {
    const cached = this.cache.get('market_data');
    if (!cached || cached.expiry < new Date()) {
      return [];
    }

    return cached.data
      .filter(point => !market || point.metadata.market === market)
      .map(point => ({
        symbol: point.symbol,
        name: point.metadata.name || point.symbol,
        value: point.value,
        change: point.metadata.change || 0,
        change_percent: point.metadata.change_percent || 0,
        timestamp: point.timestamp,
        market: point.metadata.market || 'Unknown'
      }));
  }

  public getInterestRates(country: string = 'US'): EconomicDataPoint[] {
    const cached = this.cache.get('interest_rates');
    if (!cached || cached.expiry < new Date()) {
      return [];
    }

    return cached.data.filter(point => 
      point.dataType === 'interest_rates' && point.country === country
    );
  }

  public getDataSources(): EconomicDataSource[] {
    return [...this.dataSources];
  }

  public getCacheStatus(): Record<string, { hasData: boolean; expiry: Date | null; recordCount: number }> {
    const status: Record<string, { hasData: boolean; expiry: Date | null; recordCount: number }> = {};
    
    this.cache.forEach((value, key) => {
      status[key] = {
        hasData: value.data.length > 0,
        expiry: value.expiry,
        recordCount: value.data.length
      };
    });

    return status;
  }

  public clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('economic-data-cache');
  }

  public destroy(): void {
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();
  }
}

export const economicDataManager = EconomicDataManager.getInstance();