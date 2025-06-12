# Testing Guide

Comprehensive testing strategy and implementation guide for the Stock Analysis Platform.

## 🧪 Testing Overview

### Testing Philosophy
The platform follows a comprehensive testing approach with multiple layers:
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and service integration testing
- **End-to-End Tests**: Complete user workflow testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization testing

### Testing Stack
- **Test Runner**: Jest
- **React Testing**: React Testing Library
- **API Testing**: Supertest
- **Database Testing**: MongoDB Memory Server
- **Mocking**: Jest mocks and MSW (Mock Service Worker)
- **Coverage**: Istanbul/NYC

## 🏗️ Test Structure

### Directory Organization
```
tests/
├── unit/                 # Unit tests
│   ├── components/       # React component tests
│   ├── lib/             # Utility function tests
│   ├── services/        # Service layer tests
│   └── utils/           # Helper function tests
├── integration/         # Integration tests
│   ├── api/            # API endpoint tests
│   ├── database/       # Database operation tests
│   └── services/       # Service integration tests
├── e2e/                # End-to-end tests
│   ├── auth/           # Authentication flows
│   ├── portfolio/      # Portfolio management
│   └── analysis/       # AI analysis workflows
├── fixtures/           # Test data and fixtures
├── mocks/              # Mock implementations
└── setup.ts            # Test configuration
```

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup
```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    },
    status: 'authenticated'
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
```

## 🧩 Unit Testing

### Component Testing
```typescript
// tests/unit/components/PortfolioCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';

const mockPortfolio = {
  _id: 'portfolio-1',
  name: 'Test Portfolio',
  totalValue: 150000,
  totalGainLoss: 25000,
  totalGainLossPercentage: 20.0,
  holdings: []
};

describe('PortfolioCard', () => {
  it('renders portfolio information correctly', () => {
    render(<PortfolioCard portfolio={mockPortfolio} />);
    
    expect(screen.getByText('Test Portfolio')).toBeInTheDocument();
    expect(screen.getByText('₹1,50,000')).toBeInTheDocument();
    expect(screen.getByText('+₹25,000')).toBeInTheDocument();
    expect(screen.getByText('+20.0%')).toBeInTheDocument();
  });

  it('handles negative gains correctly', () => {
    const portfolioWithLoss = {
      ...mockPortfolio,
      totalGainLoss: -10000,
      totalGainLossPercentage: -6.67
    };
    
    render(<PortfolioCard portfolio={portfolioWithLoss} />);
    
    expect(screen.getByText('-₹10,000')).toBeInTheDocument();
    expect(screen.getByText('-6.67%')).toBeInTheDocument();
  });
});
```

### Service Testing
```typescript
// tests/unit/services/stockService.test.ts
import { StockService } from '@/lib/stockService';
import { mockStockData } from '@/tests/fixtures/stockData';

jest.mock('node-fetch');

describe('StockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIndianStocks', () => {
    it('fetches and transforms stock data correctly', async () => {
      const mockFetch = jest.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStockData)
      } as Response);

      const result = await StockService.getIndianStocks();

      expect(result.success).toBe(true);
      expect(result.stocks).toHaveLength(30);
      expect(result.stocks[0]).toHaveProperty('symbol');
      expect(result.stocks[0]).toHaveProperty('price');
    });

    it('handles API errors gracefully', async () => {
      const mockFetch = jest.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await StockService.getIndianStocks();

      expect(result.success).toBe(true);
      expect(result.source).toContain('Mock data');
    });
  });
});
```

## 🔗 Integration Testing

### API Endpoint Testing
```typescript
// tests/integration/api/portfolios.test.ts
import request from 'supertest';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/portfolios/route';
import { connectTestDB, clearTestDB } from '@/tests/utils/testDb';

describe('/api/portfolios', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/portfolios', () => {
    it('returns user portfolios', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-jwt-token'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(Array.isArray(data.portfolios)).toBe(true);
    });

    it('requires authentication', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('POST /api/portfolios', () => {
    it('creates new portfolio', async () => {
      const portfolioData = {
        name: 'Test Portfolio',
        description: 'Test Description',
        cash: 100000
      };

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-jwt-token',
          'content-type': 'application/json'
        },
        body: portfolioData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.portfolio.name).toBe('Test Portfolio');
    });
  });
});
```

