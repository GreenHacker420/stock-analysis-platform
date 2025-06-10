# Stock Analysis Platform

A comprehensive ChatGPT-like stock analysis platform with AI-powered insights, real-time data, and professional portfolio management tools.

## 🚀 Features

### Core Functionality
- **AI-Powered Analysis**: Google Gemini AI integration for intelligent stock recommendations
- **Real-time Stock Data**: Yahoo Finance API integration for live market data
- **Portfolio Management**: Comprehensive tracking with performance metrics
- **Role-Based Access**: Separate interfaces for analysts and investors
- **Technical Indicators**: RSI, MACD, SMA, EMA calculations
- **Risk Assessment**: Portfolio diversification and concentration analysis

### 🎨 Advanced 3D Visualizations
- **3D Portfolio Visualization**: Interactive 3D donut charts showing portfolio allocation by sector/stock with hover effects and smooth animations
- **3D Stock Performance Cubes**: Dynamic 3D bar charts displaying stock performance over time with depth and perspective
- **Interactive 3D Market Globe**: Rotating 3D globe showing global market performance with clickable regions
- **3D Risk Assessment Pyramid**: Multi-layered 3D pyramid visualization showing risk levels across different portfolio segments

### 📊 Advanced Charts & Analytics
- **Real-time Candlestick Charts**: Interactive candlestick charts with zoom, pan, and technical indicator overlays (RSI, MACD, Bollinger Bands)
- **Multi-dimensional Scatter Plots**: 3D scatter plots showing risk vs. return vs. market cap relationships
- **Animated Line Charts**: Smooth animated line charts for portfolio performance over time with gradient fills
- **Heatmap Visualizations**: Interactive sector performance heatmaps with color-coded performance indicators
- **Correlation Matrix Charts**: Visual correlation matrices showing relationships between different stocks/sectors

### 🎯 UI/UX Enhancements
- **Glassmorphism Effects**: Modern glass-like effects on chart containers with backdrop blur
- **Dark/Light Theme Toggle**: Seamless theme switching for all visualizations with system preference detection
- **Loading Skeletons**: Smooth loading animations for chart components
- **Chart Customization**: Extensive options for colors, time ranges, and technical indicators
- **Export Functionality**: Export charts as PNG, PDF, or SVG with customizable options
- **Accessibility Features**: Keyboard navigation and screen reader support

### User Management
- **Google OAuth Authentication**: Secure login with NextAuth.js
- **Role-Based Permissions**: Analyst and investor user types
- **User-Analyst Relationships**: Many-to-many mapping system
- **Session Management**: Secure token validation

### Dashboard Features
- **Investor Dashboard**: Portfolio overview, performance metrics, AI recommendations
- **Analyst Dashboard**: Multi-investor management, report generation tools
- **Interactive Charts**: Real-time data visualization
- **Report History**: Historical analysis tracking

## 🛠 Tech Stack

### Backend
- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Google Gemini API
- **Stock Data**: Yahoo Finance API

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Dark Mode Support
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion for smooth transitions
- **Charts**: D3.js, Chart.js, React-Chartjs-2
- **UI Components**: Headless UI, Heroicons
- **State Management**: React Hooks and Context API

### Development
- **Language**: TypeScript
- **Linting**: ESLint
- **Package Manager**: npm
- **Environment**: Node.js

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- MongoDB Atlas account
- Google Cloud Console project with OAuth credentials
- Google Gemini API key
- Alpha Vantage API key (optional)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-analysis-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Google Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key

   # Alpha Vantage API (optional)
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
   ```

4. **Database Setup**

   The application will automatically create the necessary collections and indexes when you first run it.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Google Gemini API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment variables

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Get connection string
5. Add your IP to whitelist

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── geminiAI.ts       # AI integration
│   ├── mongodb.ts        # Database connection
│   └── stockData.ts      # Stock data service
├── models/               # Mongoose models
│   ├── User.ts           # User model
│   ├── Portfolio.ts      # Portfolio model
│   ├── AnalysisReport.ts # Analysis report model
│   └── UserAnalyst.ts    # User-analyst relationship
└── types/                # TypeScript type definitions
```

## 🔐 Database Schema

### Users Collection
- User authentication and profile information
- Role-based access control (analyst/investor)
- Preferences and settings

### Portfolios Collection
- Portfolio holdings and performance metrics
- Real-time value calculations
- Risk and diversification scores

### Analysis Reports Collection
- AI-generated analysis and recommendations
- Technical indicators and market conditions
- Historical report tracking

### User-Analyst Relationships Collection
- Many-to-many mapping between analysts and investors
- Permission management
- Communication preferences

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Environment Variables for Production
Make sure to set all environment variables in your production environment:
- Update `NEXTAUTH_URL` to your production domain
- Use strong secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
- Configure production MongoDB connection string

