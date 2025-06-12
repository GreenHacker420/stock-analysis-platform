/**
 * Unit tests for AI analysis functionality
 * Tests Google Gemini AI integration, prompt generation, and response parsing
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GeminiAIService, AnalysisRequest, AIAnalysisResult } from '@/lib/geminiAI';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai');

const mockGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;
const mockModel = {
  generateContent: jest.fn()
};

const mockGenAI = {
  getGenerativeModel: jest.fn().mockReturnValue(mockModel)
};

mockGoogleGenerativeAI.mockImplementation(() => mockGenAI as any);

describe('AI Analysis Service', () => {
  let aiService: GeminiAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new GeminiAIService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with Gemini 2.0 Flash model', () => {
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash'
      });
    });

    it('should handle missing API key gracefully', () => {
      const originalEnv = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => new GeminiAIService()).not.toThrow();

      process.env.GEMINI_API_KEY = originalEnv;
    });
  });

  describe('Portfolio Analysis Generation', () => {
    const mockAnalysisRequest: AnalysisRequest = {
      portfolio: {
        _id: 'portfolio_id_123',
        investorId: 'investor_id_123',
        name: 'Test Portfolio',
        totalValue: 150000,
        totalCost: 120000,
        totalGainLoss: 30000,
        totalGainLossPercentage: 25.0,
        holdings: [
          {
            symbol: 'RELIANCE.NSE',
            companyName: 'Reliance Industries',
            shares: 100,
            averageCost: 2500,
            currentPrice: 2750,
            marketValue: 275000,
            gainLoss: 25000,
            gainLossPercentage: 10.0,
            lastUpdated: new Date()
          }
        ],
        cash: 25000,
        isActive: true,
        riskScore: 65,
        diversificationScore: 70,
        performanceMetrics: {
          dailyReturn: 1.5,
          weeklyReturn: 3.2,
          monthlyReturn: 8.7,
          yearlyReturn: 25.0,
          volatility: 15.2,
          sharpeRatio: 1.8
        },
        createdAt: new Date(),
        updatedAt: new Date()
      } as any,
      user: {
        _id: 'user_id_123',
        email: 'investor@example.com',
        name: 'Test Investor',
        role: 'investor',
        preferences: {
          riskTolerance: 'medium',
          investmentGoals: ['growth', 'income'],
          notifications: { email: true, push: false }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any,
      stockQuotes: [
        {
          symbol: 'RELIANCE.NSE',
          companyName: 'Reliance Industries Limited',
          price: 2750.50,
          change: 25.30,
          changePercent: 0.93,
          volume: 1250000,
          marketCap: 1850000000000,
          peRatio: 28.5,
          dividendYield: 0.35,
          high52Week: 3000.00,
          low52Week: 2200.00,
          averageVolume: 1500000,
          lastUpdated: new Date()
        }
      ],
      technicalIndicators: [
        {
          symbol: 'RELIANCE.NSE',
          rsi: 65.5,
          macd: {
            macd: 15.2,
            signal: 12.8,
            histogram: 2.4
          },
          sma20: 2680.50,
          sma50: 2620.30,
          sma200: 2580.75,
          ema12: 2720.80,
          ema26: 2650.40,
          volume: 1250000,
          averageVolume: 1500000,
          priceChange24h: 25.30,
          priceChangePercent24h: 0.93,
          lastUpdated: new Date()
        }
      ],
      marketConditions: {
        overall: 'bullish',
        volatility: 'medium',
        trend: 'upward'
      }
    };

    it('should generate comprehensive portfolio analysis', async () => {
      const mockAIResponse = `
        SUMMARY:
        The portfolio shows strong performance with a 25% gain and good diversification across sectors.

        DETAILED ANALYSIS:
        The portfolio demonstrates solid fundamentals with Reliance Industries as a core holding.
        Technical indicators suggest continued upward momentum with RSI at 65.5 indicating healthy buying pressure.

        RECOMMENDATIONS:
        RELIANCE.NSE: HOLD - Confidence: 85% - Target: ₹2900 - Strong fundamentals support continued growth
        
        RISK ASSESSMENT:
        Overall Risk: Medium - Diversification Risk: 30% - Concentration Risk: 25% - Market Risk: 40%
        
        MARKET CONDITIONS:
        Overall: Bullish - Volatility: Medium - Trend: Upward - Positive market sentiment with growth opportunities
        
        PERFORMANCE ANALYSIS:
        Return Analysis: Portfolio showing strong performance with 25% gains
        Benchmark Comparison: Outperforming Nifty 50 by 5%
        Risk-Adjusted Returns: Excellent Sharpe ratio of 1.8
      `;

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => mockAIResponse
        }
      });

      const result = await aiService.generatePortfolioAnalysis(mockAnalysisRequest);

      expect(result).toBeDefined();
      expect(result.summary).toContain('portfolio shows strong performance');
      expect(result.detailedAnalysis).toContain('solid fundamentals');
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].symbol).toBe('RELIANCE.NSE');
      expect(result.recommendations[0].action).toBe('hold');
      expect(result.recommendations[0].confidence).toBe(85);
      expect(result.riskAssessment.overallRisk).toBe('medium');
      expect(result.marketConditions.overall).toBe('bullish');
    });

    it('should handle AI API errors gracefully', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('AI API Error'));

      await expect(aiService.generatePortfolioAnalysis(mockAnalysisRequest))
        .rejects.toThrow('Failed to generate portfolio analysis');
    });

    it('should handle empty AI responses', async () => {
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => ''
        }
      });

      const result = await aiService.generatePortfolioAnalysis(mockAnalysisRequest);

      expect(result.summary).toBe('Analysis summary not available');
      expect(result.detailedAnalysis).toBe('Detailed analysis not available');
      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe('Prompt Generation', () => {
    it('should build comprehensive analysis prompt', () => {
      const mockRequest: AnalysisRequest = {
        portfolio: {
          name: 'Test Portfolio',
          totalValue: 150000,
          holdings: [
            {
              symbol: 'RELIANCE.NSE',
              companyName: 'Reliance Industries',
              shares: 100,
              currentPrice: 2750
            }
          ]
        } as any,
        user: {
          name: 'Test User',
          preferences: {
            riskTolerance: 'medium',
            investmentGoals: ['growth', 'income']
          }
        } as any,
        stockQuotes: [],
        technicalIndicators: []
      };

      const prompt = aiService.buildAnalysisPrompt(mockRequest);

      expect(prompt).toContain('professional financial analyst');
      expect(prompt).toContain('Test Portfolio');
      expect(prompt).toContain('RELIANCE.NSE');
      expect(prompt).toContain('risk tolerance');
      expect(prompt).toContain('medium');
      expect(prompt).toContain('growth');
      expect(prompt).toContain('income');
    });

    it('should include technical indicators in prompt', () => {
      const mockRequest: AnalysisRequest = {
        portfolio: { name: 'Test Portfolio', holdings: [] } as any,
        user: { preferences: { riskTolerance: 'medium', investmentGoals: [] } } as any,
        stockQuotes: [],
        technicalIndicators: [
          {
            symbol: 'RELIANCE.NSE',
            rsi: 65.5,
            macd: { macd: 15.2, signal: 12.8, histogram: 2.4 },
            sma20: 2680.50
          } as any
        ]
      };

      const prompt = aiService.buildAnalysisPrompt(mockRequest);

      expect(prompt).toContain('TECHNICAL INDICATORS');
      expect(prompt).toContain('RSI: 65.5');
      expect(prompt).toContain('MACD');
      expect(prompt).toContain('SMA20: 2680.5');
    });

    it('should include market conditions in prompt', () => {
      const mockRequest: AnalysisRequest = {
        portfolio: { name: 'Test Portfolio', holdings: [] } as any,
        user: { preferences: { riskTolerance: 'medium', investmentGoals: [] } } as any,
        stockQuotes: [],
        technicalIndicators: [],
        marketConditions: {
          overall: 'bullish',
          volatility: 'medium',
          trend: 'upward'
        }
      };

      const prompt = aiService.buildAnalysisPrompt(mockRequest);

      expect(prompt).toContain('MARKET CONDITIONS');
      expect(prompt).toContain('Overall Market: bullish');
      expect(prompt).toContain('Volatility: medium');
      expect(prompt).toContain('Trend: upward');
    });
  });

  describe('Response Parsing', () => {
    it('should extract recommendations correctly', () => {
      const mockResponse = `
        RECOMMENDATIONS:
        RELIANCE.NSE: BUY - Confidence: 90% - Target: ₹3000 - Strong growth potential
        TCS.NSE: HOLD - Confidence: 75% - Target: ₹3500 - Stable performance expected
        INFY.NSE: SELL - Confidence: 60% - Target: ₹1400 - Overvalued at current levels
      `;

      const stockQuotes = [
        { symbol: 'RELIANCE.NSE', companyName: 'Reliance Industries', price: 2750 },
        { symbol: 'TCS.NSE', companyName: 'Tata Consultancy Services', price: 3200 },
        { symbol: 'INFY.NSE', companyName: 'Infosys Limited', price: 1500 }
      ] as any[];

      const recommendations = aiService.extractRecommendations(mockResponse, stockQuotes);

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].symbol).toBe('RELIANCE.NSE');
      expect(recommendations[0].action).toBe('buy');
      expect(recommendations[0].confidence).toBe(90);
      expect(recommendations[1].action).toBe('hold');
      expect(recommendations[2].action).toBe('sell');
    });

    it('should extract risk assessment correctly', () => {
      const mockResponse = `
        RISK ASSESSMENT:
        Overall Risk: High
        Diversification Risk: 45%
        Concentration Risk: 60%
        Market Risk: 35%
        Recommendations: Diversify across sectors, Reduce position sizes
      `;

      const riskAssessment = aiService.extractRiskAssessment(mockResponse);

      expect(riskAssessment.overallRisk).toBe('high');
      expect(riskAssessment.diversificationRisk).toBe(45);
      expect(riskAssessment.concentrationRisk).toBe(60);
      expect(riskAssessment.marketRisk).toBe(35);
      expect(riskAssessment.recommendations).toContain('Diversify across sectors');
    });

    it('should extract market conditions correctly', () => {
      const mockResponse = `
        MARKET CONDITIONS:
        Overall: Bearish
        Volatility: High
        Trend: Downward
        Sentiment: Cautious market sentiment due to global uncertainties
      `;

      const marketConditions = aiService.extractMarketConditions(mockResponse);

      expect(marketConditions.overall).toBe('bearish');
      expect(marketConditions.volatility).toBe('high');
      expect(marketConditions.trend).toBe('downward');
      expect(marketConditions.sentiment).toContain('Cautious market sentiment');
    });

    it('should handle malformed responses gracefully', () => {
      const malformedResponse = 'This is not a properly formatted analysis response';

      const stockQuotes = [
        { symbol: 'RELIANCE.NSE', companyName: 'Reliance Industries', price: 2750 }
      ] as any[];

      const recommendations = aiService.extractRecommendations(malformedResponse, stockQuotes);
      const riskAssessment = aiService.extractRiskAssessment(malformedResponse);
      const marketConditions = aiService.extractMarketConditions(malformedResponse);

      expect(recommendations).toHaveLength(1); // Should create default recommendation
      expect(recommendations[0].action).toBe('hold');
      expect(recommendations[0].confidence).toBe(75);
      expect(riskAssessment.overallRisk).toBe('medium');
      expect(marketConditions.overall).toBe('neutral');
    });
  });

  describe('Portfolio Summary Building', () => {
    it('should build comprehensive portfolio summary', () => {
      const mockPortfolio = {
        name: 'Test Portfolio',
        totalValue: 150000,
        totalCost: 120000,
        totalGainLoss: 30000,
        totalGainLossPercentage: 25.0,
        holdings: [
          {
            symbol: 'RELIANCE.NSE',
            companyName: 'Reliance Industries',
            shares: 100,
            currentPrice: 2750,
            marketValue: 275000
          }
        ],
        cash: 25000,
        performanceMetrics: {
          yearlyReturn: 25.0,
          volatility: 15.2,
          sharpeRatio: 1.8
        }
      } as any;

      const stockQuotes = [
        {
          symbol: 'RELIANCE.NSE',
          price: 2750,
          marketCap: 1850000000000
        }
      ] as any[];

      const summary = aiService.buildPortfolioSummary(mockPortfolio, stockQuotes);

      expect(summary).toContain('Test Portfolio');
      expect(summary).toContain('₹1,50,000');
      expect(summary).toContain('25.0%');
      expect(summary).toContain('RELIANCE.NSE');
      expect(summary).toContain('100 shares');
      expect(summary).toContain('Sharpe Ratio: 1.8');
    });
  });

  describe('Technical Summary Building', () => {
    it('should build technical indicators summary', () => {
      const mockTechnicalIndicators = [
        {
          symbol: 'RELIANCE.NSE',
          rsi: 65.5,
          macd: {
            macd: 15.2,
            signal: 12.8,
            histogram: 2.4
          },
          sma20: 2680.50,
          sma50: 2620.30,
          sma200: 2580.75
        }
      ] as any[];

      const summary = aiService.buildTechnicalSummary(mockTechnicalIndicators);

      expect(summary).toContain('RELIANCE.NSE');
      expect(summary).toContain('RSI: 65.5');
      expect(summary).toContain('MACD: 15.2');
      expect(summary).toContain('SMA20: 2680.5');
      expect(summary).toContain('SMA50: 2620.3');
      expect(summary).toContain('SMA200: 2580.75');
    });
  });

  describe('User Profile Building', () => {
    it('should build user profile summary', () => {
      const mockUser = {
        name: 'Test Investor',
        role: 'investor',
        preferences: {
          riskTolerance: 'high',
          investmentGoals: ['growth', 'income', 'retirement'],
          notifications: { email: true, push: false }
        }
      } as any;

      const profile = aiService.buildUserProfile(mockUser);

      expect(profile).toContain('Test Investor');
      expect(profile).toContain('Role: investor');
      expect(profile).toContain('Risk Tolerance: high');
      expect(profile).toContain('growth');
      expect(profile).toContain('income');
      expect(profile).toContain('retirement');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should provide fallback values for missing data', () => {
      const incompleteRequest: AnalysisRequest = {
        portfolio: { name: 'Test', holdings: [] } as any,
        user: { preferences: {} } as any,
        stockQuotes: [],
        technicalIndicators: []
      };

      const prompt = aiService.buildAnalysisPrompt(incompleteRequest);

      expect(prompt).toContain('professional financial analyst');
      expect(prompt).toContain('Test');
    });

    it('should handle API timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockModel.generateContent.mockRejectedValue(timeoutError);

      await expect(aiService.generatePortfolioAnalysis({} as any))
        .rejects.toThrow('Failed to generate portfolio analysis');
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      mockModel.generateContent.mockRejectedValue(rateLimitError);

      await expect(aiService.generatePortfolioAnalysis({} as any))
        .rejects.toThrow('Failed to generate portfolio analysis');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large portfolios efficiently', async () => {
      const largePortfolio = {
        name: 'Large Portfolio',
        holdings: Array.from({ length: 50 }, (_, i) => ({
          symbol: `STOCK${i}.NSE`,
          companyName: `Company ${i}`,
          shares: 100,
          currentPrice: 1000 + i
        }))
      } as any;

      const largeRequest: AnalysisRequest = {
        portfolio: largePortfolio,
        user: { preferences: { riskTolerance: 'medium', investmentGoals: [] } } as any,
        stockQuotes: [],
        technicalIndicators: []
      };

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => 'SUMMARY: Large portfolio analysis complete'
        }
      });

      const startTime = Date.now();
      const result = await aiService.generatePortfolioAnalysis(largeRequest);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});