### Database Integration Testing
```typescript
// tests/integration/database/portfolio.test.ts
import { Portfolio } from '@/models/Portfolio';
import { User } from '@/models/User';
import { connectTestDB, clearTestDB } from '@/tests/utils/testDb';

describe('Portfolio Model', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('creates portfolio with valid data', async () => {
    const user = await User.create({
      email: 'test@example.com',
      name: 'Test User',
      role: 'investor'
    });

    const portfolio = await Portfolio.create({
      investorId: user._id,
      name: 'Test Portfolio',
      totalValue: 100000,
      totalCost: 80000,
      holdings: []
    });

    expect(portfolio.name).toBe('Test Portfolio');
    expect(portfolio.investorId.toString()).toBe(user._id.toString());
  });

  it('validates required fields', async () => {
    await expect(Portfolio.create({})).rejects.toThrow();
  });
});
```

## 🎭 End-to-End Testing

### Authentication Flow Testing
```typescript
// tests/e2e/auth/login.test.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login with credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('[data-testid="email-input"]', 'john.doe@email.com');
    await page.fill('[data-testid="password-input"]', 'investor123!');
    await page.click('[data-testid="signin-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('John Doe');
  });

  test('handles invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="signin-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

### Portfolio Management Testing
```typescript
// tests/e2e/portfolio/management.test.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'john.doe@email.com');
    await page.fill('[data-testid="password-input"]', 'investor123!');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('/dashboard');
  });

  test('creates new portfolio', async ({ page }) => {
    await page.click('[data-testid="create-portfolio-button"]');
    
    await page.fill('[data-testid="portfolio-name"]', 'E2E Test Portfolio');
    await page.fill('[data-testid="portfolio-description"]', 'Test Description');
    await page.fill('[data-testid="initial-cash"]', '100000');
    
    await page.click('[data-testid="save-portfolio-button"]');
    
    await expect(page.locator('[data-testid="portfolio-card"]')).toContainText('E2E Test Portfolio');
  });

  test('adds stock holding', async ({ page }) => {
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="add-holding-button"]');
    
    await page.fill('[data-testid="stock-symbol"]', 'RELIANCE.NSE');
    await page.fill('[data-testid="shares-count"]', '100');
    await page.fill('[data-testid="average-cost"]', '2500');
    
    await page.click('[data-testid="save-holding-button"]');
    
    await expect(page.locator('[data-testid="holding-row"]')).toContainText('RELIANCE.NSE');
  });
});
```

## 📊 Performance Testing

### Load Testing
```typescript
// tests/performance/load.test.ts
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  test('API response time under load', async () => {
    const requests = Array.from({ length: 100 }, () => 
      fetch('/api/stocks/indian')
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const end = performance.now();

    const averageTime = (end - start) / requests.length;
    
    expect(averageTime).toBeLessThan(1000); // Less than 1 second average
    expect(responses.every(r => r.ok)).toBe(true);
  });

  test('AI analysis performance', async () => {
    const start = performance.now();
    
    const response = await fetch('/api/analysis/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId: 'test-portfolio-id' })
    });
    
    const end = performance.now();
    const responseTime = end - start;
    
    expect(response.ok).toBe(true);
    expect(responseTime).toBeLessThan(10000); // Less than 10 seconds
  });
});
```

## 🔒 Security Testing

### Authentication Security
```typescript
// tests/security/auth.test.ts
describe('Authentication Security', () => {
  test('prevents unauthorized access', async () => {
    const response = await fetch('/api/portfolios');
    expect(response.status).toBe(401);
  });

  test('validates JWT tokens', async () => {
    const response = await fetch('/api/portfolios', {
      headers: { authorization: 'Bearer invalid-token' }
    });
    expect(response.status).toBe(401);
  });

  test('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await fetch('/api/portfolios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: maliciousInput })
    });
    
    // Should not cause server error
    expect(response.status).not.toBe(500);
  });
});
```

## 🚀 Running Tests

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📈 Test Metrics and Goals

### Coverage Targets
- **Overall Coverage**: 80%+
- **Critical Paths**: 95%+
- **API Endpoints**: 90%+
- **Business Logic**: 85%+

### Performance Targets
- **API Response Time**: < 500ms average
- **AI Analysis**: < 10 seconds
- **Page Load Time**: < 2 seconds
- **Database Queries**: < 100ms

### Quality Metrics
- **Test Reliability**: 99%+ pass rate
- **Test Maintenance**: Regular updates with code changes
- **Bug Detection**: Early detection in CI/CD pipeline
- **Regression Prevention**: Comprehensive regression test suite

---

This comprehensive testing strategy ensures the Stock Analysis Platform maintains high quality, performance, and security standards throughout development and deployment.
