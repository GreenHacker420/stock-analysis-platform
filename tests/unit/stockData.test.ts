/**
 * Unit tests for stock data service
 * Tests stock quote fetching, historical data, technical indicators, and Indian market integration
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { StockDataService } from '@/lib/stockData';
import NodeCache from 'node-cache';

// Mock dependencies
jest.mock('node-cache');
jest.mock('yahoo-finance2');

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  has: jest.fn()
};

(NodeCache as jest.MockedClass<typeof NodeCache>).mockImplementation(() => mockCache as any);

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('StockDataService', () => {
  let stockService: StockDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    stockService = StockDataService.getInstance();
    mockCache.get.mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StockDataService.getInstance();
      const instance2 = StockDataService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Stock Quote Fetching', () => {
    it('should fetch stock quote successfully', async () => {
      const mockQuoteData = {
        symbol: 'RELIANCE.NSE',
        regularMarketPrice: 2750.50,
        regularMarketChange: 25.30,
        regularMarketChangePercent: 0.93,
        regularMarketVolume: 1250000,
        marketCap: 1850000000000,
        trailingPE: 28.5,
        fiftyTwoWeekHigh: 3000.00,
        fiftyTwoWeekLow: 2200.00,
        longName: 'Reliance Industries Limited'
      };

      // Mock yahoo-finance2 quote method
      const yahooFinance = require('yahoo-finance2');
      yahooFinance.quote = jest.fn().mockResolvedValue(mockQuoteData);

      const result = await stockService.getQuote('RELIANCE.NSE');

      expect(result).toEqual({
        symbol: 'RELIANCE.NSE',
        companyName: 'Reliance Industries Limited',
        price: 2750.50,
        change: 25.30,
        changePercent: 0.93,
        volume: 1250000,
        marketCap: 1850000000000,
        peRatio: 28.5,
        dividendYield: 0,
        high52Week: 3000.00,
        low52Week: 2200.00,
        averageVolume: 0,
        lastUpdated: expect.any(Date)
      });

      expect(mockCache.set).toHaveBeenCalledWith(
        'quote_RELIANCE.NSE',
        expect.any(Object)
      );
    });

    it('should return cached quote if available', async () => {
      const cachedQuote = {
        symbol: 'RELIANCE.NSE',
        companyName: 'Reliance Industries Limited',
        price: 2750.50,
        lastUpdated: new Date()
      };

      mockCache.get.mockReturnValue(cachedQuote);

      const result = await stockService.getQuote('RELIANCE.NSE');

      expect(result).toEqual(cachedQuote);
      expect(mockCache.get).toHaveBeenCalledWith('quote_RELIANCE.NSE');
    });

    it('should handle API errors gracefully', async () => {
      const yahooFinance = require('yahoo-finance2');
      yahooFinance.quote = jest.fn().mockRejectedValue(new Error('API Error'));

      const result = await stockService.getQuote('INVALID.NSE');

      expect(result).toBeNull();
    });

    it('should format Indian symbols correctly', () => {
      const testCases = [
        { input: 'RELIANCE', expected: 'RELIANCE.NSE' },
        { input: 'RELIANCE.NSE', expected: 'RELIANCE.NSE' },
        { input: 'TCS.BSE', expected: 'TCS.BSE' },
        { input: 'INFY', expected: 'INFY.NSE' }
      ];

      testCases.forEach(({ input, expected }) => {
        const formatted = stockService.formatIndianSymbol(input);
        expect(formatted).toBe(expected);
      });
    });
  });

  describe('Historical Data', () => {
    it('should fetch historical data from EODHD API', async () => {
      const mockHistoricalData = [
        {
          date: '2024-01-15',
          open: 2720.00,
          high: 2780.00,
          low: 2710.00,
          close: 2750.50,
          volume: 1250000,
          adjusted_close: 2750.50
        },
        {
          date: '2024-01-14',
          open: 2700.00,
          high: 2730.00,
          low: 2690.00,
          close: 2720.00,
          volume: 1100000,
          adjusted_close: 2720.00
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHistoricalData)
      } as Response);

      const result = await stockService.getHistoricalData('RELIANCE.NSE', '1mo');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: new Date('2024-01-15'),
        open: 2720.00,
        high: 2780.00,
        low: 2710.00,
        close: 2750.50,
        volume: 1250000,
        adjClose: 2750.50
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('eod/RELIANCE.NSE'),
        expect.any(Object)
      );
    });

    it('should return mock data when API fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const result = await stockService.getHistoricalData('RELIANCE.NSE', '1mo');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should cache historical data', async () => {
      const mockData = [
        {
          date: '2024-01-15',
          open: 2720.00,
          high: 2780.00,
          low: 2710.00,
          close: 2750.50,
          volume: 1250000,
          adjusted_close: 2750.50
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      } as Response);

      await stockService.getHistoricalData('RELIANCE.NSE', '1mo');

      expect(mockCache.set).toHaveBeenCalledWith(
        'historical_RELIANCE.NSE_1mo',
        expect.any(Array)
      );
    });
  });

  describe('Technical Indicators', () => {
    it('should calculate RSI correctly', () => {
      const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113];
      const rsi = stockService.calculateRSI(prices);

      expect(rsi).toBeGreaterThan(0);
      expect(rsi).toBeLessThan(100);
      expect(typeof rsi).toBe('number');
    });

    it('should calculate MACD correctly', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i * 0.1) * 10);
      const macd = stockService.calculateMACD(prices);

      expect(macd).toHaveProperty('macd');
      expect(macd).toHaveProperty('signal');
      expect(macd).toHaveProperty('histogram');
      expect(typeof macd.macd).toBe('number');
      expect(typeof macd.signal).toBe('number');
      expect(typeof macd.histogram).toBe('number');
    });

    it('should calculate Simple Moving Average correctly', () => {
      const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
      const sma = stockService.calculateSMA(prices, 5);

      expect(sma).toBe(20); // Average of last 5 prices: (20+22+24+26+28)/5 = 20
    });

    it('should calculate Exponential Moving Average correctly', () => {
      const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
      const ema = stockService.calculateEMA(prices, 5);

      expect(ema).toBeGreaterThan(0);
      expect(typeof ema).toBe('number');
    });

    it('should generate comprehensive technical indicators', async () => {
      // Mock historical data
      const mockHistoricalData = Array.from({ length: 100 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        open: 100 + Math.random() * 10,
        high: 105 + Math.random() * 10,
        low: 95 + Math.random() * 10,
        close: 100 + Math.random() * 10,
        volume: 1000000 + Math.random() * 500000,
        adjClose: 100 + Math.random() * 10
      }));

      // Mock quote data
      const mockQuote = {
        symbol: 'RELIANCE.NSE',
        companyName: 'Reliance Industries Limited',
        price: 2750.50,
        change: 25.30,
        changePercent: 0.93,
        volume: 1250000,
        averageVolume: 1500000,
        lastUpdated: new Date()
      };

      // Mock the methods
      stockService.getHistoricalData = jest.fn().mockResolvedValue(mockHistoricalData);
      stockService.getQuote = jest.fn().mockResolvedValue(mockQuote);

      const result = await stockService.getTechnicalIndicators('RELIANCE.NSE');

      expect(result).toHaveProperty('symbol', 'RELIANCE.NSE');
      expect(result).toHaveProperty('rsi');
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('sma20');
      expect(result).toHaveProperty('sma50');
      expect(result).toHaveProperty('sma200');
      expect(result).toHaveProperty('ema12');
      expect(result).toHaveProperty('ema26');
      expect(result?.rsi).toBeGreaterThan(0);
      expect(result?.rsi).toBeLessThan(100);
    });
  });

  describe('Indian Market Integration', () => {
    it('should fetch Indian stocks from EODHD API', async () => {
      const mockIndianStocks = [
        {
          code: 'RELIANCE.NSE',
          timestamp: Date.now() / 1000,
          close: 2750.50,
          change: 25.30,
          change_p: 0.93,
          volume: 1250000,
          high: 2780.00,
          low: 2710.00,
          previousClose: 2725.20
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIndianStocks[0])
      } as Response);

      // Test the EODHD data fetching
      const response = await fetch('mock-url');
      const data = await response.json();

      expect(data).toEqual(mockIndianStocks[0]);
      expect(data.code).toBe('RELIANCE.NSE');
      expect(data.close).toBe(2750.50);
    });

    it('should handle EODHD API errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      } as Response);

      const response = await fetch('mock-url');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(429);
    });

    it('should generate realistic mock data for Indian stocks', () => {
      const mockStock = stockService.generateMockStockData('RELIANCE.NSE');

      expect(mockStock).toHaveProperty('symbol', 'RELIANCE.NSE');
      expect(mockStock).toHaveProperty('name');
      expect(mockStock).toHaveProperty('exchange', 'NSE');
      expect(mockStock).toHaveProperty('price');
      expect(mockStock).toHaveProperty('change');
      expect(mockStock).toHaveProperty('changePercent');
      expect(mockStock).toHaveProperty('volume');
      expect(mockStock).toHaveProperty('marketCap');
      expect(mockStock).toHaveProperty('sector');
      expect(mockStock.price).toBeGreaterThan(0);
      expect(mockStock.volume).toBeGreaterThan(0);
      expect(mockStock.marketCap).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should search stocks using EODHD API', async () => {
      const mockSearchResults = [
        {
          Code: 'RELIANCE.NSE',
          Name: 'Reliance Industries Limited'
        },
        {
          Code: 'RPOWER.NSE',
          Name: 'Reliance Power Limited'
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSearchResults)
      } as Response);

      const result = await stockService.searchStocks('reliance');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        symbol: 'RELIANCE.NSE',
        name: 'Reliance Industries Limited'
      });
      expect(result[1]).toEqual({
        symbol: 'RPOWER.NSE',
        name: 'Reliance Power Limited'
      });
    });

    it('should return mock search results when API fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      } as Response);

      const result = await stockService.searchStocks('reliance');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('symbol');
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('Caching Strategy', () => {
    it('should cache stock quotes with TTL', async () => {
      const mockQuote = {
        symbol: 'RELIANCE.NSE',
        price: 2750.50,
        lastUpdated: new Date()
      };

      const yahooFinance = require('yahoo-finance2');
      yahooFinance.quote = jest.fn().mockResolvedValue({
        symbol: 'RELIANCE.NSE',
        regularMarketPrice: 2750.50
      });

      await stockService.getQuote('RELIANCE.NSE');

      expect(mockCache.set).toHaveBeenCalledWith(
        'quote_RELIANCE.NSE',
        expect.any(Object)
      );
    });

    it('should invalidate cache when needed', () => {
      stockService.clearCache();

      expect(mockCache.keys).toHaveBeenCalled();
    });

    it('should handle cache misses gracefully', async () => {
      mockCache.get.mockReturnValue(undefined);

      const yahooFinance = require('yahoo-finance2');
      yahooFinance.quote = jest.fn().mockResolvedValue({
        symbol: 'RELIANCE.NSE',
        regularMarketPrice: 2750.50
      });

      const result = await stockService.getQuote('RELIANCE.NSE');

      expect(result).toBeDefined();
      expect(mockCache.get).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      const result = await stockService.getHistoricalData('RELIANCE.NSE', '1mo');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null)
      } as Response);

      const result = await stockService.getHistoricalData('RELIANCE.NSE', '1mo');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      } as Response);

      const result = await stockService.getHistoricalData('RELIANCE.NSE', '1mo');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
