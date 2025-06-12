# Indian Stock Market Integration Guide

This document outlines the integration of Indian stock market data and INR currency support in the Stock Analysis Platform.

## 🇮🇳 Indian Market Features

### **API Integration**
- **Primary API**: EOD Historical Data (EODHD)
- **Coverage**: NSE (National Stock Exchange) and BSE (Bombay Stock Exchange)
- **Data Types**: Real-time quotes, historical data, fundamentals
- **Currency**: Indian Rupees (INR)

### **Supported Stocks**
The platform now includes popular Indian stocks:
- **RELIANCE** - Reliance Industries Limited
- **TCS** - Tata Consultancy Services
- **HDFCBANK** - HDFC Bank Limited
- **INFY** - Infosys Limited
- **ICICIBANK** - ICICI Bank Limited
- **HINDUNILVR** - Hindustan Unilever Limited
- **ITC** - ITC Limited
- **SBIN** - State Bank of India
- **BHARTIARTL** - Bharti Airtel Limited
- **ASIANPAINT** - Asian Paints Limited
- **MARUTI** - Maruti Suzuki India Limited
- **WIPRO** - Wipro Limited

## 💰 Currency & Formatting

### **INR Currency Support**
- All monetary values displayed in Indian Rupees (₹)
- Indian numbering system support (Lakhs/Crores)
- Proper currency formatting utilities

### **Number Formatting Examples**
```typescript
formatINR(1000000)        // ₹10.00 L
formatINR(10000000)       // ₹1.00 Cr
formatINR(1000000000000)  // ₹1.00 L Cr
```

### **Utility Functions**
- `formatINR()` - Format amounts in INR with Indian numbering
- `formatPercentage()` - Format percentage values
- `formatVolume()` - Format trading volumes
- `parseIndianNumber()` - Parse Indian formatted numbers back to numbers

## 🕐 Market Hours & Trading

### **Indian Market Hours**
- **Trading Hours**: 9:15 AM - 3:30 PM IST
- **Pre-market**: 9:00 AM - 9:15 AM IST
- **Timezone**: Asia/Kolkata (IST)

### **Market Status Functions**
```typescript
isIndianMarketOpen()      // Check if market is currently open
getNextMarketOpen()       // Get next market opening time
isMarketHoliday(date)     // Check if date is a market holiday
```

### **Market Holidays 2024**
- Republic Day (Jan 26)
- Holi (Mar 8)
- Good Friday (Mar 29)
- Independence Day (Aug 15)
- Gandhi Jayanti (Oct 2)
- Diwali (Nov 1)
- And other major Indian festivals

## 🔧 API Configuration

### **EOD Historical Data Setup**

1. **Get API Key**:
   - Visit [https://eodhd.com/](https://eodhd.com/)
   - Sign up for free tier (500 requests/day)
   - Or subscribe to paid plans for production use

2. **Environment Variables**:
   ```bash
   # .env.local
   EODHD_API_KEY=your_api_key_here
   ```

3. **API Endpoints Used**:
   - Real-time data: `/real-time/{symbol}.NSE`
   - Historical data: `/eod/{symbol}.NSE`
   - Fundamentals: `/fundamentals/{symbol}.NSE`
   - Search: `/search/{query}`

### **Alternative APIs**

If you prefer different APIs, the platform supports:

1. **Alpha Vantage** (Limited Indian coverage)
2. **Polygon.io** (Premium Indian data)
3. **NSE Official API** (Enterprise level)

## 📊 Data Structure

### **Stock Quote Interface**
```typescript
interface StockQuote {
  symbol: string;           // e.g., "RELIANCE"
  companyName: string;      // e.g., "Reliance Industries Limited"
  price: number;            // Current price in INR
  change: number;           // Price change in INR
  changePercent: number;    // Percentage change
  volume: number;           // Trading volume
  marketCap: number;        // Market cap in INR
  peRatio: number;          // Price-to-Earnings ratio
  dividendYield: number;    // Dividend yield percentage
  high52Week: number;       // 52-week high in INR
  low52Week: number;        // 52-week low in INR
  averageVolume: number;    // Average trading volume
  lastUpdated: Date;        // Last update timestamp
  sector?: string;          // Business sector
  industry?: string;        // Industry classification
}
```

### **Mock Data Structure**
```typescript
interface MockIndianStock extends StockQuote {
  sector: string;
  industry: string;
  description: string;
  employees?: number;
  website?: string;
  headquarters?: string;
  exchange: 'NSE' | 'BSE';
}
```

## 🎨 UI/UX Updates

### **Currency Display**
- All prices shown with ₹ symbol
- Large numbers formatted in Lakhs/Crores
- Consistent INR formatting across all components

### **Market Context**
- AI insights updated for Indian market context
- Sector analysis for Indian industries
- NIFTY 50 and SENSEX references
- Indian market sentiment indicators

### **Localization**
- Company descriptions in Indian context
- Market-specific terminology
- Indian business hours display
- Local market holidays integration

## 🚀 Getting Started

### **Quick Setup**

1. **Clone and Install**:
   ```bash
   git clone <repository>
   cd stock-analysis-platform
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your EODHD_API_KEY
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with Google OAuth or email/password
   - Explore Indian stock data and analytics

### **Testing with Demo Data**
- Use `EODHD_API_KEY=demo` for testing
- Limited to 500 requests per day
- Covers major Indian stocks
- Real-time data with 15-minute delay

## 📈 Features Showcase

### **Dashboard Updates**
- Portfolio values in INR (₹20 L, ₹1.5 Cr format)
- Indian stock performance metrics
- Sector-wise analysis for Indian markets
- Real-time Indian market status

### **Charts & Visualizations**
- 3D portfolio charts with INR values
- Indian stock correlation matrices
- Sector performance heatmaps
- Risk analysis with Indian market context

### **Analytics**
- AI insights for Indian market trends
- NIFTY 50 performance comparisons
- Indian sector rotation analysis
- Risk-adjusted returns vs Indian benchmarks

## 🔒 Production Considerations

### **API Rate Limits**
- Free tier: 500 requests/day
- Paid plans: Up to 100,000 requests/day
- Implement proper caching (5-minute TTL)
- Consider WebSocket for real-time updates

### **Error Handling**
- Graceful fallback to mock data
- API timeout handling
- Rate limit management
- Market hours validation

### **Performance**
- Client-side caching
- Optimized API calls
- Lazy loading for large datasets
- Efficient data structures

## 📞 Support & Resources

### **API Documentation**
- [EODHD API Docs](https://eodhd.com/financial-apis/)
- [NSE Official Website](https://www.nseindia.com/)
- [BSE Official Website](https://www.bseindia.com/)

### **Indian Market Resources**
- [SEBI Guidelines](https://www.sebi.gov.in/)
- [RBI Monetary Policy](https://www.rbi.org.in/)
- [Economic Times Markets](https://economictimes.indiatimes.com/markets)

### **Technical Support**
- Check API status at EODHD status page
- Review rate limits in API response headers
- Monitor application logs for API errors
- Use demo key for development/testing

---

**Note**: This integration focuses on Indian equity markets. For derivatives, commodities, or other asset classes, additional API endpoints and configurations may be required.
