// Mock portfolio interface that doesn't conflict with database schema
export interface MockHolding {
  symbol: string;
  companyName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercentage: number;
  lastUpdated: Date;
}

export interface MockPortfolio {
  id: string;
  investorId: string;
  name: string;
  description?: string;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: MockHolding[];
  cash: number;
  isActive: boolean;
  lastAnalyzed?: Date;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export const mockPortfolios: MockPortfolio[] = [
  // Investor 1 - John Doe
  {
    id: 'portfolio_001',
    investorId: 'investor_001',
    name: 'Growth Portfolio',
    description: 'Focused on high-growth Indian technology and financial stocks',
    totalValue: 2500000, // ₹25 L
    totalCost: 2200000, // ₹22 L
    totalGainLoss: 300000, // ₹3 L
    totalGainLossPercentage: 13.64,
    holdings: [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        quantity: 100,
        averagePrice: 2400.00,
        currentPrice: 2456.75,
        totalValue: 245675,
        totalCost: 240000,
        gainLoss: 5675,
        gainLossPercentage: 2.36,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        quantity: 50,
        averagePrice: 3800.00,
        currentPrice: 3842.60,
        totalValue: 192130,
        totalCost: 190000,
        gainLoss: 2130,
        gainLossPercentage: 1.12,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank Limited',
        quantity: 150,
        averagePrice: 1650.00,
        currentPrice: 1687.25,
        totalValue: 253087.50,
        totalCost: 247500,
        gainLoss: 5587.50,
        gainLossPercentage: 2.26,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        quantity: 80,
        averagePrice: 1420.00,
        currentPrice: 1456.90,
        totalValue: 116552,
        totalCost: 113600,
        gainLoss: 2952,
        gainLossPercentage: 2.60,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
    ],
    cash: 150000, // ₹1.5 L
    isActive: true,
    lastAnalyzed: new Date('2024-01-14T10:00:00Z'),
    riskScore: 65,
    createdAt: new Date('2023-06-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T15:30:00Z').toISOString(),
  },

  // Investor 2 - Jane Smith
  {
    id: 'portfolio_002',
    investorId: 'investor_002',
    name: 'Conservative Income',
    description: 'Dividend-focused portfolio with stable blue-chip stocks',
    totalValue: 1800000, // ₹18 L
    totalCost: 1750000, // ₹17.5 L
    totalGainLoss: 50000, // ₹50K
    totalGainLossPercentage: 2.86,
    holdings: [
      {
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank Limited',
        quantity: 200,
        averagePrice: 1680.00,
        currentPrice: 1687.25,
        totalValue: 337450,
        totalCost: 336000,
        gainLoss: 1450,
        gainLossPercentage: 0.43,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'ITC',
        companyName: 'ITC Limited',
        quantity: 500,
        averagePrice: 450.00,
        currentPrice: 456.75,
        totalValue: 228375,
        totalCost: 225000,
        gainLoss: 3375,
        gainLossPercentage: 1.50,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'SBIN',
        companyName: 'State Bank of India',
        quantity: 300,
        averagePrice: 620.00,
        currentPrice: 623.40,
        totalValue: 187020,
        totalCost: 186000,
        gainLoss: 1020,
        gainLossPercentage: 0.55,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'HINDUNILVR',
        companyName: 'Hindustan Unilever Limited',
        quantity: 60,
        averagePrice: 2600.00,
        currentPrice: 2634.80,
        totalValue: 158088,
        totalCost: 156000,
        gainLoss: 2088,
        gainLossPercentage: 1.34,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
    ],
    cash: 200000, // ₹2 L
    isActive: true,
    lastAnalyzed: new Date('2024-01-13T14:00:00Z'),
    riskScore: 35,
    createdAt: new Date('2023-07-15T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T15:30:00Z').toISOString(),
  },

  // Investor 3 - Robert Wilson
  {
    id: 'portfolio_003',
    investorId: 'investor_003',
    name: 'Tech Growth',
    description: 'High-growth technology stocks with aggressive allocation',
    totalValue: 3200000, // ₹32 L
    totalCost: 2800000, // ₹28 L
    totalGainLoss: 400000, // ₹4 L
    totalGainLossPercentage: 14.29,
    holdings: [
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        quantity: 120,
        averagePrice: 3750.00,
        currentPrice: 3842.60,
        totalValue: 461112,
        totalCost: 450000,
        gainLoss: 11112,
        gainLossPercentage: 2.47,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        quantity: 200,
        averagePrice: 1380.00,
        currentPrice: 1456.90,
        totalValue: 291380,
        totalCost: 276000,
        gainLoss: 15380,
        gainLossPercentage: 5.57,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'WIPRO',
        companyName: 'Wipro Limited',
        quantity: 300,
        averagePrice: 440.00,
        currentPrice: 456.90,
        totalValue: 137070,
        totalCost: 132000,
        gainLoss: 5070,
        gainLossPercentage: 3.84,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'BHARTIARTL',
        companyName: 'Bharti Airtel Limited',
        quantity: 150,
        averagePrice: 1200.00,
        currentPrice: 1234.55,
        totalValue: 185182.50,
        totalCost: 180000,
        gainLoss: 5182.50,
        gainLossPercentage: 2.88,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
    ],
    cash: 100000, // ₹1 L
    isActive: true,
    lastAnalyzed: new Date('2024-01-15T09:00:00Z'),
    riskScore: 80,
    createdAt: new Date('2023-08-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T15:30:00Z').toISOString(),
  },

  // Investor 4 - Maria Garcia
  {
    id: 'portfolio_004',
    investorId: 'investor_004',
    name: 'Balanced Mix',
    description: 'Diversified portfolio across sectors for balanced growth',
    totalValue: 2100000, // ₹21 L
    totalCost: 2000000, // ₹20 L
    totalGainLoss: 100000, // ₹1 L
    totalGainLossPercentage: 5.00,
    holdings: [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        quantity: 80,
        averagePrice: 2450.00,
        currentPrice: 2456.75,
        totalValue: 196540,
        totalCost: 196000,
        gainLoss: 540,
        gainLossPercentage: 0.28,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'ICICIBANK',
        companyName: 'ICICI Bank Limited',
        quantity: 180,
        averagePrice: 1080.00,
        currentPrice: 1089.45,
        totalValue: 196101,
        totalCost: 194400,
        gainLoss: 1701,
        gainLossPercentage: 0.87,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'ASIANPAINT',
        companyName: 'Asian Paints Limited',
        quantity: 40,
        averagePrice: 3100.00,
        currentPrice: 3156.80,
        totalValue: 126272,
        totalCost: 124000,
        gainLoss: 2272,
        gainLossPercentage: 1.83,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'MARUTI',
        companyName: 'Maruti Suzuki India Limited',
        quantity: 15,
        averagePrice: 10200.00,
        currentPrice: 10456.25,
        totalValue: 156843.75,
        totalCost: 153000,
        gainLoss: 3843.75,
        gainLossPercentage: 2.51,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
    ],
    cash: 180000, // ₹1.8 L
    isActive: true,
    lastAnalyzed: new Date('2024-01-12T16:00:00Z'),
    riskScore: 55,
    createdAt: new Date('2023-09-10T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T15:30:00Z').toISOString(),
  },

  // Investor 5 - James Brown
  {
    id: 'portfolio_005',
    investorId: 'investor_005',
    name: 'Retirement Fund',
    description: 'Long-term retirement focused portfolio with dividend stocks',
    totalValue: 1500000, // ₹15 L
    totalCost: 1450000, // ₹14.5 L
    totalGainLoss: 50000, // ₹50K
    totalGainLossPercentage: 3.45,
    holdings: [
      {
        symbol: 'SBIN',
        companyName: 'State Bank of India',
        quantity: 400,
        averagePrice: 610.00,
        currentPrice: 623.40,
        totalValue: 249360,
        totalCost: 244000,
        gainLoss: 5360,
        gainLossPercentage: 2.20,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'ITC',
        companyName: 'ITC Limited',
        quantity: 600,
        averagePrice: 445.00,
        currentPrice: 456.75,
        totalValue: 274050,
        totalCost: 267000,
        gainLoss: 7050,
        gainLossPercentage: 2.64,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
      {
        symbol: 'HINDUNILVR',
        companyName: 'Hindustan Unilever Limited',
        quantity: 50,
        averagePrice: 2580.00,
        currentPrice: 2634.80,
        totalValue: 131740,
        totalCost: 129000,
        gainLoss: 2740,
        gainLossPercentage: 2.12,
        lastUpdated: new Date('2024-01-15T15:30:00Z'),
      },
    ],
    cash: 250000, // ₹2.5 L
    isActive: true,
    lastAnalyzed: new Date('2024-01-10T11:00:00Z'),
    riskScore: 25,
    createdAt: new Date('2023-10-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T15:30:00Z').toISOString(),
  },
];

export const getPortfoliosByInvestorId = (investorId: string): MockPortfolio[] => {
  return mockPortfolios.filter(portfolio => portfolio.investorId === investorId);
};

export const getPortfolioById = (portfolioId: string): MockPortfolio | undefined => {
  return mockPortfolios.find(portfolio => portfolio.id === portfolioId);
};

export const getActivePortfolios = (): MockPortfolio[] => {
  return mockPortfolios.filter(portfolio => portfolio.isActive);
};

export const getTotalPortfolioValue = (): number => {
  return mockPortfolios.reduce((total, portfolio) => total + portfolio.totalValue, 0);
};

export const getPortfoliosByRiskScore = (minRisk: number, maxRisk: number): MockPortfolio[] => {
  return mockPortfolios.filter(portfolio => 
    portfolio.riskScore >= minRisk && portfolio.riskScore <= maxRisk
  );
};

export default mockPortfolios;
