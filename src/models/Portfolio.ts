import mongoose, { Document, Schema } from 'mongoose';

export interface IHolding {
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

export interface IPortfolio extends Document {
  _id: string;
  investorId: mongoose.Types.ObjectId;
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

const HoldingSchema = new Schema<IHolding>({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  marketValue: {
    type: Number,
    required: true,
    min: 0,
  },
  gainLoss: {
    type: Number,
    required: true,
  },
  gainLossPercentage: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const PortfolioSchema = new Schema<IPortfolio>({
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  totalValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  totalGainLoss: {
    type: Number,
    required: true,
    default: 0,
  },
  totalGainLossPercentage: {
    type: Number,
    required: true,
    default: 0,
  },
  holdings: [HoldingSchema],
  cash: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastAnalyzed: {
    type: Date,
    default: null,
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  diversificationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  performanceMetrics: {
    dailyReturn: {
      type: Number,
      default: 0,
    },
    weeklyReturn: {
      type: Number,
      default: 0,
    },
    monthlyReturn: {
      type: Number,
      default: 0,
    },
    yearlyReturn: {
      type: Number,
      default: 0,
    },
    volatility: {
      type: Number,
      default: 0,
    },
    sharpeRatio: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
PortfolioSchema.index({ investorId: 1 });
PortfolioSchema.index({ investorId: 1, isActive: 1 });
PortfolioSchema.index({ 'holdings.symbol': 1 });

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
