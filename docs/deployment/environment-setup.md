# Environment Setup Guide

Comprehensive guide for setting up development, staging, and production environments for the Stock Analysis Platform.

## 🌍 Environment Overview

### Environment Types
- **Development**: Local development with hot reloading and debugging
- **Staging**: Pre-production testing environment
- **Production**: Live production environment on Vercel

### Environment Variables Structure
```env
# Core Application
NODE_ENV=development|staging|production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb+srv://...
DB_NAME=stock-analysis

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret

# External APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
EODHD_API_KEY=your-eodhd-api-key
```

## 🔧 Development Environment

### Local Development Setup

#### 1. Prerequisites
```bash
# Required software
node --version    # v18.0.0 or higher
npm --version     # v8.0.0 or higher
git --version     # Latest stable
```

#### 2. Environment File Setup
```bash
# Create development environment file
cp .env.example .env.local

# Edit with development-specific values
nano .env.local
```

#### 3. Development Environment Variables
```env
# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEV_MODE=true

# Database (Development)
MONGODB_URI=mongodb+srv://dev-user:password@dev-cluster.mongodb.net/stock-analysis-dev
DB_NAME=stock-analysis-dev

# Authentication (Development)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
JWT_SECRET=dev-jwt-secret-change-in-production

# Google OAuth (Development)
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret

# AI Integration (Development)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# Stock APIs (Development)
EODHD_API_KEY=your-eodhd-api-key
YAHOO_FINANCE_ENABLED=true

# Development Features
ENABLE_DEBUG_LOGGING=true
MOCK_EXTERNAL_APIS=false
DISABLE_RATE_LIMITING=true
```

#### 4. Development Database Setup
```bash
# MongoDB Atlas Development Cluster
# - Use M0 (Free) tier for development
# - Enable IP whitelist: 0.0.0.0/0 for development
# - Create development database user
```

#### 5. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Development Tools Configuration

#### VS Code Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### ESLint Configuration
```javascript
// eslint.config.mjs
export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];
```

## 🧪 Staging Environment

### Staging Setup on Vercel

#### 1. Create Staging Branch
```bash
git checkout -b staging
git push origin staging
```

#### 2. Vercel Staging Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel --prod=false
```

#### 3. Staging Environment Variables
```env
# Staging Configuration
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://stock-analysis-staging.vercel.app

# Database (Staging)
MONGODB_URI=mongodb+srv://staging-user:password@staging-cluster.mongodb.net/stock-analysis-staging
DB_NAME=stock-analysis-staging

# Authentication (Staging)
NEXTAUTH_URL=https://stock-analysis-staging.vercel.app
NEXTAUTH_SECRET=staging-secret-key-different-from-prod
JWT_SECRET=staging-jwt-secret-different-from-prod

# Google OAuth (Staging)
GOOGLE_CLIENT_ID=your-staging-google-client-id
GOOGLE_CLIENT_SECRET=your-staging-google-client-secret

# APIs (Staging)
GEMINI_API_KEY=your-gemini-api-key
EODHD_API_KEY=your-eodhd-api-key

