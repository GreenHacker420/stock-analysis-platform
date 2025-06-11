// Central export file for all mock data

// User data
export {
  mockUsers,
  mockAnalysts,
  mockInvestors,
  type MockUser,
} from './mockUsers';

// Indian stock data
export {
  mockIndianStocks,
  getIndianStockBySymbol,
  getIndianStocksBySymbols,
  getIndianStocksBySector,
  type MockIndianStock,
} from './mockIndianStocks';

// Portfolio data
export {
  mockPortfolios,
  getPortfoliosByInvestorId,
  getPortfolioById,
  getActivePortfolios,
  getTotalPortfolioValue,
  getPortfoliosByRiskScore,
  type MockPortfolio,
} from './mockPortfolios';

// Analysis reports data
export {
  mockAnalysisReports,
  getReportsByAnalystId,
  getReportsByInvestorId,
  getReportsByPortfolioId,
  getPublishedReports,
  getReportsByTag,
  getRecentReports,
  type MockAnalysisReport,
} from './mockReports';

// Utility functions for mock data
export const getAllMockData = () => ({
  users: mockUsers,
  stocks: mockIndianStocks,
  portfolios: mockPortfolios,
  reports: mockAnalysisReports,
});

export const getMockDataSummary = () => ({
  totalUsers: mockUsers.length,
  totalAnalysts: mockAnalysts.length,
  totalInvestors: mockInvestors.length,
  totalStocks: mockIndianStocks.length,
  totalPortfolios: mockPortfolios.length,
  totalReports: mockAnalysisReports.length,
  totalPortfolioValue: getTotalPortfolioValue(),
});

// Sample data generators for testing
export const generateSamplePortfolioData = (userId: string) => {
  const userPortfolios = getPortfoliosByInvestorId(userId);
  if (userPortfolios.length === 0) return null;

  const portfolio = userPortfolios[0];
  return {
    totalValue: portfolio.totalValue,
    totalGainLoss: portfolio.totalGainLoss,
    totalGainLossPercentage: portfolio.totalGainLossPercentage,
    holdings: portfolio.holdings.map(holding => ({
      symbol: holding.symbol,
      name: holding.companyName,
      value: holding.totalValue,
      percentage: (holding.totalValue / portfolio.totalValue) * 100,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      sector: 'Technology', // Default sector
    })),
  };
};

export const generateSampleStockPerformance = () => {
  return mockIndianStocks.slice(0, 6).map(stock => ({
    symbol: stock.symbol,
    name: stock.companyName,
    performance: stock.changePercent,
    volume: stock.volume,
    marketCap: stock.marketCap,
    price: stock.price,
  }));
};

export const generateSampleRiskData = (portfolioId?: string) => {
  const portfolio = portfolioId ? getPortfolioById(portfolioId) : mockPortfolios[0];
  if (!portfolio) return [];

  const riskScore = portfolio.riskScore;
  
  return [
    {
      level: 'Conservative',
      description: 'Low-risk investments',
      percentage: Math.max(0, 40 - riskScore * 0.4),
      value: portfolio.totalValue * 0.3,
      color: '#10b981',
      riskScore: 2,
    },
    {
      level: 'Moderate',
      description: 'Balanced risk-return',
      percentage: 60 - Math.abs(riskScore - 50) * 0.3,
      value: portfolio.totalValue * 0.45,
      color: '#f59e0b',
      riskScore: 3,
    },
    {
      level: 'Aggressive',
      description: 'High-risk, high-reward',
      percentage: Math.max(0, riskScore * 0.4 - 20),
      value: portfolio.totalValue * 0.2,
      color: '#ef4444',
      riskScore: 4,
    },
    {
      level: 'Speculative',
      description: 'Very high risk',
      percentage: Math.max(0, riskScore * 0.1 - 5),
      value: portfolio.totalValue * 0.05,
      color: '#8b5cf6',
      riskScore: 5,
    },
  ];
};

export const generateSampleLineData = (portfolioId?: string) => {
  const portfolio = portfolioId ? getPortfolioById(portfolioId) : mockPortfolios[0];
  if (!portfolio) return [];

  return [
    {
      name: 'Portfolio Value',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        value: portfolio.totalValue * (0.9 + Math.random() * 0.2 + i * 0.003),
        volume: Math.random() * 10000000,
      })),
      color: '#3b82f6',
      fillGradient: true,
    },
  ];
};

export const generateSampleCorrelationData = () => {
  const stocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
  const correlations = [];
  
  for (let i = 0; i < stocks.length; i++) {
    for (let j = i + 1; j < stocks.length; j++) {
      correlations.push({
        stock1: stocks[i],
        stock2: stocks[j],
        correlation: Math.random() * 0.8 + 0.1, // 0.1 to 0.9
        significance: Math.random() > 0.5 ? 'high' as const : 'medium' as const,
      });
    }
  }
  
  return correlations;
};

// Data validation utilities
export const validateMockData = () => {
  const errors = [];
  
  // Validate users
  if (mockUsers.length === 0) {
    errors.push('No mock users found');
  }
  
  // Validate stocks
  if (mockIndianStocks.length === 0) {
    errors.push('No mock stocks found');
  }
  
  // Validate portfolios
  if (mockPortfolios.length === 0) {
    errors.push('No mock portfolios found');
  }
  
  // Validate reports
  if (mockAnalysisReports.length === 0) {
    errors.push('No mock reports found');
  }
  
  // Check data consistency
  const userIds = mockUsers.map(u => u.id);
  const portfolioInvestorIds = mockPortfolios.map(p => p.investorId);
  const invalidPortfolioUsers = portfolioInvestorIds.filter(id => !userIds.includes(id));
  
  if (invalidPortfolioUsers.length > 0) {
    errors.push(`Invalid investor IDs in portfolios: ${invalidPortfolioUsers.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    summary: getMockDataSummary(),
  };
};

export default {
  users: mockUsers,
  stocks: mockIndianStocks,
  portfolios: mockPortfolios,
  reports: mockAnalysisReports,
  summary: getMockDataSummary(),
  validation: validateMockData(),
};
