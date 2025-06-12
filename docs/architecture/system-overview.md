# System Architecture Overview

This document provides a comprehensive overview of the Stock Analysis Platform's system architecture, design principles, and technical implementation.

## 🏗️ High-Level Architecture

### System Components

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end
    
    subgraph "Application Layer"
        NEXTJS[Next.js 15 App Router]
        API[API Routes]
        AUTH[NextAuth.js]
        MIDDLEWARE[Middleware]
    end
    
    subgraph "Service Layer"
        AI[AI Service<br/>Google Gemini]
        STOCK[Stock Data Service]
        PORTFOLIO[Portfolio Service]
        ANALYSIS[Analysis Service]
    end
    
    subgraph "Data Layer"
        MONGODB[(MongoDB Atlas)]
        CACHE[In-Memory Cache]
    end
    
    subgraph "External APIs"
        EODHD[EODHD API<br/>Indian Stocks]
        YAHOO[Yahoo Finance<br/>Fallback]
        GOOGLE[Google OAuth]
        GEMINI[Google Gemini AI]
    end
    
    WEB --> NEXTJS
    MOBILE --> NEXTJS
    NEXTJS --> API
    API --> AUTH
    API --> MIDDLEWARE
    API --> AI
    API --> STOCK
    API --> PORTFOLIO
    API --> ANALYSIS
    
    AI --> GEMINI
    STOCK --> EODHD
    STOCK --> YAHOO
    AUTH --> GOOGLE
    
    PORTFOLIO --> MONGODB
    ANALYSIS --> MONGODB
    API --> CACHE
