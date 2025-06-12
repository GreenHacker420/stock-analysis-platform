# Configuration Guide

This guide covers detailed configuration options for the Stock Analysis Platform.

## 🔧 Environment Variables

### Required Configuration

#### Database Configuration
```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis

# Database name (optional, defaults to 'stock-analysis')
DB_NAME=stock-analysis
```

#### Authentication Configuration
```env
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# JWT configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=30d
```

#### Google OAuth Configuration
```env
# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### AI Integration Configuration
```env
# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# AI analysis configuration
AI_ANALYSIS_TIMEOUT=30000
AI_MAX_RETRIES=3
```

### Optional Configuration

#### Stock Data APIs
```env
# EODHD API for Indian stocks (primary)
EODHD_API_KEY=your-eodhd-api-key
EODHD_BASE_URL=https://eodhd.com/api

# Alpha Vantage API (fallback)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# Yahoo Finance (fallback, no key required)
YAHOO_FINANCE_ENABLED=true
```

#### Rate Limiting Configuration
```env
# API rate limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100
AI_RATE_LIMIT_MAX_REQUESTS=10
STOCK_RATE_LIMIT_MAX_REQUESTS=200
```

#### Cache Configuration
```env
# Stock data caching
STOCK_CACHE_TTL=300000    # 5 minutes in milliseconds
PORTFOLIO_CACHE_TTL=60000 # 1 minute in milliseconds
```

## 🗄️ Database Configuration

### MongoDB Atlas Setup

#### 1. Create Cluster
```bash
# Recommended cluster configuration:
# - Tier: M0 (Free) or M2+ for production
# - Region: Closest to your users
# - MongoDB Version: 6.0+
```

#### 2. Database User Setup
```javascript
// Create user with readWrite permissions
{
  "username": "stock-platform-user",
  "password": "secure-password-here",
  "roles": [
    {
      "role": "readWrite",
      "db": "stock-analysis"
    }
  ]
}
```

#### 3. Network Access
```bash
# For development: Allow access from anywhere
0.0.0.0/0

# For production: Restrict to specific IPs
# Add your server's IP addresses
```

### Connection String Format
```env
# Standard connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis?retryWrites=true&w=majority

# With additional options
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000
```

## 🔐 Authentication Configuration

### NextAuth.js Setup

#### 1. NextAuth Secret Generation
```bash
# Generate a secure secret
openssl rand -base64 32
```

#### 2. Google OAuth Setup
```javascript
// Google Cloud Console configuration
{
  "client_id": "your-client-id.googleusercontent.com",
  "client_secret": "your-client-secret",
  "redirect_uris": [
    "http://localhost:3000/api/auth/callback/google",
    "https://yourdomain.com/api/auth/callback/google"
  ],
  "javascript_origins": [
    "http://localhost:3000",
    "https://yourdomain.com"
  ]
}
```

#### 3. Session Configuration
```env
# Session settings
NEXTAUTH_SESSION_STRATEGY=jwt
NEXTAUTH_JWT_EXPIRES_IN=30d
NEXTAUTH_SESSION_MAX_AGE=2592000  # 30 days in seconds
```

## 🤖 AI Configuration

### Google Gemini Setup

#### 1. API Key Configuration
```env
# Gemini API settings
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=4096
```

#### 2. Analysis Configuration
```env
# AI analysis settings
AI_ANALYSIS_TIMEOUT=30000      # 30 seconds
AI_MAX_RETRIES=3
AI_RETRY_DELAY=1000           # 1 second
AI_CONTEXT_WINDOW_SIZE=32768  # Token limit
```

#### 3. Prompt Configuration
```javascript
// Custom prompt templates can be configured
const ANALYSIS_PROMPT_TEMPLATE = `
  Analyze the following portfolio for {user_name} with risk tolerance: {risk_tolerance}
  Portfolio Holdings: {holdings}
  Technical Indicators: {technical_data}
  Market Conditions: {market_conditions}
  
  Provide detailed analysis with:
  1. Investment recommendations
  2. Risk assessment
  3. Market outlook
  4. Performance analysis
`;
```

## 📊 Stock Data Configuration

### API Priority Configuration
```env
# API priority order (comma-separated)
STOCK_API_PRIORITY=eodhd,yahoo,mock

# Individual API settings
EODHD_ENABLED=true
YAHOO_FINANCE_ENABLED=true
MOCK_DATA_ENABLED=true
```

### Indian Market Configuration
```env
# Market-specific settings
DEFAULT_EXCHANGE=NSE
SUPPORTED_EXCHANGES=NSE,BSE
CURRENCY_FORMAT=INR
USE_INDIAN_NUMBERING=true

# Market hours (IST)
MARKET_OPEN_TIME=09:15
MARKET_CLOSE_TIME=15:30
MARKET_TIMEZONE=Asia/Kolkata
```

## 🚀 Performance Configuration

### Caching Strategy
```env
# Cache configuration
REDIS_URL=redis://localhost:6379  # Optional Redis cache
MEMORY_CACHE_SIZE=100             # In-memory cache size (MB)
CACHE_COMPRESSION=true
```

### Database Optimization
```javascript
// MongoDB connection options
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
};
```

### API Rate Limiting
```env
# Rate limiting per endpoint
GENERAL_RATE_LIMIT=100/15min
AI_ANALYSIS_RATE_LIMIT=10/1hour
STOCK_DATA_RATE_LIMIT=200/1hour
AUTH_RATE_LIMIT=5/1min
```

## 🔒 Security Configuration

### Security Headers
```env
# Security settings
ENABLE_CORS=true
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
ENABLE_HELMET=true
FORCE_HTTPS=true  # Production only
```

### Password Security
```env
# Password hashing
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
REQUIRE_STRONG_PASSWORDS=true
```

### Session Security
```env
# Session security
SESSION_COOKIE_SECURE=true      # HTTPS only
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=strict
```

## 🌍 Deployment Configuration

### Production Environment
```env
# Production-specific settings
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/stock-analysis

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ERROR_REPORTING_ENABLED=true
```

### Vercel Configuration
```json
// vercel.json
{
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret",
    "GEMINI_API_KEY": "@gemini-api-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

## 🧪 Development Configuration

### Development-Specific Settings
```env
# Development environment
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true
ENABLE_DEBUG_LOGGING=true
MOCK_EXTERNAL_APIS=false

# Hot reloading
FAST_REFRESH=true
TURBOPACK=true
```

### Testing Configuration
```env
# Test environment
NODE_ENV=test
TEST_MONGODB_URI=mongodb://localhost:27017/stock-analysis-test
DISABLE_RATE_LIMITING=true
USE_MOCK_DATA=true
```

## ✅ Configuration Validation

### Environment Validation Script
```bash
# Run configuration validation
npm run validate-config
```

### Required Variables Check
```javascript
// The application will validate these required variables on startup:
const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY'
];
```

## 🔧 Troubleshooting Configuration

### Common Configuration Issues
1. **MongoDB Connection**: Verify connection string format and network access
2. **OAuth Redirect**: Ensure redirect URIs match exactly
3. **API Keys**: Check for trailing spaces or invalid characters
4. **Environment Loading**: Verify `.env.local` file location and syntax

### Configuration Testing
```bash
# Test database connection
npm run test:db

# Test API integrations
npm run test:apis

# Test authentication
npm run test:auth
```

---

*Configuration complete! Proceed to the [Quick Start Guide](quick-start.md) to begin using the platform.*
