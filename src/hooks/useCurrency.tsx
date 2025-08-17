import { useState, useEffect } from 'react';

interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
}

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: 'USD',
    symbol: '$',
    locale: 'en-US'
  });

  useEffect(() => {
    const detectRegion = () => {
      // Try to get user's timezone to determine region
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // European timezones
      const europeanTimezones = [
        'Europe/',
        'GMT',
        'WET',
        'CET',
        'EET'
      ];
      
      const isEuropean = europeanTimezones.some(tz => timezone.includes(tz));
      
      if (isEuropean) {
        setCurrency({
          code: 'EUR',
          symbol: '€',
          locale: 'de-DE' // Use German locale for euro formatting
        });
      } else {
        // Default to USD for US and other regions
        setCurrency({
          code: 'USD',
          symbol: '$',
          locale: 'en-US'
        });
      }
    };

    detectRegion();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return {
    currency,
    formatCurrency
  };
};