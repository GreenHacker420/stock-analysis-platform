'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import CandlestickChart from './CandlestickChart';

interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  rsi?: number[];
  macd?: { line: number[]; signal: number[]; histogram: number[] };
  bollinger?: { upper: number[]; middle: number[]; lower: number[] };
  sma20?: number[];
  sma50?: number[];
}

interface StockChartProps {
  symbol: string;
  className?: string;
  height?: number;
  period?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
}

export default function StockChart({ 
  symbol, 
  className = '',
  height = 400,
  period = '3mo'
}: StockChartProps) {
  const { isDark } = useTheme();
  const [data, setData] = useState<CandlestickData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicator>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const fetchStockData = async (fetchPeriod: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch historical data
      const historicalResponse = await fetch(`/api/stocks/historical/${symbol}?period=${fetchPeriod}`);
      
      if (!historicalResponse.ok) {
        throw new Error(`Failed to fetch historical data: ${historicalResponse.status}`);
      }

      const historicalData = await historicalResponse.json();
      
      if (!historicalData.success || !historicalData.data) {
        throw new Error('Invalid historical data response');
      }

      // Transform data to ensure dates are Date objects
      const transformedData = historicalData.data.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      }));

      setData(transformedData);

      // Fetch technical indicators
      try {
        const indicatorsResponse = await fetch(`/api/stocks/technical/${symbol}?period=${fetchPeriod}`);
        
        if (indicatorsResponse.ok) {
          const indicatorsData = await indicatorsResponse.json();
          if (indicatorsData.success && indicatorsData.indicators) {
            setIndicators(indicatorsData.indicators);
          }
        }
      } catch (indicatorError) {
        console.warn('Failed to fetch technical indicators:', indicatorError);
        // Continue without indicators
      }

    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      
      // Generate mock data as fallback
      const mockData = generateMockData(symbol, fetchPeriod);
      setData(mockData);
      setIndicators(generateMockIndicators(mockData));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockData(selectedPeriod);
    }
  }, [symbol, selectedPeriod]);

  const generateMockData = (stockSymbol: string, dataPeriod: string): CandlestickData[] => {
    const days = getPeriodDays(dataPeriod);
    const mockData: CandlestickData[] = [];
    const basePrice = stockSymbol === 'AAPL' ? 150 : 100;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const randomFactor = 0.95 + Math.random() * 0.1; // ±5% variation
      const open = basePrice * randomFactor;
      const close = open * (0.98 + Math.random() * 0.04); // ±2% from open
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.floor(Math.random() * 50000000) + 10000000;
      
      mockData.push({
        date,
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    return mockData;
  };

  const generateMockIndicators = (stockData: CandlestickData[]): TechnicalIndicator => {
    const closes = stockData.map(d => d.close);
    
    // Simple moving averages
    const sma20 = closes.slice(-20).map((_, i) => {
      const slice = closes.slice(Math.max(0, closes.length - 20 + i - 19), closes.length - 20 + i + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
    
    const sma50 = closes.slice(-50).map((_, i) => {
      const slice = closes.slice(Math.max(0, closes.length - 50 + i - 49), closes.length - 50 + i + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });

    // Mock RSI (simplified)
    const rsi = closes.map(() => 30 + Math.random() * 40); // RSI between 30-70

    // Mock MACD
    const macd = {
      line: closes.map(() => -2 + Math.random() * 4),
      signal: closes.map(() => -1.5 + Math.random() * 3),
      histogram: closes.map(() => -1 + Math.random() * 2)
    };

    return {
      sma20,
      sma50,
      rsi,
      macd
    };
  };

  const getPeriodDays = (dataPeriod: string): number => {
    switch (dataPeriod) {
      case '1d': return 1;
      case '5d': return 5;
      case '1mo': return 30;
      case '3mo': return 90;
      case '6mo': return 180;
      case '1y': return 365;
      case '2y': return 730;
      case '5y': return 1825;
      case '10y': return 3650;
      default: return 90;
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod as typeof period);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative ${className}`}
      >
        <div className={`rounded-xl overflow-hidden backdrop-blur-sm border ${
          isDark
            ? 'bg-gray-900/80 border-gray-700'
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {symbol} Price Chart
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading market data...
            </p>
          </div>
          <div className="flex items-center justify-center" style={{ height: height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className={`text-lg font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Fetching {symbol} data...
              </div>
              <div className={`text-sm mt-2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Please wait while we load the latest market data
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error && data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative ${className}`}
      >
        <div className={`rounded-xl overflow-hidden backdrop-blur-sm border ${
          isDark
            ? 'bg-gray-900/80 border-red-700'
            : 'bg-white/80 border-red-200'
        }`}>
          <div className="p-4 border-b border-red-200 dark:border-red-700">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {symbol} Price Chart
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>
              Error loading data
            </p>
          </div>
          <div className="flex items-center justify-center" style={{ height: height }}>
            <div className="text-center">
              <div className={`text-lg font-medium ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>
                Failed to load chart data
              </div>
              <div className={`text-sm mt-2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {error}
              </div>
              <button
                onClick={() => fetchStockData(selectedPeriod)}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className={`mb-4 p-3 rounded-lg ${
          isDark ? 'bg-yellow-900/20 border border-yellow-700 text-yellow-300' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          <p className="text-sm">
            ⚠️ Using fallback data: {error}
          </p>
        </div>
      )}
      
      <CandlestickChart
        data={data}
        indicators={indicators}
        symbol={symbol}
        height={height}
        onPeriodChange={handlePeriodChange}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