```

## 🔧 Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **3D Graphics**: Three.js with React Three Fiber
- **Charts**: D3.js, Chart.js, React-Chartjs-2
- **Animations**: Framer Motion
- **State Management**: React Hooks and Context API

### Backend Technologies
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js with JWT
- **AI Integration**: Google Gemini 2.0 Flash
- **Stock Data**: EODHD API, Yahoo Finance API

### Infrastructure
- **Hosting**: Vercel (Serverless)
- **Database**: MongoDB Atlas (Cloud)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in Vercel Analytics

## 📊 Data Architecture

### Database Schema Design

```mermaid
erDiagram
    User ||--o{ Portfolio : owns
    User ||--o{ AnalysisReport : creates
    User ||--o{ UserAnalyst : participates
    Portfolio ||--o{ AnalysisReport : analyzed
    Portfolio {
        ObjectId _id
        ObjectId investorId
        string name
        array holdings
        number totalValue
        object performanceMetrics
        date createdAt
    }
    User {
        ObjectId _id
        string email
        string name
        string role
        object preferences
        date createdAt
    }
    AnalysisReport {
        ObjectId _id
        ObjectId portfolioId
        ObjectId analystId
        string aiAnalysis
        array recommendations
        object riskAssessment
        date createdAt
    }
    UserAnalyst {
        ObjectId _id
        ObjectId analystId
        ObjectId investorId
        string status
        object permissions
    }
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant NextJS
    participant API
    participant AI
    participant StockAPI
    participant Database
    
    Client->>NextJS: Request Portfolio Analysis
    NextJS->>API: /api/analysis/generate
    API->>Database: Fetch Portfolio Data
    Database-->>API: Portfolio Holdings
    API->>StockAPI: Get Current Prices
    StockAPI-->>API: Stock Data
    API->>AI: Generate Analysis
    AI-->>API: AI Recommendations
    API->>Database: Save Analysis Report
    Database-->>API: Report Saved
    API-->>NextJS: Analysis Result
    NextJS-->>Client: Rendered Analysis
```

## 🔐 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant NextAuth
    participant Google
    participant Database
    
    User->>NextJS: Login Request
    NextJS->>NextAuth: Authenticate
    NextAuth->>Google: OAuth Flow
    Google-->>NextAuth: User Info
    NextAuth->>Database: Store/Update User
    Database-->>NextAuth: User Data
    NextAuth-->>NextJS: JWT Token
    NextJS-->>User: Authenticated Session
```

### Security Layers
1. **Transport Security**: HTTPS/TLS encryption
2. **Authentication**: NextAuth.js with OAuth and credentials
3. **Authorization**: Role-based access control (RBAC)
4. **Input Validation**: Zod schema validation
5. **Rate Limiting**: API endpoint protection
6. **Data Encryption**: MongoDB Atlas encryption at rest

## 🚀 Performance Architecture

### Caching Strategy

```mermaid
graph LR
    subgraph "Cache Layers"
        L1[Browser Cache]
        L2[CDN Cache]
        L3[Application Cache]
        L4[Database Cache]
    end
    
    CLIENT[Client Request] --> L1
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> DB[(Database)]
```

### Performance Optimizations
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Static Generation**: Pre-rendered pages where possible
- **API Caching**: 5-minute TTL for stock data
- **Database Indexing**: Optimized queries
- **Connection Pooling**: MongoDB connection management

## 🔄 API Architecture

### RESTful API Design

```
/api/
├── auth/                 # Authentication endpoints
│   ├── signin
│   ├── signout
│   └── session
├── portfolios/           # Portfolio management
│   ├── GET /             # List portfolios
│   ├── POST /            # Create portfolio
│   ├── GET /:id          # Get portfolio
│   ├── PUT /:id          # Update portfolio
│   └── DELETE /:id       # Delete portfolio
├── stocks/               # Stock data endpoints
│   ├── indian            # Indian stock data
│   ├── quote             # Stock quotes
│   ├── search            # Stock search
│   ├── historical/:symbol # Historical data
│   └── technical/:symbol  # Technical indicators
├── analysis/             # AI analysis endpoints
│   └── generate          # Generate analysis
├── reports/              # Report management
│   ├── GET /             # List reports
│   ├── GET /:id          # Get report
│   └── POST /            # Create report
└── dashboard/            # Dashboard data
    └── stats             # Dashboard statistics
```

### API Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    "total": 100,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "source": "EODHD API",
    "processingTime": 150
  }
}
```

## 🤖 AI Integration Architecture

### AI Service Design

```mermaid
graph TB
    subgraph "AI Analysis Pipeline"
        INPUT[Portfolio Data]
        CONTEXT[Context Builder]
        PROMPT[Prompt Generator]
        AI[Gemini AI]
        PARSER[Response Parser]
        VALIDATOR[Data Validator]
        OUTPUT[Structured Analysis]
    end
    
    INPUT --> CONTEXT
    CONTEXT --> PROMPT
    PROMPT --> AI
    AI --> PARSER
    PARSER --> VALIDATOR
    VALIDATOR --> OUTPUT
```

### AI Analysis Components
1. **Context Builder**: Aggregates portfolio, market, and user data
2. **Prompt Generator**: Creates structured AI prompts
3. **AI Service**: Interfaces with Google Gemini API
4. **Response Parser**: Extracts structured data from AI responses
5. **Validator**: Ensures data quality and completeness

## 📱 Frontend Architecture

### Component Architecture

```
src/components/
├── layout/               # Layout components
│   ├── Navbar
│   ├── Sidebar
│   └── Footer
├── dashboard/            # Dashboard components
│   ├── PortfolioSummary
│   ├── StockList
│   └── PerformanceCharts
├── portfolio/            # Portfolio components
│   ├── PortfolioCard
│   ├── HoldingsList
│   └── AddHolding
├── analysis/             # Analysis components
│   ├── AIAnalysis
│   ├── RecommendationCard
│   └── RiskAssessment
├── charts/               # Chart components
│   ├── 3DPortfolioChart
│   ├── CandlestickChart
│   └── PerformanceChart
└── ui/                   # Reusable UI components
    ├── Button
    ├── Modal
    └── LoadingSpinner
```

### State Management
- **Global State**: React Context for user session and theme
- **Local State**: React Hooks for component-specific state
- **Server State**: SWR for API data fetching and caching
- **Form State**: React Hook Form for form management

## 🔄 Deployment Architecture

### Serverless Deployment

```mermaid
graph TB
    subgraph "Vercel Platform"
        EDGE[Edge Functions]
        SERVERLESS[Serverless Functions]
        STATIC[Static Assets]
        CDN[Global CDN]
    end
    
    subgraph "External Services"
        MONGODB[(MongoDB Atlas)]
        APIS[External APIs]
    end
    
    USER[Users] --> CDN
    CDN --> STATIC
    CDN --> EDGE
    EDGE --> SERVERLESS
    SERVERLESS --> MONGODB
    SERVERLESS --> APIS
```

### Deployment Benefits
- **Auto-scaling**: Automatic scaling based on demand
- **Global Distribution**: Edge locations worldwide
- **Zero Configuration**: No server management required
- **Instant Deployments**: Git-based deployment workflow

## 📊 Monitoring and Observability

### Monitoring Stack
- **Application Monitoring**: Vercel Analytics
- **Error Tracking**: Built-in error boundaries
- **Performance Monitoring**: Web Vitals tracking
- **API Monitoring**: Response time and error rate tracking

### Logging Strategy
- **Structured Logging**: JSON-formatted logs
- **Log Levels**: Error, Warn, Info, Debug
- **Request Logging**: API request/response logging
- **Error Logging**: Comprehensive error tracking

## 🔧 Development Architecture

### Development Workflow
1. **Local Development**: Next.js dev server with hot reloading
2. **Code Quality**: ESLint, Prettier, TypeScript
3. **Testing**: Jest, React Testing Library
4. **Version Control**: Git with feature branch workflow
5. **CI/CD**: Vercel automatic deployments

### Code Organization
- **Feature-based Structure**: Organized by business features
- **Separation of Concerns**: Clear separation between layers
- **Reusable Components**: Modular and composable components
- **Type Safety**: Comprehensive TypeScript coverage

---

This architecture provides a scalable, maintainable, and secure foundation for the Stock Analysis Platform, supporting both current requirements and future growth.
