/**
 * Test setup and configuration
 * Global test utilities and mocks
 */

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.EODHD_API_KEY = 'test-eodhd-key';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
export const mockUser = {
  _id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'investor' as const,
  isActive: true,
  preferences: {
    riskTolerance: 'medium' as const,
    investmentGoals: ['growth'],
    notifications: {
      email: true,
      push: false,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAnalyst = {
  _id: 'test-analyst-id',
  email: 'analyst@example.com',
  name: 'Test Analyst',
  role: 'analyst' as const,
  isActive: true,
  preferences: {
    riskTolerance: 'medium' as const,
    investmentGoals: ['analysis'],
    notifications: {
      email: true,
      push: true,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPortfolio = {
  _id: 'test-portfolio-id',
  investorId: 'test-user-id',
  name: 'Test Portfolio',
  description: 'Test portfolio description',
  totalValue: 150000,
  totalCost: 120000,
  totalGainLoss: 30000,
  totalGainLossPercentage: 25.0,
  holdings: [
    {
      symbol: 'RELIANCE.NSE',
      companyName: 'Reliance Industries Limited',
      shares: 100,
      averageCost: 2500,
      currentPrice: 2750,
      marketValue: 275000,
      gainLoss: 25000,
      gainLossPercentage: 10.0,
      lastUpdated: new Date(),
    },
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
    sharpeRatio: 1.8,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockStockQuote = {
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
  lastUpdated: new Date(),
};

export const mockTechnicalIndicators = {
  symbol: 'RELIANCE.NSE',
  rsi: 65.5,
  macd: {
    macd: 15.2,
    signal: 12.8,
    histogram: 2.4,
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
  lastUpdated: new Date(),
};

export const mockAnalysisReport = {
  _id: 'test-report-id',
  portfolioId: 'test-portfolio-id',
  analystId: 'test-analyst-id',
  investorId: 'test-user-id',
  title: 'Portfolio Analysis Report',
  summary: 'Comprehensive portfolio analysis showing strong performance',
  aiAnalysis: 'Detailed AI analysis content...',
  recommendations: [
    {
      symbol: 'RELIANCE.NSE',
      companyName: 'Reliance Industries Limited',
      action: 'hold' as const,
      confidence: 85,
      targetPrice: 2900,
      currentPrice: 2750,
      reasoning: 'Strong fundamentals with growth potential',
      riskLevel: 'medium' as const,
      timeHorizon: 'long' as const,
      allocationPercentage: 15,
    },
  ],
  riskAssessment: {
    overallRisk: 'medium' as const,
    diversificationRisk: 25,
    concentrationRisk: 30,
    marketRisk: 40,
    recommendations: ['Diversify across sectors', 'Reduce concentration'],
  },
  marketConditions: {
    overall: 'bullish' as const,
    volatility: 'medium' as const,
    trend: 'upward' as const,
    sentiment: 'Positive market sentiment with growth opportunities',
  },
  status: 'completed' as const,
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  isActive: true,
  metadata: {
    aiModel: 'gemini-2.0-flash',
    processingTime: 3200,
    confidence: 85,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test database helpers
export const createMockDatabase = () => ({
  users: [mockUser, mockAnalyst],
  portfolios: [mockPortfolio],
  reports: [mockAnalysisReport],
});

// API response helpers
export const createMockApiResponse = (data: any, success = true) => ({
  success,
  data,
  timestamp: new Date().toISOString(),
});

export const createMockErrorResponse = (message: string, code = 'ERROR') => ({
  success: false,
  error: message,
  code,
  timestamp: new Date().toISOString(),
});

// Test utilities for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock data generators
export const generateMockStockData = (symbol: string) => ({
  symbol,
  name: `${symbol.split('.')[0]} Limited`,
  exchange: symbol.includes('.NSE') ? 'NSE' : 'BSE',
  price: 1000 + Math.random() * 2000,
  change: (Math.random() - 0.5) * 100,
  changePercent: (Math.random() - 0.5) * 10,
  volume: Math.floor(Math.random() * 5000000) + 100000,
  marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
  peRatio: 15 + Math.random() * 30,
  high52Week: 0,
  low52Week: 0,
  dayHigh: 0,
  dayLow: 0,
  previousClose: 0,
  sector: 'Technology',
  lastUpdated: new Date(),
});

export const generateMockHistoricalData = (days: number) => {
  const data = [];
  const basePrice = 1000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const price = basePrice + Math.sin(i * 0.1) * 100 + Math.random() * 50;
    
    data.push({
      date,
      open: price * (0.98 + Math.random() * 0.04),
      high: price * (1.01 + Math.random() * 0.02),
      low: price * (0.97 + Math.random() * 0.02),
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      adjClose: price,
    });
  }
  
  return data;
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  return {
    result,
    duration: end - start,
  };
};

// Error simulation utilities
export const simulateNetworkError = () => {
  throw new Error('Network error');
};

export const simulateTimeout = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

// Cleanup utilities
export const cleanup = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

// Export all utilities
export default {
  mockUser,
  mockAnalyst,
  mockPortfolio,
  mockStockQuote,
  mockTechnicalIndicators,
  mockAnalysisReport,
  createMockDatabase,
  createMockApiResponse,
  createMockErrorResponse,
  waitFor,
  flushPromises,
  generateMockStockData,
  generateMockHistoricalData,
  measurePerformance,
  simulateNetworkError,
  simulateTimeout,
  cleanup,
};
