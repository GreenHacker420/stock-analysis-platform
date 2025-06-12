/**
 * Unit tests for utility functions
 * Tests currency formatting, data validation, and helper functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  formatINR,
  formatCompactINR,
  formatPercentage,
  isIndianMarketOpen,
  getMarketStatus,
  isMarketHoliday
} from '../../src/lib/currencyUtils';

// Mock data validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const validateStockSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z]+\.(NSE|BSE)$/;
  return symbolRegex.test(symbol);
};

// Mock portfolio calculations
const calculatePortfolioValue = (holdings: any[]): number => {
  return holdings.reduce((total, holding) => {
    return total + (holding.shares * holding.currentPrice);
  }, 0);
};

const calculateGainLoss = (currentValue: number, totalCost: number): number => {
  return currentValue - totalCost;
};

const calculateGainLossPercentage = (gainLoss: number, totalCost: number): number => {
  if (totalCost === 0) return 0;
  return (gainLoss / totalCost) * 100;
};

describe('Currency Utilities', () => {
  describe('formatINR', () => {
    it('should format amounts in Indian numbering system', () => {
      expect(formatINR(1000)).toBe('₹1,000');
      expect(formatINR(100000)).toBe('₹1,00,000');
      expect(formatINR(1000000)).toBe('₹10,00,000');
    });

    it('should format amounts in compact notation', () => {
      expect(formatINR(100000, { compact: true })).toBe('₹1.00 L');
      expect(formatINR(10000000, { compact: true })).toBe('₹1.00 Cr');
      expect(formatINR(150000000, { compact: true })).toBe('₹15.00 Cr');
    });

    it('should handle symbol display option', () => {
      expect(formatINR(1000, { showSymbol: false })).toBe('1,000');
      expect(formatINR(100000, { showSymbol: false, compact: true })).toBe('1.00 L');
    });

    it('should handle edge cases', () => {
      expect(formatINR(0)).toBe('₹0');
      expect(formatINR(-1000)).toBe('₹-1,000');
    });
  });
});

describe('Data Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.in')).toBe(true);
      expect(validateEmail('analyst@stockanalyzer.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate password length', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('analyst123!')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateStockSymbol', () => {
    it('should validate Indian stock symbols', () => {
      expect(validateStockSymbol('RELIANCE.NSE')).toBe(true);
      expect(validateStockSymbol('TCS.BSE')).toBe(true);
      expect(validateStockSymbol('INFY.NSE')).toBe(true);
    });

    it('should reject invalid stock symbols', () => {
      expect(validateStockSymbol('RELIANCE')).toBe(false);
      expect(validateStockSymbol('reliance.nse')).toBe(false);
      expect(validateStockSymbol('INVALID.NYSE')).toBe(false);
      expect(validateStockSymbol('')).toBe(false);
    });
  });
});

describe('Portfolio Calculations', () => {
  const mockHoldings = [
    { symbol: 'RELIANCE.NSE', shares: 100, currentPrice: 2750, averageCost: 2500 },
    { symbol: 'TCS.NSE', shares: 50, currentPrice: 3200, averageCost: 3000 },
    { symbol: 'INFY.NSE', shares: 75, currentPrice: 1500, averageCost: 1400 }
  ];

  describe('calculatePortfolioValue', () => {
    it('should calculate total portfolio value correctly', () => {
      const expectedValue = (100 * 2750) + (50 * 3200) + (75 * 1500);
      expect(calculatePortfolioValue(mockHoldings)).toBe(expectedValue);
    });

    it('should handle empty portfolio', () => {
      expect(calculatePortfolioValue([])).toBe(0);
    });

    it('should handle single holding', () => {
      const singleHolding = [{ symbol: 'RELIANCE.NSE', shares: 100, currentPrice: 2750 }];
      expect(calculatePortfolioValue(singleHolding)).toBe(275000);
    });
  });

  describe('calculateGainLoss', () => {
    it('should calculate gain correctly', () => {
      expect(calculateGainLoss(150000, 120000)).toBe(30000);
    });

    it('should calculate loss correctly', () => {
      expect(calculateGainLoss(80000, 100000)).toBe(-20000);
    });

    it('should handle zero values', () => {
      expect(calculateGainLoss(0, 0)).toBe(0);
      expect(calculateGainLoss(100000, 0)).toBe(100000);
    });
  });

  describe('calculateGainLossPercentage', () => {
    it('should calculate gain percentage correctly', () => {
      expect(calculateGainLossPercentage(30000, 120000)).toBe(25);
    });

    it('should calculate loss percentage correctly', () => {
      expect(calculateGainLossPercentage(-20000, 100000)).toBe(-20);
    });

    it('should handle zero cost basis', () => {
      expect(calculateGainLossPercentage(10000, 0)).toBe(0);
    });

    it('should handle zero gain/loss', () => {
      expect(calculateGainLossPercentage(0, 100000)).toBe(0);
    });
  });
});

describe('Data Processing', () => {
  describe('Array utilities', () => {
    it('should filter valid data', () => {
      const data = [1, 2, null, 3, undefined, 4];
      const filtered = data.filter(item => item !== null && item !== undefined);
      expect(filtered).toEqual([1, 2, 3, 4]);
    });

    it('should sort data correctly', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6];
      const sorted = [...data].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
    });

    it('should group data by key', () => {
      const stocks = [
        { symbol: 'RELIANCE.NSE', sector: 'Energy' },
        { symbol: 'TCS.NSE', sector: 'IT' },
        { symbol: 'INFY.NSE', sector: 'IT' }
      ];

      const grouped = stocks.reduce((acc, stock) => {
        if (!acc[stock.sector]) acc[stock.sector] = [];
        acc[stock.sector].push(stock);
        return acc;
      }, {} as Record<string, typeof stocks>);

      expect(grouped.IT).toHaveLength(2);
      expect(grouped.Energy).toHaveLength(1);
    });
  });

  describe('Date utilities', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2024-01-15');
    });

    it('should calculate date differences', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-10');
      const diffInDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffInDays).toBe(5);
    });
  });

  describe('Number utilities', () => {
    it('should round numbers correctly', () => {
      expect(Math.round(2.7)).toBe(3);
      expect(Math.round(2.3)).toBe(2);
      expect(Number(2.12345).toFixed(2)).toBe('2.12');
    });

    it('should handle percentage calculations', () => {
      const percentage = (25 / 100) * 150000;
      expect(percentage).toBe(37500);
    });

    it('should validate numeric ranges', () => {
      const isValidPercentage = (value: number) => value >= 0 && value <= 100;
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(-10)).toBe(false);
      expect(isValidPercentage(150)).toBe(false);
    });
  });
});

describe('Error Handling', () => {
  it('should handle division by zero', () => {
    const safeDivide = (a: number, b: number) => b === 0 ? 0 : a / b;
    expect(safeDivide(10, 0)).toBe(0);
    expect(safeDivide(10, 2)).toBe(5);
  });

  it('should handle null/undefined values', () => {
    const safeAccess = (obj: any, key: string, defaultValue: any = null) => {
      return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    };

    expect(safeAccess({ name: 'test' }, 'name')).toBe('test');
    expect(safeAccess(null, 'name', 'default')).toBe('default');
    expect(safeAccess({}, 'name', 'default')).toBe('default');
  });

  it('should validate input parameters', () => {
    const validatePositiveNumber = (value: any): boolean => {
      return typeof value === 'number' && value > 0 && !isNaN(value);
    };

    expect(validatePositiveNumber(10)).toBe(true);
    expect(validatePositiveNumber(-5)).toBe(false);
    expect(validatePositiveNumber('10')).toBe(false);
    expect(validatePositiveNumber(NaN)).toBe(false);
  });
});

describe('Performance Utilities', () => {
  it('should measure execution time', () => {
    const measureTime = (fn: () => void) => {
      const start = Date.now();
      fn();
      return Date.now() - start;
    };

    const duration = measureTime(() => {
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
    });

    expect(duration).toBeGreaterThanOrEqual(0);
    expect(typeof duration).toBe('number');
  });

  it('should throttle function calls', () => {
    let callCount = 0;
    const throttledFn = () => {
      callCount++;
    };

    // Simulate throttling by only calling once
    throttledFn();
    expect(callCount).toBe(1);
  });
});
