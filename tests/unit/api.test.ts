/**
 * Unit tests for API utility functions
 * Tests API helpers, data transformations, and error handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock API response types
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}

interface PortfolioData {
  _id: string;
  name: string;
  totalValue: number;
  totalGainLoss: number;
  holdings: any[];
}

// Mock API utility functions
const createAPIResponse = <T>(data: T, success: boolean = true): APIResponse<T> => {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : 'API Error',
    message: success ? 'Success' : 'Operation failed'
  };
};

const validateStockSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z]+\.(NSE|BSE)$/;
  return symbolRegex.test(symbol);
};

const transformStockData = (rawData: any): StockQuote => {
  if (!rawData) {
    return {
      symbol: '',
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  return {
    symbol: rawData.symbol || '',
    price: parseFloat(rawData.price) || 0,
    change: parseFloat(rawData.change) || 0,
    changePercent: parseFloat(rawData.changePercent) || 0,
    volume: parseInt(rawData.volume) || 0,
    marketCap: parseFloat(rawData.marketCap) || 0,
    lastUpdated: rawData.lastUpdated || new Date().toISOString()
  };
};

const calculatePortfolioMetrics = (holdings: any[]): { totalValue: number; totalCost: number; gainLoss: number } => {
  const totalValue = holdings.reduce((sum, holding) => sum + (holding.shares * holding.currentPrice), 0);
  const totalCost = holdings.reduce((sum, holding) => sum + (holding.shares * holding.averageCost), 0);
  const gainLoss = totalValue - totalCost;
  
  return { totalValue, totalCost, gainLoss };
};

const handleAPIError = (error: any): APIResponse => {
  console.error('API Error:', error);
  return {
    success: false,
    error: error?.message || 'Unknown error occurred',
    message: 'Request failed'
  };
};

const validateRequestData = (data: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

describe('API Utility Functions', () => {
  describe('createAPIResponse', () => {
    it('should create successful API response', () => {
      const data = { message: 'Test data' };
      const response = createAPIResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
      expect(response.message).toBe('Success');
    });

    it('should create error API response', () => {
      const data = null;
      const response = createAPIResponse(data, false);

      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error).toBe('API Error');
      expect(response.message).toBe('Operation failed');
    });

    it('should handle different data types', () => {
      const stringResponse = createAPIResponse('test string');
      const numberResponse = createAPIResponse(42);
      const arrayResponse = createAPIResponse([1, 2, 3]);
      const objectResponse = createAPIResponse({ key: 'value' });

      expect(stringResponse.data).toBe('test string');
      expect(numberResponse.data).toBe(42);
      expect(arrayResponse.data).toEqual([1, 2, 3]);
      expect(objectResponse.data).toEqual({ key: 'value' });
    });
  });

  describe('validateStockSymbol', () => {
    it('should validate correct Indian stock symbols', () => {
      const validSymbols = [
        'RELIANCE.NSE',
        'TCS.BSE',
        'INFY.NSE',
        'HDFC.BSE',
        'WIPRO.NSE',
        'ICICIBANK.BSE'
      ];

      validSymbols.forEach(symbol => {
        expect(validateStockSymbol(symbol)).toBe(true);
      });
    });

    it('should reject invalid stock symbols', () => {
      const invalidSymbols = [
        'RELIANCE',
        'tcs.nse',
        'INVALID.NYSE',
        'SYMBOL.NASDAQ',
        '',
        'SYMBOL.',
        '.NSE',
        'SYMBOL.NSE.EXTRA'
      ];

      invalidSymbols.forEach(symbol => {
        expect(validateStockSymbol(symbol)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateStockSymbol('A.NSE')).toBe(true); // Single letter
      expect(validateStockSymbol('VERYLONGSTOCKNAME.BSE')).toBe(true); // Long name
      expect(validateStockSymbol('123.NSE')).toBe(false); // Numbers
      expect(validateStockSymbol('STOCK-NAME.NSE')).toBe(false); // Hyphen
    });
  });

  describe('transformStockData', () => {
    it('should transform raw stock data correctly', () => {
      const rawData = {
        symbol: 'RELIANCE.NSE',
        price: '2750.50',
        change: '25.30',
        changePercent: '0.93',
        volume: '1234567',
        marketCap: '1850000000000',
        lastUpdated: '2024-01-15T10:30:00Z'
      };

      const transformed = transformStockData(rawData);

      expect(transformed.symbol).toBe('RELIANCE.NSE');
      expect(transformed.price).toBe(2750.50);
      expect(transformed.change).toBe(25.30);
      expect(transformed.changePercent).toBe(0.93);
      expect(transformed.volume).toBe(1234567);
      expect(transformed.marketCap).toBe(1850000000000);
      expect(transformed.lastUpdated).toBe('2024-01-15T10:30:00Z');
    });

    it('should handle missing or invalid data', () => {
      const rawData = {
        symbol: 'TCS.NSE',
        price: 'invalid',
        change: null,
        volume: 'not-a-number'
      };

      const transformed = transformStockData(rawData);

      expect(transformed.symbol).toBe('TCS.NSE');
      expect(transformed.price).toBe(0);
      expect(transformed.change).toBe(0);
      expect(transformed.changePercent).toBe(0);
      expect(transformed.volume).toBe(0);
      expect(transformed.marketCap).toBe(0);
      expect(transformed.lastUpdated).toBeDefined();
    });

    it('should handle empty or null input', () => {
      const transformed1 = transformStockData({});
      const transformed2 = transformStockData(null);

      expect(transformed1.symbol).toBe('');
      expect(transformed1.price).toBe(0);
      expect(transformed2.symbol).toBe('');
      expect(transformed2.price).toBe(0);
    });
  });

  describe('calculatePortfolioMetrics', () => {
    it('should calculate portfolio metrics correctly', () => {
      const holdings = [
        { symbol: 'RELIANCE.NSE', shares: 100, currentPrice: 2750, averageCost: 2500 },
        { symbol: 'TCS.NSE', shares: 50, currentPrice: 3200, averageCost: 3000 },
        { symbol: 'INFY.NSE', shares: 75, currentPrice: 1500, averageCost: 1400 }
      ];

      const metrics = calculatePortfolioMetrics(holdings);

      expect(metrics.totalValue).toBe(547500); // (100*2750) + (50*3200) + (75*1500)
      expect(metrics.totalCost).toBe(505000); // (100*2500) + (50*3000) + (75*1400)
      expect(metrics.gainLoss).toBe(42500); // 547500 - 505000
    });

    it('should handle empty portfolio', () => {
      const metrics = calculatePortfolioMetrics([]);

      expect(metrics.totalValue).toBe(0);
      expect(metrics.totalCost).toBe(0);
      expect(metrics.gainLoss).toBe(0);
    });

    it('should handle portfolio with losses', () => {
      const holdings = [
        { symbol: 'STOCK.NSE', shares: 100, currentPrice: 80, averageCost: 100 }
      ];

      const metrics = calculatePortfolioMetrics(holdings);

      expect(metrics.totalValue).toBe(8000);
      expect(metrics.totalCost).toBe(10000);
      expect(metrics.gainLoss).toBe(-2000);
    });
  });

  describe('handleAPIError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle standard Error objects', () => {
      const error = new Error('Test error message');
      const response = handleAPIError(error);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Test error message');
      expect(response.message).toBe('Request failed');
      expect(console.error).toHaveBeenCalledWith('API Error:', error);
    });

    it('should handle unknown error types', () => {
      const error = 'String error';
      const response = handleAPIError(error);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Unknown error occurred');
      expect(response.message).toBe('Request failed');
    });

    it('should handle null or undefined errors', () => {
      const response1 = handleAPIError(null);
      const response2 = handleAPIError(undefined);

      expect(response1.success).toBe(false);
      expect(response1.error).toBe('Unknown error occurred');
      expect(response2.success).toBe(false);
      expect(response2.error).toBe('Unknown error occurred');
    });
  });

  describe('validateRequestData', () => {
    it('should validate complete request data', () => {
      const data = {
        portfolioId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        analysisType: 'comprehensive'
      };
      const requiredFields = ['portfolioId', 'userId', 'analysisType'];

      const validation = validateRequestData(data, requiredFields);

      expect(validation.isValid).toBe(true);
      expect(validation.missingFields).toEqual([]);
    });

    it('should identify missing required fields', () => {
      const data = {
        portfolioId: '507f1f77bcf86cd799439011',
        analysisType: 'comprehensive'
      };
      const requiredFields = ['portfolioId', 'userId', 'analysisType'];

      const validation = validateRequestData(data, requiredFields);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toEqual(['userId']);
    });

    it('should handle empty data object', () => {
      const data = {};
      const requiredFields = ['field1', 'field2'];

      const validation = validateRequestData(data, requiredFields);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toEqual(['field1', 'field2']);
    });

    it('should handle null or undefined values as missing', () => {
      const data = {
        field1: 'value1',
        field2: null,
        field3: undefined,
        field4: '',
        field5: 0,
        field6: false
      };
      const requiredFields = ['field1', 'field2', 'field3', 'field4', 'field5', 'field6'];

      const validation = validateRequestData(data, requiredFields);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toEqual(['field2', 'field3', 'field4']);
    });
  });
});
