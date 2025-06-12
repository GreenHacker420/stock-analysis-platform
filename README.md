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
├── types/                # TypeScript type definitions
├── tests/                # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── docs/                 # Comprehensive documentation
    ├── getting-started/  # Installation and setup guides
    ├── api/              # API documentation
    ├── architecture/     # System architecture docs
    ├── features/         # Feature-specific guides
    ├── deployment/       # Deployment guides
    ├── testing/          # Testing documentation
    ├── reports/          # Technical reports
    └── maintenance/      # Maintenance and monitoring
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

### 🚀 Getting Started
- [Installation Guide](docs/getting-started/installation.md) - Complete setup instructions
- [Configuration Guide](docs/getting-started/configuration.md) - Environment configuration
- [Quick Start Guide](docs/getting-started/quick-start.md) - Get up and running quickly

### 🔌 API Documentation
- [Complete API Reference](docs/api/api-documentation.md) - Full API documentation
- [Authentication](docs/api/authentication.md) - Auth endpoints and security
- [Portfolio Management](docs/api/portfolios.md) - Portfolio APIs
- [Stock Data](docs/api/stocks.md) - Stock market data APIs

### 🏗️ Architecture
- [System Overview](docs/architecture/system-overview.md) - High-level architecture
- [Technical Decisions](docs/architecture/technical-decisions.md) - Architecture rationale
- [Security Implementation](docs/architecture/security.md) - Security measures

### ✨ Features
- [AI-Powered Analysis](docs/features/ai-analysis.md) - AI capabilities and implementation
- [Indian Market Integration](docs/features/indian-market.md) - NSE/BSE integration
- [3D Visualizations](docs/features/3d-visualizations.md) - Advanced 3D features

### 🚀 Deployment
- [Deployment Guide](docs/deployment/deployment-guide.md) - Production deployment
- [Environment Setup](docs/deployment/environment-setup.md) - Environment configuration
- [Production Checklist](docs/deployment/production-checklist.md) - Pre-deployment checklist

### 🧪 Testing
- [Testing Guide](docs/testing/testing-guide.md) - Testing strategies and setup
- [Test Coverage](docs/testing/test-coverage.md) - Coverage reports and metrics

### 📊 Reports
- [Technical Report](docs/reports/technical-report.md) - Comprehensive technical analysis
- [Assignment Deliverables](docs/reports/assignment-deliverables.md) - Project deliverables

### 🔧 Maintenance
- [Performance Optimization](docs/maintenance/performance-optimization.md) - Performance tuning
- [Monitoring & Logging](docs/maintenance/monitoring.md) - System monitoring
- [Troubleshooting](docs/maintenance/troubleshooting.md) - Common issues and solutions

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

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📈 Performance Optimization

- **Caching**: Stock data cached for 5 minutes
- **Rate Limiting**: API calls limited to prevent abuse
- **Database Indexing**: Optimized queries with proper indexes
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting with Next.js

## 🔒 Security Features

- **Authentication**: Secure OAuth with NextAuth.js
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Environment Variables**: Secure credential management
- **HTTPS**: SSL/TLS encryption in production
- **CORS**: Cross-origin request protection

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
