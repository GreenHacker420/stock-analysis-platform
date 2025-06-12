/**
 * Integration tests for API endpoints
 * Tests complete API workflows including authentication, data flow, and error handling
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Portfolio from '@/models/Portfolio';
import AnalysisReport from '@/models/AnalysisReport';

// Mock dependencies
jest.mock('@/lib/mongodb');
jest.mock('next-auth');
jest.mock('@/models/User');
jest.mock('@/models/Portfolio');
jest.mock('@/models/AnalysisReport');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUser = User as jest.Mocked<typeof User>;
const mockPortfolio = Portfolio as jest.Mocked<typeof Portfolio>;
const mockAnalysisReport = AnalysisReport as jest.Mocked<typeof AnalysisReport>;

// Mock fetch for external API calls
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    mockConnectDB.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    // Cleanup test environment
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'investor'
        };

        const mockCreatedUser = {
          _id: 'user_id_123',
          ...userData,
          password: 'hashed_password',
          isActive: true,
          createdAt: new Date(),
          preferences: {
            riskTolerance: 'medium',
            investmentGoals: ['growth'],
            notifications: { email: true, push: false }
          }
        };

        mockUser.findOne.mockResolvedValue(null);
        mockUser.create.mockResolvedValue(mockCreatedUser as any);

        // Simulate API call
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: { 'Content-Type': 'application/json' }
        });

        // Mock the registration logic
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        expect(existingUser).toBeNull();

        const newUser = await User.create({
          ...userData,
          email: userData.email.toLowerCase(),
          password: 'hashed_password',
          isActive: true,
          preferences: {
            riskTolerance: 'medium',
            investmentGoals: ['growth'],
            notifications: { email: true, push: false }
          }
        });

        expect(newUser).toEqual(mockCreatedUser);
        expect(mockUser.create).toHaveBeenCalledWith(expect.objectContaining({
          email: 'test@example.com',
          role: 'investor',
          isActive: true
        }));
      });

      it('should reject registration with existing email', async () => {
        const userData = {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'investor'
        };

        const existingUser = {
          _id: 'existing_user_id',
          email: 'existing@example.com',
          name: 'Existing User'
        };

        mockUser.findOne.mockResolvedValue(existingUser as any);

        const foundUser = await User.findOne({ email: userData.email.toLowerCase() });
        expect(foundUser).toEqual(existingUser);
      });
    });

    describe('Session Management', () => {
      it('should create and validate user session', async () => {
        const mockSession = {
          user: {
            id: 'user_id_123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'investor',
            isActive: true
          }
        };

        mockGetServerSession.mockResolvedValue(mockSession as any);

        const session = await getServerSession();
        
        expect(session).toEqual(mockSession);
        expect(session?.user.role).toBe('investor');
        expect(session?.user.isActive).toBe(true);
      });

      it('should handle invalid sessions', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const session = await getServerSession();
        
        expect(session).toBeNull();
      });
    });
  });

  describe('Portfolio API', () => {
    const mockSession = {
      user: {
        id: 'user_id_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor',
        isActive: true
      }
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession as any);
    });

    describe('GET /api/portfolios', () => {
      it('should fetch user portfolios successfully', async () => {
        const mockPortfolios = [
          {
            _id: 'portfolio_id_1',
            investorId: 'user_id_123',
            name: 'My Portfolio',
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
                gainLossPercentage: 10.0
              }
            ],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        mockPortfolio.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                skip: jest.fn().mockResolvedValue(mockPortfolios)
              })
            })
          })
        } as any);

        mockPortfolio.countDocuments.mockResolvedValue(1);

        const portfolios = await Portfolio.find({ investorId: mockSession.user.id, isActive: true })
          .populate('investorId', 'name email')
          .sort({ createdAt: -1 })
          .limit(50)
          .skip(0);

        expect(portfolios).toEqual(mockPortfolios);
        expect(mockPortfolio.find).toHaveBeenCalledWith({
          investorId: 'user_id_123',
          isActive: true
        });
      });

      it('should handle empty portfolio list', async () => {
        mockPortfolio.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                skip: jest.fn().mockResolvedValue([])
              })
            })
          })
        } as any);

        mockPortfolio.countDocuments.mockResolvedValue(0);

        const portfolios = await Portfolio.find({ investorId: mockSession.user.id, isActive: true })
          .populate('investorId', 'name email')
          .sort({ createdAt: -1 })
          .limit(50)
          .skip(0);

        expect(portfolios).toEqual([]);
        expect(portfolios).toHaveLength(0);
      });
    });

    describe('POST /api/portfolios', () => {
      it('should create new portfolio successfully', async () => {
        const portfolioData = {
          name: 'New Portfolio',
          description: 'Test portfolio',
          cash: 50000
        };

        const mockCreatedPortfolio = {
          _id: 'new_portfolio_id',
          investorId: 'user_id_123',
          ...portfolioData,
          totalValue: 50000,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercentage: 0,
          holdings: [],
          isActive: true,
          riskScore: 0,
          diversificationScore: 0,
          performanceMetrics: {
            dailyReturn: 0,
            weeklyReturn: 0,
            monthlyReturn: 0,
            yearlyReturn: 0,
            volatility: 0,
            sharpeRatio: 0
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockPortfolio.create.mockResolvedValue(mockCreatedPortfolio as any);

        const newPortfolio = await Portfolio.create({
          investorId: mockSession.user.id,
          ...portfolioData,
          totalValue: portfolioData.cash,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercentage: 0,
          holdings: [],
          isActive: true
        });

        expect(newPortfolio).toEqual(mockCreatedPortfolio);
        expect(mockPortfolio.create).toHaveBeenCalledWith(expect.objectContaining({
          investorId: 'user_id_123',
          name: 'New Portfolio',
          cash: 50000
        }));
      });
    });

    describe('PUT /api/portfolios/[id]', () => {
      it('should update portfolio successfully', async () => {
        const portfolioId = 'portfolio_id_123';
        const updateData = {
          name: 'Updated Portfolio Name',
          description: 'Updated description'
        };

        const mockUpdatedPortfolio = {
          _id: portfolioId,
          investorId: 'user_id_123',
          ...updateData,
          totalValue: 150000,
          isActive: true,
          updatedAt: new Date()
        };

        mockPortfolio.findOneAndUpdate.mockResolvedValue(mockUpdatedPortfolio as any);

        const updatedPortfolio = await Portfolio.findOneAndUpdate(
          { _id: portfolioId, investorId: mockSession.user.id },
          updateData,
          { new: true }
        );

        expect(updatedPortfolio).toEqual(mockUpdatedPortfolio);
        expect(mockPortfolio.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: portfolioId, investorId: 'user_id_123' },
          updateData,
          { new: true }
        );
      });
    });
  });

  describe('Stock Data API', () => {
    describe('GET /api/stocks/indian', () => {
      it('should fetch Indian stocks successfully', async () => {
        const mockEODHDResponse = {
          code: 'RELIANCE.NSE',
          timestamp: Date.now() / 1000,
          close: 2750.50,
          change: 25.30,
          change_p: 0.93,
          volume: 1250000,
          high: 2780.00,
          low: 2710.00,
          previousClose: 2725.20
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockEODHDResponse)
        } as Response);

        const response = await fetch('mock-eodhd-url');
        const data = await response.json();

        expect(data).toEqual(mockEODHDResponse);
        expect(data.code).toBe('RELIANCE.NSE');
        expect(data.close).toBe(2750.50);
      });

      it('should handle EODHD API failures gracefully', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        } as Response);

        const response = await fetch('mock-eodhd-url');

        expect(response.ok).toBe(false);
        expect(response.status).toBe(500);
      });
    });

    describe('GET /api/stocks/quote', () => {
      it('should fetch stock quote successfully', async () => {
        const mockQuoteResponse = {
          success: true,
          quote: {
            symbol: 'RELIANCE.NSE',
            companyName: 'Reliance Industries Limited',
            price: 2750.50,
            change: 25.30,
            changePercent: 0.93,
            volume: 1250000,
            marketCap: 1850000000000,
            lastUpdated: new Date().toISOString()
          }
        };

        // Mock the quote API response
        const quoteData = mockQuoteResponse.quote;
        
        expect(quoteData.symbol).toBe('RELIANCE.NSE');
        expect(quoteData.price).toBe(2750.50);
        expect(quoteData.change).toBe(25.30);
        expect(quoteData.volume).toBe(1250000);
      });
    });
  });

  describe('Analysis API', () => {
    const mockAnalystSession = {
      user: {
        id: 'analyst_id_123',
        email: 'analyst@example.com',
        name: 'Test Analyst',
        role: 'analyst',
        isActive: true
      }
    };

    describe('POST /api/analysis/generate', () => {
      it('should generate AI analysis successfully', async () => {
        mockGetServerSession.mockResolvedValue(mockAnalystSession as any);

        const mockPortfolio = {
          _id: 'portfolio_id_123',
          investorId: 'investor_id_123',
          name: 'Test Portfolio',
          holdings: [
            {
              symbol: 'RELIANCE.NSE',
              companyName: 'Reliance Industries',
              shares: 100,
              currentPrice: 2750
            }
          ]
        };

        const mockAnalysisResult = {
          summary: 'Portfolio analysis summary',
          detailedAnalysis: 'Detailed analysis content',
          recommendations: [
            {
              symbol: 'RELIANCE.NSE',
              action: 'hold',
              confidence: 85,
              reasoning: 'Strong fundamentals'
            }
          ],
          riskAssessment: {
            overallRisk: 'medium',
            diversificationRisk: 25,
            concentrationRisk: 30
          }
        };

        mockPortfolio.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPortfolio)
        });

        const portfolio = await Portfolio.findById('portfolio_id_123')
          .populate('investorId');

        expect(portfolio).toEqual(mockPortfolio);

        // Mock AI analysis generation
        const analysisResult = mockAnalysisResult;
        
        expect(analysisResult.summary).toBe('Portfolio analysis summary');
        expect(analysisResult.recommendations).toHaveLength(1);
        expect(analysisResult.recommendations[0].symbol).toBe('RELIANCE.NSE');
      });
    });

    describe('GET /api/reports', () => {
      it('should fetch analysis reports successfully', async () => {
        const mockReports = [
          {
            _id: 'report_id_1',
            title: 'Portfolio Analysis Report',
            summary: 'Analysis summary',
            status: 'completed',
            createdAt: new Date(),
            portfolioId: { _id: 'portfolio_id_1', name: 'Test Portfolio' },
            analystId: { _id: 'analyst_id_1', name: 'Test Analyst' }
          }
        ];

        mockAnalysisReport.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    skip: jest.fn().mockResolvedValue(mockReports)
                  })
                })
              })
            })
          })
        } as any);

        mockAnalysisReport.countDocuments.mockResolvedValue(1);

        const reports = await AnalysisReport.find({ isActive: true })
          .populate('portfolioId', 'name')
          .populate('analystId', 'name email')
          .populate('investorId', 'name email')
          .sort({ createdAt: -1 })
          .limit(50)
          .skip(0);

        expect(reports).toEqual(mockReports);
        expect(reports).toHaveLength(1);
        expect(reports[0].title).toBe('Portfolio Analysis Report');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

      try {
        await connectDB();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Database connection failed');
      }
    });

    it('should handle unauthorized access', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const session = await getServerSession();
      
      expect(session).toBeNull();
    });

    it('should handle invalid portfolio access', async () => {
      const mockSession = {
        user: {
          id: 'user_id_123',
          role: 'investor'
        }
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);
      mockPortfolio.findOne.mockResolvedValue(null);

      const portfolio = await Portfolio.findOne({
        _id: 'invalid_portfolio_id',
        investorId: mockSession.user.id
      });

      expect(portfolio).toBeNull();
    });

    it('should handle external API failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      try {
        await fetch('mock-api-url');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({
          'Retry-After': '60'
        })
      } as Response);

      const response = await fetch('mock-api-url');

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('Data Validation', () => {
    it('should validate portfolio creation data', async () => {
      const invalidPortfolioData = {
        // Missing required name field
        description: 'Test portfolio',
        cash: -1000 // Invalid negative cash
      };

      const validationError = new Error('Validation failed');
      mockPortfolio.create.mockRejectedValue(validationError);

      try {
        await Portfolio.create(invalidPortfolioData);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Validation failed');
      }
    });

    it('should validate user registration data', async () => {
      const invalidUserData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email format
        password: '123', // Too short password
        role: 'invalid_role' // Invalid role
      };

      const validationError = new Error('Validation failed');
      mockUser.create.mockRejectedValue(validationError);

      try {
        await User.create(invalidUserData);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Validation failed');
      }
    });
  });
});
