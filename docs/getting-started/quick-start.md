# Quick Start Guide

Get up and running with the Stock Analysis Platform in minutes! This guide assumes you've completed the [Installation](installation.md) and [Configuration](configuration.md) steps.

## 🚀 First Steps

### 1. Start the Development Server

```bash
cd stock-analysis-platform
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 2. Access the Platform

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

You'll see the landing page with login options.

## 🔐 Authentication

### Demo Accounts

Use these pre-configured demo accounts to explore the platform:

#### Analyst Account
- **Email**: `sarah.johnson@stockanalyzer.com`
- **Password**: `analyst123!`
- **Role**: Analyst (can manage multiple investor portfolios)

#### Investor Account
- **Email**: `john.doe@email.com`
- **Password**: `investor123!`
- **Role**: Investor (can manage personal portfolios)

### Google OAuth (Optional)
- Click "Sign in with Google"
- Use your Google account credentials
- First-time users will be assigned the "investor" role by default

## 📊 Investor Quick Tour

### 1. Dashboard Overview
After logging in as an investor, you'll see:
- **Portfolio Summary**: Total value, gains/losses, performance metrics
- **Stock Holdings**: Individual stock positions with current prices
- **Performance Charts**: Visual representation of portfolio performance
- **AI Recommendations**: Latest AI-generated investment insights

### 2. Create Your First Portfolio

```bash
# Navigate to Portfolios section
1. Click "Portfolios" in the navigation
2. Click "Create New Portfolio"
3. Enter portfolio details:
   - Name: "My Investment Portfolio"
   - Description: "Long-term growth portfolio"
   - Initial Cash: ₹100,000
4. Click "Create Portfolio"
```

### 3. Add Stock Holdings

```bash
# Add stocks to your portfolio
1. Open your portfolio
2. Click "Add Holding"
3. Search for Indian stocks (e.g., "RELIANCE", "TCS", "INFY")
4. Enter holding details:
   - Symbol: RELIANCE.NSE
   - Shares: 100
   - Average Cost: ₹2,500
5. Click "Add Holding"
```

### 4. Generate AI Analysis

```bash
# Get AI-powered investment recommendations
1. Go to your portfolio
2. Click "Generate AI Analysis"
3. Wait for analysis (2-5 seconds)
4. Review recommendations:
   - Buy/Hold/Sell recommendations
   - Target prices and confidence scores
   - Risk assessment
   - Market outlook
```

## 👨‍💼 Analyst Quick Tour

### 1. Analyst Dashboard
After logging in as an analyst, you'll see:
- **Client Overview**: List of assigned investors
- **Portfolio Management**: Multi-client portfolio view
- **Report Generation**: Bulk analysis tools
- **Performance Tracking**: Cross-client performance metrics

### 2. Manage Client Portfolios

```bash
# View and analyze client portfolios
1. Click on a client from the dashboard
2. Review their portfolio composition
3. Generate comprehensive analysis reports
4. Provide investment recommendations
```

### 3. Generate Client Reports

```bash
# Create detailed analysis reports
1. Select client portfolio
2. Click "Generate Report"
3. Choose analysis type:
   - Comprehensive Analysis
   - Risk Assessment
   - Performance Review
4. Review and save report
```

## 📈 Key Features to Explore

### 1. Real-time Stock Data
- **Indian Market Focus**: NSE and BSE stocks
- **Live Prices**: Real-time price updates during market hours
- **Technical Indicators**: RSI, MACD, SMA, EMA calculations
- **Historical Data**: Charts with various time periods

### 2. AI-Powered Analysis
- **Investment Recommendations**: Buy/Hold/Sell with confidence scores
- **Risk Assessment**: Portfolio diversification analysis
- **Market Sentiment**: AI-driven market outlook
- **Performance Insights**: Benchmark comparisons

### 3. 3D Visualizations
- **Portfolio Allocation**: Interactive 3D donut charts
- **Performance Cubes**: 3D bar charts for stock performance
- **Market Globe**: Global market performance visualization
- **Risk Pyramid**: Multi-layered risk assessment

### 4. Advanced Charts
- **Candlestick Charts**: Interactive price charts with technical indicators
- **Correlation Matrix**: Stock relationship analysis
- **Heatmaps**: Sector performance visualization
- **Animated Charts**: Smooth performance animations

## 🎯 Common Use Cases

### For Investors

#### Portfolio Tracking
```bash
1. Monitor daily portfolio performance
2. Track individual stock gains/losses
3. View performance metrics (returns, volatility, Sharpe ratio)
4. Compare against market benchmarks
```

#### Investment Decisions
```bash
1. Get AI recommendations for current holdings
2. Analyze risk vs. return profiles
3. Identify diversification opportunities
4. Set target prices and stop losses
```

#### Performance Analysis
```bash
1. Review historical performance
2. Analyze sector allocation
3. Track dividend income
4. Monitor portfolio volatility
```

### For Analysts

#### Client Management
```bash
1. Oversee multiple client portfolios
2. Generate comparative analysis reports
3. Identify optimization opportunities
4. Track client performance metrics
```

#### Report Generation
```bash
1. Create comprehensive investment reports
2. Provide detailed market analysis
3. Generate risk assessment documents
4. Deliver actionable recommendations
```

## 🔧 Customization Options

### Theme Settings
- **Dark Mode**: Toggle between light and dark themes
- **Chart Colors**: Customize visualization color schemes
- **Layout**: Adjust dashboard layout preferences

### Notification Preferences
- **Email Alerts**: Portfolio performance notifications
- **Price Alerts**: Stock price movement notifications
- **Report Updates**: New analysis report notifications

### Risk Preferences
- **Risk Tolerance**: Set personal risk tolerance (Low/Medium/High)
- **Investment Goals**: Define investment objectives
- **Time Horizon**: Set investment time frame

## 📱 Mobile Experience

The platform is fully responsive and works on:
- **Desktop**: Full feature set with advanced visualizations
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Essential features with simplified interface

## 🆘 Getting Help

### Built-in Help
- **Tooltips**: Hover over elements for explanations
- **Help Center**: Access documentation from the platform
- **Demo Mode**: Guided tour of key features

### Support Resources
- **Documentation**: Comprehensive guides in the `/docs` folder
- **API Reference**: Complete API documentation
- **Troubleshooting**: Common issues and solutions
- **GitHub Issues**: Report bugs or request features

## ✅ Next Steps

Now that you're familiar with the basics:

1. **Explore Advanced Features**:
   - Try the 3D visualizations
   - Experiment with different chart types
   - Test the AI chat interface

2. **Customize Your Experience**:
   - Set up notification preferences
   - Configure risk tolerance settings
   - Customize dashboard layout

3. **Learn More**:
   - Read the [API Documentation](../api/api-documentation.md)
   - Explore [Feature Guides](../features/)
   - Review [Architecture Documentation](../architecture/)

4. **Deploy to Production**:
   - Follow the [Deployment Guide](../deployment/deployment-guide.md)
   - Set up production environment
   - Configure monitoring and logging

## 🎉 Congratulations!

You're now ready to use the Stock Analysis Platform effectively. The platform provides powerful tools for both individual investors and professional analysts to make informed investment decisions with AI-powered insights.

### Demo Data Available
The platform comes pre-loaded with realistic demo data including:
- Sample portfolios with Indian stocks
- Historical performance data
- Pre-generated analysis reports
- Technical indicator calculations

### Production Ready
When you're ready to use real data:
- Configure live API keys for stock data
- Set up production database
- Deploy to your preferred hosting platform

---

*Happy investing! 📈*
