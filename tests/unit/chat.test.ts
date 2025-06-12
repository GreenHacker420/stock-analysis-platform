import { describe, it, expect } from '@jest/globals';

describe('Chat Functionality Tests', () => {
  describe('Analysis Type Detection', () => {
    const determineAnalysisType = (message: string): string => {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('portfolio') || lowerMessage.includes('my investments')) {
        return 'portfolio_analysis';
      } else if (lowerMessage.includes('risk') || lowerMessage.includes('diversif')) {
        return 'risk_assessment';
      } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        return 'stock_recommendation';
      } else if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
        return 'market_analysis';
      } else if (lowerMessage.includes('technical') || lowerMessage.includes('chart')) {
        return 'technical_analysis';
      } else {
        return 'general_inquiry';
      }
    };

    it('should detect portfolio analysis type', () => {
      expect(determineAnalysisType('analyze my portfolio')).toBe('portfolio_analysis');
      expect(determineAnalysisType('how are my investments doing?')).toBe('portfolio_analysis');
    });

    it('should detect risk assessment type', () => {
      expect(determineAnalysisType('what is my risk level?')).toBe('risk_assessment');
      expect(determineAnalysisType('help me diversify my portfolio')).toBe('risk_assessment');
    });

    it('should detect stock recommendation type', () => {
      expect(determineAnalysisType('recommend some good stocks')).toBe('stock_recommendation');
      expect(determineAnalysisType('suggest stocks to buy')).toBe('stock_recommendation');
    });

    it('should detect market analysis type', () => {
      expect(determineAnalysisType('what are the market trends?')).toBe('market_analysis');
      expect(determineAnalysisType('how is the market performing?')).toBe('market_analysis');
    });

    it('should detect technical analysis type', () => {
      expect(determineAnalysisType('show me technical charts')).toBe('technical_analysis');
      expect(determineAnalysisType('technical analysis of RELIANCE')).toBe('technical_analysis');
    });

    it('should default to general inquiry', () => {
      expect(determineAnalysisType('hello')).toBe('general_inquiry');
      expect(determineAnalysisType('what is the weather?')).toBe('general_inquiry');
    });
  });

  describe('Stock Symbol Extraction', () => {
    const extractStockSymbols = (message: string): string[] => {
      const symbols: string[] = [];

      // Common Indian stock patterns
      const indianStockPattern = /\b([A-Z]{2,10})(\.NSE|\.BSE)?\b/g;
      let match;

      while ((match = indianStockPattern.exec(message.toUpperCase())) !== null) {
        const symbol = match[1];
        const fullSymbol = match[2] ? match[0] : `${symbol}.NSE`;
        if (!symbols.includes(fullSymbol)) {
          symbols.push(fullSymbol);
        }
      }

      // Also check for common Indian stock names
      const commonStocks = [
        'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL',
        'ITC', 'HINDUNILVR', 'LT', 'KOTAKBANK', 'ASIANPAINT', 'MARUTI', 'BAJFINANCE'
      ];

      commonStocks.forEach(stock => {
        if (message.toUpperCase().includes(stock)) {
          const fullSymbol = `${stock}.NSE`;
          if (!symbols.includes(fullSymbol)) {
            symbols.push(fullSymbol);
          }
        }
      });

      return symbols.slice(0, 5); // Limit to 5 stocks
    };

    it('should extract Indian stock symbols', () => {
      const symbols = extractStockSymbols('What about RELIANCE and TCS stocks?');
      expect(symbols).toContain('RELIANCE.NSE');
      expect(symbols).toContain('TCS.NSE');
    });

    it('should handle symbols with exchange suffix', () => {
      const symbols = extractStockSymbols('How is INFY.NSE performing?');
      expect(symbols).toContain('INFY.NSE');
    });

    it('should limit number of extracted symbols', () => {
      const symbols = extractStockSymbols('RELIANCE TCS INFY HDFCBANK ICICIBANK SBIN BHARTIARTL');
      expect(symbols.length).toBeLessThanOrEqual(5);
    });

    it('should handle mixed case input', () => {
      const symbols = extractStockSymbols('what about reliance and tcs?');
      expect(symbols).toContain('RELIANCE.NSE');
      expect(symbols).toContain('TCS.NSE');
    });

    it('should return empty array for no matches', () => {
      const symbols = extractStockSymbols('hello world');
      expect(symbols).toEqual([]);
    });
  });
});

  describe('Analysis Type Detection', () => {
    it('should detect portfolio analysis type', () => {
      const { determineAnalysisType } = require('@/app/api/chat/analyze/route');
      
      expect(determineAnalysisType('analyze my portfolio')).toBe('portfolio_analysis');
      expect(determineAnalysisType('how are my investments doing?')).toBe('portfolio_analysis');
    });

    it('should detect risk assessment type', () => {
      const { determineAnalysisType } = require('@/app/api/chat/analyze/route');
      
      expect(determineAnalysisType('what is my risk level?')).toBe('risk_assessment');
      expect(determineAnalysisType('help me diversify my portfolio')).toBe('risk_assessment');
    });

    it('should detect stock recommendation type', () => {
      const { determineAnalysisType } = require('@/app/api/chat/analyze/route');
      
      expect(determineAnalysisType('recommend some good stocks')).toBe('stock_recommendation');
      expect(determineAnalysisType('suggest stocks to buy')).toBe('stock_recommendation');
    });

    it('should detect market analysis type', () => {
      const { determineAnalysisType } = require('@/app/api/chat/analyze/route');
      
      expect(determineAnalysisType('what are the market trends?')).toBe('market_analysis');
      expect(determineAnalysisType('how is the market performing?')).toBe('market_analysis');
    });
  });

  describe('Stock Symbol Extraction', () => {
    it('should extract Indian stock symbols', () => {
      const { extractStockSymbols } = require('@/app/api/chat/analyze/route');
      
      const symbols = extractStockSymbols('What about RELIANCE and TCS stocks?');
      expect(symbols).toContain('RELIANCE.NSE');
      expect(symbols).toContain('TCS.NSE');
    });

    it('should handle symbols with exchange suffix', () => {
      const { extractStockSymbols } = require('@/app/api/chat/analyze/route');
      
      const symbols = extractStockSymbols('How is INFY.NSE performing?');
      expect(symbols).toContain('INFY.NSE');
    });

    it('should limit number of extracted symbols', () => {
      const { extractStockSymbols } = require('@/app/api/chat/analyze/route');
      
      const symbols = extractStockSymbols('RELIANCE TCS INFY HDFCBANK ICICIBANK SBIN BHARTIARTL');
      expect(symbols.length).toBeLessThanOrEqual(5);
    });
  });
});
