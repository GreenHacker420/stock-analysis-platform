import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation {
  symbol: string;
  companyName: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  targetPrice: number;
  currentPrice: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  allocationPercentage?: number;
}

export interface ITechnicalIndicators {
  symbol: string;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  volume: number;
  averageVolume: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

export interface IAnalysisReport extends Document {
  _id: string;
  portfolioId: mongoose.Types.ObjectId;
  analystId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
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
  performanceAnalysis: {
    returnAnalysis: string;
    benchmarkComparison: string;
    riskAdjustedReturns: string;
  };
  status: 'draft' | 'completed' | 'archived';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  validUntil: Date;
  tags: string[];
  metadata: {
    aiModel: string;
    processingTime: number;
    dataSourcesUsed: string[];
    confidence: number;
  };
}

const RecommendationSchema = new Schema<IRecommendation>({
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
  action: {
    type: String,
    enum: ['buy', 'sell', 'hold'],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  targetPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  reasoning: {
    type: String,
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  timeHorizon: {
    type: String,
    enum: ['short', 'medium', 'long'],
    required: true,
  },
  allocationPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
});

const TechnicalIndicatorsSchema = new Schema<ITechnicalIndicators>({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  rsi: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  macd: {
    macd: { type: Number, required: true },
    signal: { type: Number, required: true },
    histogram: { type: Number, required: true },
  },
  sma20: { type: Number, required: true },
  sma50: { type: Number, required: true },
  sma200: { type: Number, required: true },
  ema12: { type: Number, required: true },
  ema26: { type: Number, required: true },
  volume: { type: Number, required: true },
  averageVolume: { type: Number, required: true },
  priceChange24h: { type: Number, required: true },
  priceChangePercentage24h: { type: Number, required: true },
});

const AnalysisReportSchema = new Schema<IAnalysisReport>({
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  analystId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    required: true,
  },
  aiAnalysis: {
    type: String,
    required: true,
  },
  recommendations: [RecommendationSchema],
  technicalIndicators: [TechnicalIndicatorsSchema],
  marketConditions: {
    overall: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral'],
      required: true,
    },
    volatility: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    trend: {
      type: String,
      enum: ['upward', 'downward', 'sideways'],
      required: true,
    },
    sentiment: {
      type: String,
      required: true,
    },
  },
  riskAssessment: {
    overallRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    diversificationRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    concentrationRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    marketRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    recommendations: [String],
  },
  performanceAnalysis: {
    returnAnalysis: { type: String, required: true },
    benchmarkComparison: { type: String, required: true },
    riskAdjustedReturns: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  tags: [String],
  metadata: {
    aiModel: { type: String, required: true },
    processingTime: { type: Number, required: true },
    dataSourcesUsed: [String],
    confidence: { type: Number, min: 0, max: 100 },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
AnalysisReportSchema.index({ portfolioId: 1 });
AnalysisReportSchema.index({ analystId: 1 });
AnalysisReportSchema.index({ investorId: 1 });
AnalysisReportSchema.index({ status: 1 });
AnalysisReportSchema.index({ createdAt: -1 });
AnalysisReportSchema.index({ validUntil: 1 });

export default mongoose.models.AnalysisReport || mongoose.model<IAnalysisReport>('AnalysisReport', AnalysisReportSchema);