# Staging Features
ENABLE_DEBUG_LOGGING=true
MOCK_EXTERNAL_APIS=false
RATE_LIMIT_ENABLED=true
```

#### 4. Staging Database Configuration
```bash
# MongoDB Atlas Staging Cluster
# - Use M2 or higher for staging
# - Restrict IP access to Vercel IPs
# - Create staging-specific database user
# - Enable backup and monitoring
```

## 🚀 Production Environment

### Production Deployment on Vercel

#### 1. Production Branch Setup
```bash
git checkout main
git merge staging
git push origin main
```

#### 2. Vercel Production Configuration
```json
// vercel.json
{
  "version": 2,
  "env": {
    "MONGODB_URI": "@mongodb-uri-prod",
    "NEXTAUTH_SECRET": "@nextauth-secret-prod",
    "NEXTAUTH_URL": "@nextauth-url-prod",
    "GOOGLE_CLIENT_ID": "@google-client-id-prod",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret-prod",
    "GEMINI_API_KEY": "@gemini-api-key-prod",
    "EODHD_API_KEY": "@eodhd-api-key-prod",
    "JWT_SECRET": "@jwt-secret-prod"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

#### 3. Production Environment Variables
```env
# Production Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://stock.greenhacker.tech

# Database (Production)
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/stock-analysis
DB_NAME=stock-analysis

# Authentication (Production)
NEXTAUTH_URL=https://stock.greenhacker.tech
NEXTAUTH_SECRET=super-secure-production-secret-key
JWT_SECRET=super-secure-production-jwt-secret

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# APIs (Production)
GEMINI_API_KEY=your-gemini-api-key
EODHD_API_KEY=your-eodhd-api-key

# Production Security
FORCE_HTTPS=true
ENABLE_CORS=true
CORS_ORIGIN=https://stock.greenhacker.tech
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true

# Production Performance
ENABLE_CACHING=true
CACHE_TTL=300000
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100

# Production Monitoring
ENABLE_ANALYTICS=true
ERROR_REPORTING_ENABLED=true
LOG_LEVEL=info
```

#### 4. Production Database Configuration
```bash
# MongoDB Atlas Production Cluster
# - Use M10 or higher for production
# - Enable encryption at rest
# - Configure backup retention (7+ days)
# - Set up monitoring and alerts
# - Restrict IP access to production IPs only
# - Use strong authentication
```

## 🔐 Security Configuration

### Environment Security Best Practices

#### 1. Secret Management
```bash
# Use Vercel Environment Variables for secrets
vercel env add NEXTAUTH_SECRET production
vercel env add JWT_SECRET production
vercel env add MONGODB_URI production
```

#### 2. API Key Rotation
```bash
# Regular rotation schedule
# - Google OAuth: Every 90 days
# - JWT Secrets: Every 30 days
# - Database passwords: Every 60 days
# - API keys: Every 90 days
```

#### 3. Access Control
```env
# Production access restrictions
ALLOWED_ORIGINS=https://stock.greenhacker.tech
IP_WHITELIST=production-server-ips
ADMIN_EMAILS=admin@yourdomain.com
```

## 🔍 Environment Validation

### Validation Scripts

#### 1. Environment Checker
```typescript
// scripts/check-env.ts
const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY'
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

validateEnvironment();
```

#### 2. Database Connection Test
```typescript
// scripts/test-db.ts
import { connectDB } from '@/lib/mongodb';

async function testDatabaseConnection() {
  try {
    await connectDB();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
```

#### 3. API Integration Test
```typescript
// scripts/test-apis.ts
async function testExternalAPIs() {
  const tests = [
    { name: 'Google OAuth', url: 'https://accounts.google.com/.well-known/openid_configuration' },
    { name: 'EODHD API', url: `https://eodhd.com/api/real-time/AAPL.US?api_token=${process.env.EODHD_API_KEY}` }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      if (response.ok) {
        console.log(`✅ ${test.name} connection successful`);
      } else {
        console.error(`❌ ${test.name} connection failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} connection error:`, error);
    }
  }
}

testExternalAPIs();
```

## 📊 Environment Monitoring

### Health Checks

#### 1. Application Health Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'connected',
    apis: {
      gemini: 'available',
      eodhd: 'available'
    }
  };

  return Response.json(health);
}
```

#### 2. Monitoring Setup
```bash
# Vercel Analytics
# - Enable Web Analytics
# - Set up custom events
# - Configure error tracking

# External Monitoring (Optional)
# - Uptime monitoring (UptimeRobot, Pingdom)
# - Performance monitoring (New Relic, DataDog)
# - Error tracking (Sentry)
```

## 🚀 Deployment Automation

### CI/CD Pipeline

#### 1. GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

#### 2. Deployment Commands
```bash
# Manual deployment commands
npm run build          # Build for production
npm run start         # Start production server locally
npm run deploy        # Deploy to Vercel
npm run deploy:staging # Deploy to staging
```

---

This environment setup guide ensures consistent, secure, and scalable deployment across all environments while maintaining proper separation of concerns and security best practices.
