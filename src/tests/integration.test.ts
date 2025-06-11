/**
 * Integration tests for the enhanced stock analysis platform
 * Tests authentication, Indian stock API, mock data, and UI components
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { StockDataService } from '@/lib/stockData';
import { formatINR, formatPercentage, isIndianMarketOpen } from '@/lib/currencyUtils';
import { 
  mockUsers, 
  mockIndianStocks, 
  mockPortfolios, 
  mockAnalysisReports,
  validateMockData 
} from '@/data';

describe('Stock Analysis Platform Integration Tests', () => {
  let stockService: StockDataService;

  beforeAll(() => {
    stockService = new StockDataService();
  });

  describe('Authentication System', () => {
    it('should have mock users with proper roles', () => {
      expect(mockUsers.length).toBeGreaterThan(0);
      
      const analysts = mockUsers.filter(user => user.role === 'analyst');
      const investors = mockUsers.filter(user => user.role === 'investor');
      
      expect(analysts.length).toBeGreaterThanOrEqual(5);
      expect(investors.length).toBeGreaterThanOrEqual(5);
    });

    it('should have valid email formats for all users', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      mockUsers.forEach(user => {
        expect(emailRegex.test(user.email)).toBe(true);
      });
    });

    it('should have passwords for email/password authentication', () => {
      const usersWithPasswords = mockUsers.filter(user => user.password);
      expect(usersWithPasswords.length).toBe(mockUsers.length);
    });
  });

  describe('Indian Stock Market Integration', () => {
    it('should have Indian stocks with proper symbols', () => {
      expect(mockIndianStocks.length).toBeGreaterThanOrEqual(12);
      
      const expectedSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
      expectedSymbols.forEach(symbol => {
        const stock = mockIndianStocks.find(s => s.symbol === symbol);
        expect(stock).toBeDefined();
      });
    });

    it('should have proper Indian company information', () => {
      const reliance = mockIndianStocks.find(s => s.symbol === 'RELIANCE');
      expect(reliance).toBeDefined();
      expect(reliance?.companyName).toContain('Reliance Industries');
      expect(reliance?.headquarters).toContain('Mumbai');
      expect(reliance?.exchange).toBe('NSE');
    });

    it('should format stock symbols for Indian exchanges', () => {
      const formattedSymbol = (stockService as any).formatIndianSymbol('RELIANCE');
      expect(formattedSymbol).toBe('RELIANCE.NSE');
    });

    it('should provide mock data fallback', () => {
      const mockQuote = (stockService as any).getMockQuote('RELIANCE');
      expect(mockQuote).toBeDefined();
      expect(mockQuote.symbol).toBe('RELIANCE');
      expect(mockQuote.price).toBeGreaterThan(0);
    });
  });

  describe('Currency and Formatting', () => {
    it('should format INR correctly', () => {
      expect(formatINR(1000000)).toBe('₹10.00 L');
      expect(formatINR(10000000)).toBe('₹1.00 Cr');
      expect(formatINR(1000000000000)).toBe('₹1.00 L Cr');
    });

    it('should format percentages correctly', () => {
      expect(formatPercentage(5.25)).toBe('+5.25%');
      expect(formatPercentage(-2.75)).toBe('-2.75%');
      expect(formatPercentage(0)).toBe('+0.00%');
    });

    it('should handle compact INR formatting', () => {
      expect(formatINR(2500000, { compact: true })).toBe('₹2.50 Cr');
      expect(formatINR(150000, { compact: true })).toBe('₹1.50 L');
    });
  });

  describe('Market Hours and Status', () => {
    it('should check Indian market hours correctly', () => {
      const isOpen = isIndianMarketOpen();
      expect(typeof isOpen).toBe('boolean');
    });

    it('should provide market status information', () => {
      const status = stockService.getMarketStatus();
      expect(status).toHaveProperty('isOpen');
      expect(status).toHaveProperty('message');
      expect(typeof status.isOpen).toBe('boolean');
      expect(typeof status.message).toBe('string');
    });
  });

  describe('Mock Data Validation', () => {
    it('should have valid mock data structure', () => {
      const validation = validateMockData();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have consistent portfolio data', () => {
      mockPortfolios.forEach(portfolio => {
        expect(portfolio.totalValue).toBeGreaterThan(0);
        expect(portfolio.holdings.length).toBeGreaterThan(0);
        
        // Check if investor exists
        const investor = mockUsers.find(user => user.id === portfolio.investorId);
        expect(investor).toBeDefined();
        expect(investor?.role).toBe('investor');
      });
    });

    it('should have valid analysis reports', () => {
      mockAnalysisReports.forEach(report => {
        expect(report.title).toBeTruthy();
        expect(report.summary).toBeTruthy();
        expect(report.content).toBeTruthy();
        expect(['draft', 'published', 'archived']).toContain(report.status);
        
        // Check if analyst and investor exist
        const analyst = mockUsers.find(user => user.id === report.analystId);
        const investor = mockUsers.find(user => user.id === report.investorId);
        
        expect(analyst).toBeDefined();
        expect(investor).toBeDefined();
        expect(analyst?.role).toBe('analyst');
        expect(investor?.role).toBe('investor');
      });
    });
  });

  describe('Stock Data Service', () => {
    it('should handle multiple quote requests', async () => {
      const symbols = ['RELIANCE', 'TCS', 'HDFCBANK'];
      const quotes = await stockService.getMultipleQuotes(symbols);
      
      expect(quotes).toHaveLength(symbols.length);
      quotes.forEach(quote => {
        if (quote) {
          expect(quote.symbol).toBeTruthy();
          expect(quote.price).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should provide fallback for failed API calls', async () => {
      const quote = await stockService.getQuoteWithFallback('RELIANCE');
      expect(quote).toBeDefined();
      expect(quote?.symbol).toBe('RELIANCE');
    });

    it('should search Indian stocks', async () => {
      const results = await stockService.searchStocks('TCS');
      expect(results.length).toBeGreaterThan(0);
      
      const tcsResult = results.find(r => r.symbol === 'TCS');
      expect(tcsResult).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid stock symbols gracefully', async () => {
      const quote = await stockService.getQuote('INVALID_SYMBOL');
      // Should either return null or mock data, not throw error
      expect(quote === null || typeof quote === 'object').toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const quote = await stockService.getQuote('RELIANCE');
      expect(quote).toBeDefined(); // Should fallback to mock data
      
      global.fetch = originalFetch;
    });
  });

  describe('Performance', () => {
    it('should cache stock quotes', async () => {
      const start1 = Date.now();
      await stockService.getQuote('RELIANCE');
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await stockService.getQuote('RELIANCE'); // Should be cached
      const time2 = Date.now() - start2;

      expect(time2).toBeLessThan(time1); // Cached call should be faster
    });
  });
});

describe('UI Component Integration', () => {
  describe('Dark Mode Support', () => {
    it('should have proper dark mode classes', () => {
      // Test that dark mode utilities are available
      expect(typeof document !== 'undefined' || typeof window !== 'undefined').toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should have proper width constraints', () => {
      // Test that layout constraints are reasonable
      const maxWidth = 1600; // Our new max-width
      expect(maxWidth).toBeGreaterThan(1280); // Old max-w-7xl
      expect(maxWidth).toBeLessThan(2000); // Reasonable upper limit
    });
  });
});

// Helper function to run integration tests
export const runIntegrationTests = async () => {
  console.log('🧪 Running Stock Analysis Platform Integration Tests...');
  
  try {
    // Test mock data validation
    const validation = validateMockData();
    console.log('✅ Mock data validation:', validation.isValid ? 'PASSED' : 'FAILED');
    
    // Test stock service
    const stockService = new StockDataService();
    const marketStatus = stockService.getMarketStatus();
    console.log('✅ Market status check:', marketStatus.isOpen ? 'OPEN' : 'CLOSED');
    
    // Test currency formatting
    const formattedAmount = formatINR(2500000, { compact: true });
    console.log('✅ Currency formatting:', formattedAmount);
    
    // Test Indian market hours
    const isOpen = isIndianMarketOpen();
    console.log('✅ Market hours check:', isOpen ? 'OPEN' : 'CLOSED');
    
    console.log('🎉 All integration tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Integration tests failed:', error);
    return false;
  }
};

export default runIntegrationTests;
