# Database Schema Documentation

## Overview

The Stock Analysis Platform uses MongoDB as its primary database with Mongoose ODM for schema definition and validation. The database follows a document-based approach with proper indexing for optimal performance.

**Database**: MongoDB Atlas
**ODM**: Mongoose
**Connection**: Connection pooling with automatic reconnection

## Collections Overview

### 1. Users Collection

Stores user authentication and profile information with role-based access control.

```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  name: string;
  image?: string;
  role: 'analyst' | 'investor';
  googleId?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
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
}
```

**Schema Definition**:
```javascript
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['analyst', 'investor'],
    required: true,
    default: 'investor'
  },
  googleId: {
    type: String,
    default: null,
    sparse: true,
    unique: true
  },
  password: {
    type: String,
    default: null,
    select: false // Excluded from queries by default
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    investmentGoals: [{
      type: String
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  }
}, { timestamps: true });
```

**Indexes**:
```javascript
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
```

### 2. Portfolios Collection

Stores portfolio information including holdings and performance metrics.

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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzed?: Date;
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
}

interface IHolding {
  symbol: string;
  companyName: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  lastUpdated: Date;
}
```

**Schema Definition**:
```javascript
const HoldingSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  shares: {
    type: Number,
    required: true,
    min: 0
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  marketValue: {
    type: Number,
    required: true,
    min: 0
  },
  gainLoss: {
    type: Number,
    required: true
  },
  gainLossPercentage: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const PortfolioSchema = new Schema({
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  totalValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalGainLoss: {
    type: Number,
    required: true,
    default: 0
  },
  totalGainLossPercentage: {
    type: Number,
    required: true,
    default: 0
  },
  holdings: [HoldingSchema],
  cash: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastAnalyzed: {
    type: Date,
    default: null
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  diversificationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  performanceMetrics: {
    dailyReturn: { type: Number, default: 0 },
    weeklyReturn: { type: Number, default: 0 },
    monthlyReturn: { type: Number, default: 0 },
    yearlyReturn: { type: Number, default: 0 },
    volatility: { type: Number, default: 0 },
    sharpeRatio: { type: Number, default: 0 }
  }
}, { timestamps: true });
```

**Indexes**:
```javascript
PortfolioSchema.index({ investorId: 1 });
PortfolioSchema.index({ investorId: 1, isActive: 1 });
PortfolioSchema.index({ 'holdings.symbol': 1 });
PortfolioSchema.index({ lastAnalyzed: 1 });
```

### 3. Analysis Reports Collection

Stores AI-generated analysis reports with comprehensive metadata.

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
  isActive: boolean;
  metadata: {
    aiModel: string;
    processingTime: number;
    confidence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Definition**:
```javascript
const AnalysisReportSchema = new Schema({
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  analystId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  aiAnalysis: {
    type: String,
    required: true
  },
  recommendations: [{
    symbol: String,
    companyName: String,
    action: {
      type: String,
      enum: ['buy', 'sell', 'hold']
    },
    confidence: Number,
    targetPrice: Number,
    currentPrice: Number,
    reasoning: String,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    timeHorizon: {
      type: String,
      enum: ['short', 'medium', 'long']
    }
  }],
  marketConditions: {
    overall: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral']
    },
    volatility: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    trend: {
      type: String,
      enum: ['upward', 'downward', 'sideways']
    },
    sentiment: String
  },
  riskAssessment: {
    overallRisk: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    diversificationRisk: Number,
    concentrationRisk: Number,
    marketRisk: Number,
    recommendations: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'draft'
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    aiModel: String,
    processingTime: Number,
    confidence: Number
  }
}, { timestamps: true });
```

**Indexes**:
```javascript
AnalysisReportSchema.index({ portfolioId: 1 });
AnalysisReportSchema.index({ analystId: 1 });
AnalysisReportSchema.index({ investorId: 1 });
AnalysisReportSchema.index({ status: 1 });
AnalysisReportSchema.index({ createdAt: -1 });
AnalysisReportSchema.index({ validUntil: 1 });
AnalysisReportSchema.index({ isActive: 1 });
```

### 4. User-Analyst Relationships Collection

Manages many-to-many relationships between analysts and investors.

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

**Schema Definition**:
```javascript
const UserAnalystSchema = new Schema({
  analystId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    canViewPortfolio: {
      type: Boolean,
      default: true
    },
    canGenerateReports: {
      type: Boolean,
      default: true
    },
    canModifyPortfolio: {
      type: Boolean,
      default: false
    },
    canCommunicate: {
      type: Boolean,
      default: true
    }
  },
  communicationPreferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'on-demand'],
      default: 'weekly'
    },
    methods: [{
      type: String,
      enum: ['email', 'platform', 'phone']
    }]
  }
}, { timestamps: true });
```

**Indexes**:
```javascript
UserAnalystSchema.index({ analystId: 1, investorId: 1 }, { unique: true });
UserAnalystSchema.index({ analystId: 1, status: 1 });
UserAnalystSchema.index({ investorId: 1, status: 1 });
```

## Database Operations

### Connection Management

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
```

### Data Seeding

The platform includes automatic data seeding for demo purposes:

```typescript
// Demo users with hashed passwords
const demoUsers = [
  {
    email: 'sarah.johnson@stockanalyzer.com',
    name: 'Sarah Johnson',
    password: await bcrypt.hash('analyst123!', 12),
    role: 'analyst'
  },
  {
    email: 'john.doe@email.com',
    name: 'John Doe',
    password: await bcrypt.hash('investor123!', 12),
    role: 'investor'
  }
];

// Create relationships
await UserAnalyst.create({
  analystId: analyst._id,
  investorId: investor._id,
  status: 'active',
  assignedBy: analyst._id
});
```

## Performance Considerations

### Query Optimization

1. **Use Proper Indexes**: All frequently queried fields have appropriate indexes
2. **Limit Field Selection**: Use `.select()` to limit returned fields
3. **Pagination**: Implement proper pagination for large datasets
4. **Aggregation Pipelines**: Use for complex queries and calculations

### Connection Pooling

- **Max Pool Size**: 10 connections
- **Server Selection Timeout**: 5 seconds
- **Socket Timeout**: 45 seconds
- **Buffer Commands**: Disabled for better error handling

### Data Validation

- **Schema Validation**: Mongoose schema validation
- **Input Sanitization**: Trim and lowercase where appropriate
- **Type Safety**: TypeScript interfaces for compile-time checking
- **Business Logic Validation**: Custom validators for complex rules

## Backup and Recovery

### Automated Backups

- **MongoDB Atlas**: Automatic daily backups with point-in-time recovery
- **Retention**: 7-day backup retention
- **Cross-Region**: Backups stored in multiple regions

### Data Migration

- **Schema Versioning**: Proper versioning for schema changes
- **Migration Scripts**: Automated migration for data structure changes
- **Rollback Strategy**: Ability to rollback schema changes if needed

## Security Measures

### Data Protection

- **Encryption at Rest**: MongoDB Atlas encryption
- **Encryption in Transit**: TLS/SSL for all connections
- **Field-Level Encryption**: Sensitive fields encrypted
- **Access Control**: Role-based database access

### Authentication

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic session expiration
- **OAuth Integration**: Secure Google OAuth implementation
