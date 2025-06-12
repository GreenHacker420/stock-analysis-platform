# API Documentation - Stock Analysis Platform

## Overview

This document provides comprehensive API documentation for the Stock Analysis Platform. The platform provides RESTful APIs for authentication, portfolio management, stock data, and AI-powered analysis.

**Base URL**: `https://stock.greenhacker.tech/api`
**Authentication**: NextAuth.js with JWT tokens
**Content Type**: `application/json`

## Authentication Endpoints

### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "investor|analyst"
  },
  "token": "jwt_token"
}
```

### Get Session
```http
GET /api/auth/session
Authorization: Bearer <token>
```

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "investor|analyst",
    "isActive": true
  }
}
```

### Sign Out
```http
POST /api/auth/signout
Authorization: Bearer <token>
```

## Portfolio Management APIs

### List Portfolios
```http
GET /api/portfolios
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (optional): Number of portfolios to return (default: 50)
- `skip` (optional): Number of portfolios to skip (default: 0)

**Response**:
```json
{
  "success": true,
  "portfolios": [
    {
      "_id": "portfolio_id",
      "name": "My Portfolio",
      "totalValue": 150000,
      "totalCost": 120000,
      "totalGainLoss": 30000,
      "totalGainLossPercentage": 25.0,
      "holdings": [
        {
          "symbol": "RELIANCE.NSE",
          "companyName": "Reliance Industries",
          "shares": 100,
          "averageCost": 2500,
          "currentPrice": 2750,
          "marketValue": 275000,
          "gainLoss": 25000,
          "gainLossPercentage": 10.0
        }
      ],
      "performanceMetrics": {
        "dailyReturn": 1.5,
        "weeklyReturn": 3.2,
        "monthlyReturn": 8.7,
        "yearlyReturn": 25.0,
        "volatility": 15.2,
        "sharpeRatio": 1.8
      }
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

### Create Portfolio
```http
POST /api/portfolios
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Portfolio",
  "description": "Portfolio description",
  "cash": 50000
}
```

### Get Portfolio Details
```http
GET /api/portfolios/{portfolioId}
Authorization: Bearer <token>
```

### Update Portfolio
```http
PUT /api/portfolios/{portfolioId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Portfolio Name",
  "description": "Updated description"
}
```

### Delete Portfolio
```http
DELETE /api/portfolios/{portfolioId}
Authorization: Bearer <token>
```

## Stock Data APIs

### Get Indian Stocks
```http
GET /api/stocks/indian
```

**Query Parameters**:
- `limit` (optional): Number of stocks to return (default: 30)
- `exchange` (optional): Filter by exchange (NSE|BSE|all, default: all)

**Response**:
```json
{
  "success": true,
  "stocks": [
    {
      "symbol": "RELIANCE.NSE",
      "name": "Reliance Industries Limited",
      "exchange": "NSE",
      "price": 2750.50,
      "change": 25.30,
      "changePercent": 0.93,
      "volume": 1250000,
      "marketCap": 1850000000000,
      "peRatio": 28.5,
      "high52Week": 3000.00,
      "low52Week": 2200.00,
      "dayHigh": 2780.00,
      "dayLow": 2720.00,
      "previousClose": 2725.20,
      "sector": "Energy",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 30,
  "source": "EODHD API with fallback",
  "realDataCount": 25,
  "mockDataCount": 5,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Get Stock Quote
```http
GET /api/stocks/quote?symbol=RELIANCE.NSE
```

**Response**:
```json
{
  "success": true,
  "quote": {
    "symbol": "RELIANCE.NSE",
    "companyName": "Reliance Industries Limited",
    "price": 2750.50,
    "change": 25.30,
    "changePercent": 0.93,
    "volume": 1250000,
    "marketCap": 1850000000000,
    "peRatio": 28.5,
    "dividendYield": 0.35,
    "high52Week": 3000.00,
    "low52Week": 2200.00,
    "averageVolume": 1500000,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Search Stocks
```http
GET /api/stocks/search?q=reliance
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "symbol": "RELIANCE.NSE",
      "name": "Reliance Industries Limited"
    },
    {
      "symbol": "RPOWER.NSE",
      "name": "Reliance Power Limited"
    }
  ]
}
```

### Get Historical Data
```http
GET /api/stocks/historical/{symbol}?period=1y
```

**Query Parameters**:
- `period`: Time period (1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15T00:00:00Z",
      "open": 2720.00,
      "high": 2780.00,
      "low": 2710.00,
      "close": 2750.50,
      "volume": 1250000,
      "adjClose": 2750.50
    }
  ]
}
```

### Get Technical Indicators
```http
GET /api/stocks/technical/{symbol}
```

**Response**:
```json
{
  "success": true,
  "indicators": {
    "symbol": "RELIANCE.NSE",
    "rsi": 65.5,
    "macd": {
      "macd": 15.2,
      "signal": 12.8,
      "histogram": 2.4
    },
    "sma20": 2680.50,
    "sma50": 2620.30,
    "sma200": 2580.75,
    "ema12": 2720.80,
    "ema26": 2650.40,
    "volume": 1250000,
    "averageVolume": 1500000,
    "priceChange24h": 25.30,
    "priceChangePercent24h": 0.93,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## Analysis & Reports APIs

### Generate AI Analysis
```http
POST /api/analysis/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "portfolioId": "portfolio_id",
  "analysisType": "comprehensive"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "summary": "Portfolio analysis summary...",
    "detailedAnalysis": "Detailed analysis content...",
    "recommendations": [
      {
        "symbol": "RELIANCE.NSE",
        "companyName": "Reliance Industries",
        "action": "hold",
        "confidence": 85,
        "targetPrice": 2900,
        "currentPrice": 2750,
        "reasoning": "Strong fundamentals with growth potential...",
        "riskLevel": "medium",
        "timeHorizon": "long",
        "allocationPercentage": 15
      }
    ],
    "riskAssessment": {
      "overallRisk": "medium",
      "diversificationRisk": 25,
      "concentrationRisk": 30,
      "marketRisk": 40,
      "recommendations": ["Diversify across sectors", "Reduce concentration"]
    },
    "marketConditions": {
      "overall": "bullish",
      "volatility": "medium",
      "trend": "upward",
      "sentiment": "Positive market sentiment with growth opportunities"
    },
    "performanceAnalysis": {
      "returnAnalysis": "Portfolio showing strong performance...",
      "benchmarkComparison": "Outperforming Nifty 50 by 5%...",
      "riskAdjustedReturns": "Excellent risk-adjusted returns..."
    }
  },
  "processingTime": 3200,
  "reportId": "report_id"
}
```

### List Reports
```http
GET /api/reports
Authorization: Bearer <token>
```

**Query Parameters**:
- `portfolioId` (optional): Filter by portfolio ID
- `status` (optional): Filter by status (draft|completed|archived)
- `limit` (optional): Number of reports to return (default: 50)
- `skip` (optional): Number of reports to skip (default: 0)

**Response**:
```json
{
  "success": true,
  "reports": [
    {
      "_id": "report_id",
      "title": "Portfolio Analysis Report",
      "summary": "Comprehensive analysis summary...",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z",
      "validUntil": "2024-01-22T10:30:00Z",
      "portfolioId": {
        "_id": "portfolio_id",
        "name": "My Portfolio"
      },
      "analystId": {
        "_id": "analyst_id",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@stockanalyzer.com"
      },
      "metadata": {
        "aiModel": "gemini-2.0-flash",
        "processingTime": 3200,
        "confidence": 85
      }
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

### Get Report Details
```http
GET /api/reports/{reportId}
Authorization: Bearer <token>
```

## Dashboard & Statistics APIs

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalPortfolios": 5,
    "totalValue": 750000,
    "totalGainLoss": 125000,
    "totalGainLossPercentage": 20.0,
    "topPerformers": [
      {
        "symbol": "RELIANCE.NSE",
        "gainLossPercentage": 25.0
      }
    ],
    "recentReports": 3,
    "marketSummary": {
      "nifty50": {
        "value": 21500,
        "change": 150,
        "changePercent": 0.7
      }
    }
  }
}
```

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "preferences": {
    "riskTolerance": "high",
    "investmentGoals": ["growth", "income"],
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

- **General APIs**: 100 requests per 15 minutes per IP
- **AI Analysis**: 10 requests per hour per user
- **Stock Data**: 200 requests per hour per user

## Demo Credentials

For testing purposes, use these demo credentials:

**Analyst Account**:
- Email: `sarah.johnson@stockanalyzer.com`
- Password: `analyst123!`

**Investor Account**:
- Email: `john.doe@email.com`
- Password: `investor123!`
