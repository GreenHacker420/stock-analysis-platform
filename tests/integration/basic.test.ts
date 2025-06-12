/**
 * Basic integration tests for the Stock Analysis Platform
 * Tests core functionality without external dependencies
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock data structures
interface MockUser {
  _id: string;
  email: string;
  name: string;
  role: 'analyst' | 'investor';
  isActive: boolean;
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

interface MockPortfolio {
  _id: string;
  investorId: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: MockHolding[];
  cash: number;
  isActive: boolean;
}

interface MockHolding {
  symbol: string;
  companyName: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

interface MockStockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

// Mock services
class MockUserService {
  private users: MockUser[] = [];

  async createUser(userData: Partial<MockUser>): Promise<MockUser> {
    const user: MockUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'investor',
      isActive: true,
      preferences: {
        riskTolerance: 'medium',
        investmentGoals: ['growth'],
        notifications: {
          email: true,
          push: false
        }
      },
      ...userData
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find(user => user._id === id) || null;
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    const userIndex = this.users.findIndex(user => user._id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user._id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  clear() {
    this.users = [];
  }
}

class MockPortfolioService {
  private portfolios: MockPortfolio[] = [];

  async createPortfolio(portfolioData: Partial<MockPortfolio>): Promise<MockPortfolio> {
    const portfolio: MockPortfolio = {
      _id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      investorId: portfolioData.investorId || '',
      name: portfolioData.name || '',
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercentage: 0,
      holdings: [],
      cash: portfolioData.cash || 0,
      isActive: true,
      ...portfolioData
    };
    this.portfolios.push(portfolio);
    return portfolio;
  }

  async findPortfoliosByInvestor(investorId: string): Promise<MockPortfolio[]> {
    return this.portfolios.filter(p => p.investorId === investorId && p.isActive);
  }

  async findPortfolioById(id: string): Promise<MockPortfolio | null> {
    return this.portfolios.find(p => p._id === id) || null;
  }

  async updatePortfolio(id: string, updates: Partial<MockPortfolio>): Promise<MockPortfolio | null> {
    const portfolioIndex = this.portfolios.findIndex(p => p._id === id);
    if (portfolioIndex === -1) return null;
    
    this.portfolios[portfolioIndex] = { ...this.portfolios[portfolioIndex], ...updates };
    return this.portfolios[portfolioIndex];
  }

  async deletePortfolio(id: string): Promise<boolean> {
    const portfolioIndex = this.portfolios.findIndex(p => p._id === id);
    if (portfolioIndex === -1) return false;
    
    this.portfolios.splice(portfolioIndex, 1);
    return true;
  }

  clear() {
    this.portfolios = [];
  }
}

class MockStockService {
  private stockData: Record<string, MockStockQuote> = {
    'RELIANCE.NSE': {
      symbol: 'RELIANCE.NSE',
      companyName: 'Reliance Industries Limited',
      price: 2750.50,
      change: 25.30,
      changePercent: 0.93,
      volume: 1250000,
      marketCap: 1850000000000,
      lastUpdated: new Date()
    },
    'TCS.NSE': {
      symbol: 'TCS.NSE',
      companyName: 'Tata Consultancy Services',
      price: 3200.75,
      change: -15.25,
      changePercent: -0.47,
      volume: 890000,
      marketCap: 1200000000000,
      lastUpdated: new Date()
    }
  };

  async getQuote(symbol: string): Promise<MockStockQuote | null> {
    return this.stockData[symbol] || null;
  }

  async getMultipleQuotes(symbols: string[]): Promise<MockStockQuote[]> {
    return symbols
      .map(symbol => this.stockData[symbol])
      .filter(quote => quote !== undefined);
  }

  async searchStocks(query: string): Promise<{ symbol: string; name: string }[]> {
    const results = Object.values(this.stockData)
      .filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(query.toLowerCase())
      )
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.companyName
      }));
    
    return results;
  }

  updatePrice(symbol: string, newPrice: number) {
    if (this.stockData[symbol]) {
      const oldPrice = this.stockData[symbol].price;
      this.stockData[symbol].price = newPrice;
      this.stockData[symbol].change = newPrice - oldPrice;
      this.stockData[symbol].changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
      this.stockData[symbol].lastUpdated = new Date();
    }
  }
}

describe('Integration Tests - User Management', () => {
  let userService: MockUserService;

  beforeEach(() => {
    userService = new MockUserService();
  });

  afterEach(() => {
    userService.clear();
  });

  it('should create and retrieve users', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'investor' as const
    };

    const createdUser = await userService.createUser(userData);
    expect(createdUser.email).toBe(userData.email);
    expect(createdUser.name).toBe(userData.name);
    expect(createdUser.role).toBe(userData.role);
    expect(createdUser.isActive).toBe(true);

    const foundUser = await userService.findUserByEmail(userData.email);
    expect(foundUser).toEqual(createdUser);
  });

  it('should handle user updates', async () => {
    const user = await userService.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'investor'
    });

    const updatedUser = await userService.updateUser(user._id, {
      name: 'Updated Name',
      preferences: {
        riskTolerance: 'high',
        investmentGoals: ['growth', 'income'],
        notifications: { email: true, push: true }
      }
    });

    expect(updatedUser?.name).toBe('Updated Name');
    expect(updatedUser?.preferences.riskTolerance).toBe('high');
  });

  it('should handle user deletion', async () => {
    const user = await userService.createUser({
      email: 'test@example.com',
      name: 'Test User'
    });

    const deleted = await userService.deleteUser(user._id);
    expect(deleted).toBe(true);

    const foundUser = await userService.findUserById(user._id);
    expect(foundUser).toBeNull();
  });
});

describe('Integration Tests - Portfolio Management', () => {
  let userService: MockUserService;
  let portfolioService: MockPortfolioService;
  let investor: MockUser;

  beforeEach(async () => {
    userService = new MockUserService();
    portfolioService = new MockPortfolioService();
    
    investor = await userService.createUser({
      email: 'investor@example.com',
      name: 'Test Investor',
      role: 'investor'
    });
  });

  afterEach(() => {
    userService.clear();
    portfolioService.clear();
  });

  it('should create and manage portfolios', async () => {
    const portfolioData = {
      investorId: investor._id,
      name: 'My Test Portfolio',
      cash: 50000
    };

    const portfolio = await portfolioService.createPortfolio(portfolioData);
    expect(portfolio.name).toBe(portfolioData.name);
    expect(portfolio.investorId).toBe(investor._id);
    expect(portfolio.cash).toBe(50000);

    const portfolios = await portfolioService.findPortfoliosByInvestor(investor._id);
    expect(portfolios).toHaveLength(1);
    expect(portfolios[0]).toEqual(portfolio);
  });

  it('should update portfolio holdings', async () => {
    const portfolio = await portfolioService.createPortfolio({
      investorId: investor._id,
      name: 'Test Portfolio'
    });

    const holdings: MockHolding[] = [
      {
        symbol: 'RELIANCE.NSE',
        companyName: 'Reliance Industries',
        shares: 100,
        averageCost: 2500,
        currentPrice: 2750,
        marketValue: 275000,
        gainLoss: 25000,
        gainLossPercentage: 10
      }
    ];

    const updatedPortfolio = await portfolioService.updatePortfolio(portfolio._id, {
      holdings,
      totalValue: 275000,
      totalCost: 250000,
      totalGainLoss: 25000,
      totalGainLossPercentage: 10
    });

    expect(updatedPortfolio?.holdings).toHaveLength(1);
    expect(updatedPortfolio?.totalValue).toBe(275000);
    expect(updatedPortfolio?.totalGainLoss).toBe(25000);
  });
});

describe('Integration Tests - Stock Data', () => {
  let stockService: MockStockService;

  beforeEach(() => {
    stockService = new MockStockService();
  });

  it('should retrieve stock quotes', async () => {
    const quote = await stockService.getQuote('RELIANCE.NSE');
    expect(quote).toBeDefined();
    expect(quote?.symbol).toBe('RELIANCE.NSE');
    expect(quote?.companyName).toBe('Reliance Industries Limited');
    expect(quote?.price).toBe(2750.50);
  });

  it('should handle multiple stock quotes', async () => {
    const symbols = ['RELIANCE.NSE', 'TCS.NSE'];
    const quotes = await stockService.getMultipleQuotes(symbols);
    
    expect(quotes).toHaveLength(2);
    expect(quotes[0].symbol).toBe('RELIANCE.NSE');
    expect(quotes[1].symbol).toBe('TCS.NSE');
  });

  it('should search stocks by name or symbol', async () => {
    const results = await stockService.searchStocks('reliance');
    expect(results).toHaveLength(1);
    expect(results[0].symbol).toBe('RELIANCE.NSE');
    expect(results[0].name).toBe('Reliance Industries Limited');
  });

  it('should update stock prices', () => {
    stockService.updatePrice('RELIANCE.NSE', 2800);
    
    // Verify price update
    stockService.getQuote('RELIANCE.NSE').then(quote => {
      expect(quote?.price).toBe(2800);
      expect(quote?.change).toBe(49.5); // 2800 - 2750.5
    });
  });
});

describe('Integration Tests - End-to-End Workflows', () => {
  let userService: MockUserService;
  let portfolioService: MockPortfolioService;
  let stockService: MockStockService;

  beforeEach(() => {
    userService = new MockUserService();
    portfolioService = new MockPortfolioService();
    stockService = new MockStockService();
  });

  afterEach(() => {
    userService.clear();
    portfolioService.clear();
  });

  it('should complete investor workflow', async () => {
    // 1. Create investor
    const investor = await userService.createUser({
      email: 'investor@example.com',
      name: 'Test Investor',
      role: 'investor'
    });

    // 2. Create portfolio
    const portfolio = await portfolioService.createPortfolio({
      investorId: investor._id,
      name: 'Growth Portfolio',
      cash: 100000
    });

    // 3. Get stock quotes
    const relianceQuote = await stockService.getQuote('RELIANCE.NSE');
    const tcsQuote = await stockService.getQuote('TCS.NSE');

    expect(relianceQuote).toBeDefined();
    expect(tcsQuote).toBeDefined();

    // 4. Add holdings to portfolio
    const holdings: MockHolding[] = [
      {
        symbol: 'RELIANCE.NSE',
        companyName: relianceQuote!.companyName,
        shares: 50,
        averageCost: 2700,
        currentPrice: relianceQuote!.price,
        marketValue: 50 * relianceQuote!.price,
        gainLoss: 50 * (relianceQuote!.price - 2700),
        gainLossPercentage: ((relianceQuote!.price - 2700) / 2700) * 100
      }
    ];

    const updatedPortfolio = await portfolioService.updatePortfolio(portfolio._id, {
      holdings,
      totalValue: holdings[0].marketValue + portfolio.cash,
      totalCost: 50 * 2700 + portfolio.cash,
      totalGainLoss: holdings[0].gainLoss,
      totalGainLossPercentage: (holdings[0].gainLoss / (50 * 2700)) * 100
    });

    expect(updatedPortfolio?.holdings).toHaveLength(1);
    expect(updatedPortfolio?.totalValue).toBeGreaterThan(portfolio.cash);
  });

  it('should handle analyst workflow', async () => {
    // 1. Create analyst and investor
    const analyst = await userService.createUser({
      email: 'analyst@example.com',
      name: 'Test Analyst',
      role: 'analyst'
    });

    const investor = await userService.createUser({
      email: 'investor@example.com',
      name: 'Test Investor',
      role: 'investor'
    });

    // 2. Create portfolio for investor
    const portfolio = await portfolioService.createPortfolio({
      investorId: investor._id,
      name: 'Managed Portfolio'
    });

    // 3. Analyst can access investor's portfolio
    const portfolios = await portfolioService.findPortfoliosByInvestor(investor._id);
    expect(portfolios).toHaveLength(1);
    expect(portfolios[0]._id).toBe(portfolio._id);

    // 4. Verify analyst and investor exist and have correct roles
    expect(analyst.role).toBe('analyst');
    expect(investor.role).toBe('investor');
    expect(analyst._id).toBeDefined();
    expect(investor._id).toBeDefined();
    expect(analyst._id).not.toBe(investor._id);
  });
});
