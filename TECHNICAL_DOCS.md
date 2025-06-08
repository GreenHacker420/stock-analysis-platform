# Technical Documentation

## 🏗 Architecture Overview

The Stock Analysis Platform is built using a modern full-stack architecture with the following components:

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Hooks and Context API
- **Authentication**: NextAuth.js for OAuth integration

### Backend Architecture
- **API**: Next.js API Routes (serverless functions)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT tokens with NextAuth.js
- **External APIs**: Yahoo Finance, Google Gemini AI

### Data Flow
```
User → Next.js Frontend → API Routes → MongoDB
                      ↓
                 External APIs (Yahoo Finance, Gemini AI)
```

## 📊 Database Schema

### Collections Overview

#### Users Collection
```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  name: string;
  image?: string;
  role: 'analyst' | 'investor';
  googleId?: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Portfolios Collection
```typescript
interface IPortfolio {
  _id: ObjectId;
  investorId: ObjectId; // Reference to User
  name: string;
  description?: string;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: IHolding[];
  cash: number;
  riskScore: number;
  diversificationScore: number;
  performanceMetrics: {
    dailyReturn: number;
    weeklyReturn: number;
    monthlyReturn: number;
    yearlyReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  isActive: boolean;
  lastAnalyzed?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Analysis Reports Collection
```typescript
interface IAnalysisReport {
  _id: ObjectId;
  portfolioId: ObjectId; // Reference to Portfolio
  analystId: ObjectId; // Reference to User (analyst)
  investorId: ObjectId; // Reference to User (investor)
  title: string;
  summary: string;
  aiAnalysis: string;
  recommendations: IRecommendation[];
  technicalIndicators: ITechnicalIndicators[];
  marketConditions: {
    overall: 'bullish' | 'bearish' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    trend: 'upward' | 'downward' | 'sideways';
    sentiment: string;
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    diversificationRisk: number;
    concentrationRisk: number;
    marketRisk: number;
    recommendations: string[];
  };
  status: 'draft' | 'completed' | 'archived';
  validUntil: Date;
  metadata: {
    aiModel: string;
    processingTime: number;
    confidence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### User-Analyst Relationships Collection
```typescript
interface IUserAnalyst {
  _id: ObjectId;
  analystId: ObjectId; // Reference to User (analyst)
  investorId: ObjectId; // Reference to User (investor)
  status: 'active' | 'inactive' | 'pending';
  assignedAt: Date;
  assignedBy: ObjectId; // Reference to User
  permissions: {
    canViewPortfolio: boolean;
    canGenerateReports: boolean;
    canModifyPortfolio: boolean;
    canCommunicate: boolean;
  };
  communicationPreferences: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    methods: ('email' | 'platform' | 'phone')[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Indexes

#### Performance Optimization Indexes
```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true })
db.users.createIndex({ role: 1 })

// Portfolios Collection
db.portfolios.createIndex({ investorId: 1 })
db.portfolios.createIndex({ investorId: 1, isActive: 1 })
db.portfolios.createIndex({ "holdings.symbol": 1 })

// Analysis Reports Collection
db.analysisreports.createIndex({ portfolioId: 1 })
db.analysisreports.createIndex({ analystId: 1 })
db.analysisreports.createIndex({ investorId: 1 })
db.analysisreports.createIndex({ status: 1 })
db.analysisreports.createIndex({ createdAt: -1 })
db.analysisreports.createIndex({ validUntil: 1 })

// User-Analyst Relationships Collection
db.useranalysts.createIndex({ analystId: 1, investorId: 1 }, { unique: true })
db.useranalysts.createIndex({ analystId: 1, status: 1 })
db.useranalysts.createIndex({ investorId: 1, status: 1 })
```

## 🔌 API Endpoints

### Authentication Endpoints
```
GET  /api/auth/signin          # Sign in page
POST /api/auth/signin          # Process sign in
GET  /api/auth/signout         # Sign out
GET  /api/auth/session         # Get current session
GET  /api/auth/callback/google # OAuth callback
```

### Portfolio Management
```
GET    /api/portfolios         # List portfolios
POST   /api/portfolios         # Create portfolio
GET    /api/portfolios/[id]    # Get portfolio details
PUT    /api/portfolios/[id]    # Update portfolio
DELETE /api/portfolios/[id]    # Delete portfolio
```

### Stock Data
```
GET /api/stocks/quote?symbol=AAPL    # Get stock quote
GET /api/stocks/search?q=apple       # Search stocks
GET /api/stocks/historical/[symbol]  # Historical data
GET /api/stocks/technical/[symbol]   # Technical indicators
```

### Analysis & Reports
```
GET  /api/reports              # List reports
POST /api/analysis/generate    # Generate AI analysis
GET  /api/reports/[id]         # Get report details
PUT  /api/reports/[id]         # Update report
```

### Dashboard & Statistics
```
GET /api/dashboard/stats       # Dashboard statistics
GET /api/users/profile         # User profile
PUT /api/users/profile         # Update profile
```

## 🤖 AI Integration

### Google Gemini AI Service

The platform integrates with Google Gemini AI for intelligent stock analysis:

#### Analysis Process
1. **Data Collection**: Gather portfolio data, stock quotes, and technical indicators
2. **Prompt Generation**: Create dynamic prompts with market context
3. **AI Processing**: Send structured data to Gemini API
4. **Response Parsing**: Extract recommendations and insights
5. **Report Generation**: Create formatted analysis reports

#### Prompt Structure
```typescript
const prompt = `
You are a professional financial analyst. Analyze this portfolio:

USER PROFILE:
- Risk Tolerance: ${user.preferences.riskTolerance}
- Investment Goals: ${user.preferences.investmentGoals.join(', ')}

PORTFOLIO SUMMARY:
- Total Value: $${portfolio.totalValue}
- Holdings: ${portfolio.holdings.length} stocks
- [Detailed holdings data...]

TECHNICAL INDICATORS:
- RSI, MACD, SMA values for each stock
- Volume analysis
- Price trends

Provide specific buy/sell/hold recommendations with reasoning.
`;
```

### Stock Data Service

#### Yahoo Finance Integration
```typescript
class StockDataService {
  async getQuote(symbol: string): Promise<StockQuote>
  async getHistoricalData(symbol: string, period: string): Promise<HistoricalData[]>
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators>
  async searchStocks(query: string): Promise<SearchResult[]>
}
```

#### Technical Indicators Calculation
- **RSI (Relative Strength Index)**: Momentum oscillator
- **MACD (Moving Average Convergence Divergence)**: Trend indicator
- **SMA (Simple Moving Average)**: Price trend smoothing
- **EMA (Exponential Moving Average)**: Weighted price average

## 🔐 Security Implementation

### Authentication & Authorization

#### NextAuth.js Configuration
```typescript
export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      // User creation/update
      return true;
    },
    async session({ session, token }) {
      // Add custom session data
      session.user.role = user.role;
      return session;
    }
  },
  session: { strategy: 'jwt' }
};
```

#### Role-Based Access Control
```typescript
// Middleware for API routes
export function withAuth(handler: NextApiHandler, allowedRoles: string[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !allowedRoles.includes(session.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return handler(req, res);
  };
}
```

### Data Protection

#### Input Validation
```typescript
import { z } from 'zod';

const portfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  investorId: z.string().regex(/^[0-9a-fA-F]{24}$/)
});
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

## 🚀 Performance Optimization

### Caching Strategy

#### API Response Caching
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export async function getCachedStockQuote(symbol: string) {
  const cacheKey = `quote_${symbol}`;
  let quote = cache.get(cacheKey);
  
  if (!quote) {
    quote = await fetchStockQuote(symbol);
    cache.set(cacheKey, quote);
  }
  
  return quote;
}
```

#### Database Query Optimization
- Use appropriate indexes
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries
- Limit field selection with projections

### Frontend Optimization

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const AdvancedChart = dynamic(() => import('./AdvancedChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

#### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/stock-chart.png"
  alt="Stock Chart"
  width={800}
  height={400}
  priority
  placeholder="blur"
/>
```

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Example test for stock data service
describe('StockDataService', () => {
  it('should fetch stock quote', async () => {
    const service = StockDataService.getInstance();
    const quote = await service.getQuote('AAPL');
    
    expect(quote).toBeDefined();
    expect(quote.symbol).toBe('AAPL');
    expect(quote.price).toBeGreaterThan(0);
  });
});
```

### Integration Testing
```typescript
// API route testing
describe('/api/portfolios', () => {
  it('should create portfolio for authenticated user', async () => {
    const response = await request(app)
      .post('/api/portfolios')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Portfolio' });
    
    expect(response.status).toBe(201);
    expect(response.body.portfolio.name).toBe('Test Portfolio');
  });
});
```

## 📊 Monitoring & Analytics

### Error Tracking
```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```typescript
// Custom analytics
export function trackEvent(eventName: string, properties: object) {
  if (typeof window !== 'undefined') {
    // Send to analytics service
    analytics.track(eventName, properties);
  }
}
```

### Health Checks
```typescript
// API health check endpoint
export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'healthy' });
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy' }, { status: 500 });
  }
}
```

## 🔧 Development Workflow

### Environment Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking
- Husky for pre-commit hooks

### Git Workflow
1. Feature branches from `main`
2. Pull request reviews required
3. Automated testing on PR
4. Merge to `main` triggers deployment

This technical documentation provides a comprehensive overview of the platform's architecture, implementation details, and best practices for development and maintenance.
