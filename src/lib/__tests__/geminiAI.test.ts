import { GeminiAIService } from '../geminiAI'
import type { IPortfolio } from '@/models/Portfolio'
import type { IUser } from '@/models/User'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}))

const MockedGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>

describe('GeminiAIService', () => {
  let geminiService: GeminiAIService
  let mockModel: any

  beforeEach(() => {
    mockModel = {
      generateContent: jest.fn(),
    }
    MockedGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => mockModel,
      apiKey: 'test-key',
      getGenerativeModelFromCachedContent: jest.fn(),
    } as any))

    geminiService = new GeminiAIService()
    jest.clearAllMocks()
  })

  const mockUser: IUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'investor',
    isActive: true,
    preferences: {
      riskTolerance: 'medium',
      investmentGoals: ['growth', 'income'],
      notifications: {
        email: true,
        push: false,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser

  const mockPortfolio: IPortfolio = {
    _id: 'portfolio123',
    investorId: 'user123' as any,
    name: 'Test Portfolio',
    totalValue: 100000,
    totalCost: 90000,
    totalGainLoss: 10000,
    totalGainLossPercentage: 11.11,
    holdings: [
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 100,
        averageCost: 150,
        currentPrice: 160,
        marketValue: 16000,
        gainLoss: 1000,
        gainLossPercentage: 6.67,
        lastUpdated: new Date(),
      },
    ],
    cash: 5000,
    isActive: true,
    riskScore: 65,
    diversificationScore: 70,
    performanceMetrics: {
      dailyReturn: 0.5,
      weeklyReturn: 2.1,
      monthlyReturn: 8.5,
      yearlyReturn: 15.2,
      volatility: 18.5,
      sharpeRatio: 1.2,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IPortfolio

  const mockStockQuotes = [
    {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      price: 160,
      change: 2.5,
      changePercent: 1.59,
      volume: 50000000,
      marketCap: 2500000000000,
      peRatio: 25.5,
      dividendYield: 0.5,
      high52Week: 180,
      low52Week: 120,
      averageVolume: 45000000,
      lastUpdated: new Date(),
    },
  ]

  const mockTechnicalIndicators = [
    {
      symbol: 'AAPL',
      rsi: 65.5,
      macd: {
        macd: 2.1,
        signal: 1.8,
        histogram: 0.3,
      },
      sma20: 158.5,
      sma50: 155.2,
      sma200: 145.8,
      ema12: 159.1,
      ema26: 156.7,
      volume: 50000000,
      averageVolume: 45000000,
      priceChange24h: 2.5,
      priceChangePercentage24h: 1.59,
    },
  ]

  describe('generatePortfolioAnalysis', () => {
    it('should generate portfolio analysis successfully', async () => {
      const mockAIResponse = `
        EXECUTIVE SUMMARY:
        Your portfolio shows strong performance with a 11.11% gain. Apple Inc. continues to be a solid performer.
        
        DETAILED ANALYSIS:
        The portfolio demonstrates good growth potential with moderate risk exposure.
        
        INDIVIDUAL STOCK RECOMMENDATIONS:
        AAPL: Hold - Strong fundamentals and technical indicators support current position.
        
        RISK ASSESSMENT:
        Overall risk is moderate with good diversification potential.
        
        MARKET CONDITIONS ANALYSIS:
        Current market conditions are favorable for growth stocks.
        
        PERFORMANCE ANALYSIS:
        Portfolio outperforming market benchmarks with solid risk-adjusted returns.
      `

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => mockAIResponse,
        },
      })

      const request = {
        portfolio: mockPortfolio,
        user: mockUser,
        stockQuotes: mockStockQuotes,
        technicalIndicators: mockTechnicalIndicators,
      }

      const result = await geminiService.generatePortfolioAnalysis(request)

      expect(result).toEqual({
        summary: expect.stringContaining('portfolio shows strong performance'),
        detailedAnalysis: expect.stringContaining('good growth potential'),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            action: 'hold',
            confidence: expect.any(Number),
            targetPrice: expect.any(Number),
            currentPrice: 160,
            reasoning: expect.any(String),
            riskLevel: 'medium',
            timeHorizon: 'medium',
          }),
        ]),
        riskAssessment: expect.objectContaining({
          overallRisk: 'medium',
          diversificationRisk: expect.any(Number),
          concentrationRisk: expect.any(Number),
          marketRisk: expect.any(Number),
          recommendations: expect.any(Array),
        }),
        marketConditions: expect.objectContaining({
          overall: 'neutral',
          volatility: 'medium',
          trend: 'sideways',
          sentiment: expect.any(String),
        }),
        performanceAnalysis: expect.objectContaining({
          returnAnalysis: expect.any(String),
          benchmarkComparison: expect.any(String),
          riskAdjustedReturns: expect.any(String),
        }),
      })
    })

    it('should handle AI API errors gracefully', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('AI API Error'))

      const request = {
        portfolio: mockPortfolio,
        user: mockUser,
        stockQuotes: mockStockQuotes,
        technicalIndicators: mockTechnicalIndicators,
      }

      await expect(geminiService.generatePortfolioAnalysis(request)).rejects.toThrow(
        'Failed to generate portfolio analysis'
      )
    })
  })

  describe('buildAnalysisPrompt', () => {
    it('should build comprehensive analysis prompt', () => {
      const request = {
        portfolio: mockPortfolio,
        user: mockUser,
        stockQuotes: mockStockQuotes,
        technicalIndicators: mockTechnicalIndicators,
      }

      // Access private method for testing
      const prompt = (geminiService as any).buildAnalysisPrompt(request)

      expect(prompt).toContain('professional financial analyst')
      expect(prompt).toContain('Test User')
      expect(prompt).toContain('medium') // risk tolerance
      expect(prompt).toContain('Test Portfolio')
      expect(prompt).toContain('AAPL')
      expect(prompt).toContain('RSI: 65.50')
      expect(prompt).toContain('EXECUTIVE SUMMARY')
      expect(prompt).toContain('DETAILED ANALYSIS')
      expect(prompt).toContain('INDIVIDUAL STOCK RECOMMENDATIONS')
    })
  })

  describe('Enhanced AI Response Parsing', () => {
    it('should extract stock recommendations from AI response', () => {
      const mockResponse = `
        INDIVIDUAL STOCK RECOMMENDATIONS:
        AAPL: Buy - High confidence (85%) - Strong fundamentals support growth. Target price $180. Low risk, medium-term horizon.
        MSFT: Hold - Medium confidence (70%) - Maintain current position. Moderate risk, long-term outlook.
      `

      const result = (geminiService as any).extractRecommendations(mockResponse, mockStockQuotes)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(
        expect.objectContaining({
          symbol: 'AAPL',
          action: 'buy',
          riskLevel: 'low',
        })
      )
    })

    it('should extract risk assessment from AI response', () => {
      const mockResponse = `
        RISK ASSESSMENT:
        Overall risk is low due to diversified holdings.
        Diversification risk: 30
        Concentration risk: 25
        Market risk: 40
        - Consider adding international exposure
        - Monitor sector allocation
      `

      const result = (geminiService as any).extractRiskAssessment(mockResponse)

      expect(result).toEqual({
        overallRisk: 'low',
        diversificationRisk: 30,
        concentrationRisk: 25,
        marketRisk: 40,
        recommendations: expect.any(Array),
      })
    })

    it('should extract market conditions from AI response', () => {
      const mockResponse = `
        MARKET CONDITIONS ANALYSIS:
        Overall market sentiment is bullish with high volatility.
        Current trend shows upward momentum.
        Market sentiment: Investors are optimistic about tech sector growth.
      `

      const result = (geminiService as any).extractMarketConditions(mockResponse)

      expect(result).toEqual({
        overall: 'bullish',
        volatility: 'high',
        trend: 'upward',
        sentiment: expect.stringContaining('optimistic'),
      })
    })
  })
})