## 📊 Usage

### For Investors
1. **Sign in** with Google account
2. **Create portfolios** and add stock holdings
3. **Generate AI analysis** for investment recommendations
4. **View performance** metrics and risk assessment
5. **Track historical** analysis reports

### For Analysts
1. **Sign in** with Google account (role assigned by admin)
2. **Manage multiple** investor portfolios
3. **Generate comprehensive** analysis reports
4. **Monitor client** portfolio performance
5. **Provide investment** recommendations
6. **Real-time monitoring** of all assigned portfolios
7. **Instant notifications** when analysis completes

## 🔄 Real-time Features

### WebSocket Integration
The platform includes comprehensive real-time functionality:

- **Live Stock Updates**: Real-time price feeds for all portfolio holdings
- **Portfolio Monitoring**: Instant portfolio value updates
- **Analysis Notifications**: Real-time alerts when AI analysis completes
- **Market Alerts**: Breaking news and volatility warnings
- **Multi-user Sync**: Synchronized data across multiple sessions

### Usage Example
```typescript
import { useStockUpdates, usePortfolioUpdates } from '@/hooks/useWebSocket'

function Portfolio({ portfolioId, symbols }) {
  const { stockUpdates, loading, error } = useStockUpdates(symbols)
  const { portfolioUpdate } = usePortfolioUpdates(portfolioId)

  // Real-time updates via polling automatically reflected in UI
  return <PortfolioDisplay data={portfolioUpdate} stocks={stockUpdates} />
}
```

### Server Setup
The platform uses Next.js with intelligent polling for real-time features:
- **Main Server** (Port 3000): Next.js application with API routes
- **Real-time Updates**: Polling-based updates every 30 seconds
- **API Endpoints**: RESTful APIs for all data operations

Start the development server:
```bash
npm run dev  # Starts Next.js with real-time polling
```

## 🧪 Testing

The platform includes comprehensive testing infrastructure with Jest and React Testing Library.

### Running Tests

Run the complete test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

Generate coverage reports:
```bash
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API endpoint and database testing
- **Component Tests**: React component rendering and interaction
- **Service Tests**: Business logic and external API integration

### Test Files

```
src/
├── lib/__tests__/
│   ├── stockData.test.ts      # Stock data service tests
│   ├── geminiAI.test.ts       # AI service tests
│   ├── rateLimiting.test.ts   # Rate limiting tests
│   └── performance.test.ts    # Performance monitoring tests
├── app/api/__tests__/
│   └── portfolios.test.ts     # API endpoint tests
└── components/__tests__/
    └── DashboardOverview.test.tsx # Component tests
```

## 📈 Performance Optimization

### Caching Strategy
- **Stock Data**: 5-minute cache for real-time quotes
- **Technical Indicators**: Cached calculations to reduce computation
- **API Responses**: Intelligent caching based on data volatility
- **Database Queries**: Optimized with proper indexing

### Rate Limiting
- **API Protection**: Multiple rate limiters for different endpoints
- **User-Based Limits**: Different limits for analysts vs investors
- **Intelligent Throttling**: Adaptive limits based on usage patterns
- **DDoS Protection**: Automatic IP blocking for abuse

### Real-time Features
- **WebSocket Integration**: Live stock price updates
- **Portfolio Monitoring**: Real-time portfolio value changes
- **Analysis Notifications**: Instant alerts when reports complete
- **Market Alerts**: Breaking news and volatility warnings

### Performance Monitoring
- **Metrics Collection**: Comprehensive performance tracking
- **API Monitoring**: Response time and error rate tracking
- **Error Tracking**: Automatic error reporting and analysis
- **System Health**: Memory usage and uptime monitoring

## 🔒 Security Features

### Authentication & Authorization
- **OAuth Integration**: Secure Google OAuth with NextAuth.js
- **Role-Based Access**: Granular permissions for analysts and investors
- **Session Management**: JWT tokens with automatic expiration
- **Multi-Factor Support**: Ready for 2FA implementation

### Data Protection
- **Input Validation**: Comprehensive data sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Content Security Policy and input encoding
- **CSRF Protection**: Token-based request validation

### Infrastructure Security
- **Rate Limiting**: Advanced DDoS and abuse protection
- **Environment Isolation**: Secure credential management
- **HTTPS Enforcement**: SSL/TLS encryption in production
- **CORS Configuration**: Controlled cross-origin access

### Monitoring & Compliance
- **Error Tracking**: Comprehensive error logging and alerting
- **Audit Trails**: Complete user action logging
- **Data Encryption**: At-rest and in-transit encryption
- **Privacy Controls**: GDPR-compliant data handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@stockanalysis.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Yahoo Finance](https://finance.yahoo.com/) for stock data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [MongoDB](https://www.mongodb.com/) for database solutions
