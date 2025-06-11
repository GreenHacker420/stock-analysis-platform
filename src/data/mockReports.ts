// Mock analysis report interfaces that don't conflict with database schema
export interface MockRecommendation {
  type: 'buy' | 'sell' | 'hold' | 'reduce';
  symbol: string;
  companyName: string;
  targetPrice: number;
  currentPrice: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
}

export interface MockRiskAssessment {
  overallRisk: string;
  riskScore: number;
  factors: string[];
  mitigation: string[];
}

export interface MockPerformanceMetrics {
  totalReturn: number;
  benchmarkReturn: number;
  alpha: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

export interface MockAnalysisReport {
  id: string;
  analystId: string;
  investorId: string;
  portfolioId?: string;
  title: string;
  summary: string;
  content: string;
  recommendations: MockRecommendation[];
  riskAssessment: MockRiskAssessment;
  performanceMetrics: MockPerformanceMetrics;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockAnalysisReports: MockAnalysisReport[] = [
  {
    id: 'report_001',
    analystId: 'analyst_001',
    investorId: 'investor_001',
    portfolioId: 'portfolio_001',
    title: 'Q4 2023 Portfolio Performance Review',
    summary: 'Strong performance driven by technology sector growth and strategic rebalancing towards financial services.',
    content: `
# Q4 2023 Portfolio Performance Review

## Executive Summary
Your Growth Portfolio has demonstrated exceptional performance in Q4 2023, achieving a 13.64% total return against the NIFTY 50's 8.2% gain during the same period. The portfolio's strategic allocation to technology and financial services has proven successful.

## Key Highlights
- **Total Portfolio Value**: ₹25.00 L (up from ₹22.00 L)
- **Absolute Gain**: ₹3.00 L
- **Return**: 13.64% vs NIFTY 50: 8.2%
- **Risk Score**: 65 (Moderate-High)

## Sector Performance Analysis

### Technology Sector (40% allocation)
- **TCS**: +1.12% - Solid performance backed by strong Q3 results
- **Infosys**: +2.60% - Benefited from digital transformation deals

### Financial Services (35% allocation)
- **HDFC Bank**: +2.26% - Consistent growth in retail banking
- **Reliance**: +2.36% - Strong refining margins and retail expansion

## Risk Assessment
The portfolio maintains a balanced risk profile with:
- **Sector Diversification**: Well-distributed across IT and Financial Services
- **Market Cap Distribution**: 80% Large Cap, 20% Mid Cap
- **Volatility**: 15.2% (vs market 18.5%)

## Recommendations
1. **Rebalancing**: Consider reducing IT exposure from 40% to 35%
2. **Defensive Addition**: Add FMCG stocks for stability (5-10% allocation)
3. **Cash Management**: Current 6% cash position is optimal

## Market Outlook
- **Q1 2024 Expectations**: Continued growth in IT services
- **Risk Factors**: Global economic uncertainty, inflation concerns
- **Opportunities**: Infrastructure and renewable energy sectors

## Action Items
- [ ] Review and rebalance sector allocation
- [ ] Monitor global IT spending trends
- [ ] Consider ESG-focused additions
    `,
    recommendations: [
      {
        type: 'buy',
        symbol: 'NESTLEIND',
        companyName: 'Nestle India Limited',
        targetPrice: 2450.00,
        currentPrice: 2380.00,
        reasoning: 'Strong FMCG fundamentals and defensive characteristics',
        priority: 'medium',
        timeframe: '3-6 months',
      },
      {
        type: 'reduce',
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        targetPrice: 1400.00,
        currentPrice: 1456.90,
        reasoning: 'Take profits and reduce IT sector concentration',
        priority: 'low',
        timeframe: '1-3 months',
      },
    ],
    riskAssessment: {
      overallRisk: 'medium-high',
      riskScore: 65,
      factors: [
        'High concentration in IT sector',
        'Exposure to global economic cycles',
        'Currency fluctuation risk',
      ],
      mitigation: [
        'Diversify into defensive sectors',
        'Maintain adequate cash reserves',
        'Regular portfolio rebalancing',
      ],
    },
    performanceMetrics: {
      totalReturn: 13.64,
      benchmarkReturn: 8.20,
      alpha: 5.44,
      beta: 1.15,
      sharpeRatio: 0.85,
      maxDrawdown: -8.5,
      volatility: 15.2,
    },
    status: 'published',
    tags: ['quarterly-review', 'growth-portfolio', 'technology', 'financial-services'],
    isShared: true,
    createdAt: new Date('2024-01-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-10T10:00:00Z').toISOString(),
  },

  {
    id: 'report_002',
    analystId: 'analyst_002',
    investorId: 'investor_002',
    portfolioId: 'portfolio_002',
    title: 'Conservative Income Portfolio - Dividend Analysis',
    summary: 'Stable dividend income with modest capital appreciation. Portfolio well-positioned for income generation.',
    content: `
# Conservative Income Portfolio - Dividend Analysis

## Portfolio Overview
Your Conservative Income Portfolio continues to deliver steady dividend income while maintaining capital stability. The portfolio's focus on dividend-paying blue-chip stocks has provided consistent returns.

## Dividend Performance
- **Annual Dividend Yield**: 4.2%
- **Quarterly Dividend Income**: ₹18,500
- **Dividend Growth Rate**: 8.5% YoY

## Holdings Analysis

### HDFC Bank (18.7% allocation)
- **Dividend Yield**: 1.25%
- **Payout Ratio**: 20%
- **Growth Prospects**: Strong retail banking franchise

### ITC Limited (12.7% allocation)
- **Dividend Yield**: 4.25%
- **Payout Ratio**: 85%
- **Stability**: Consistent dividend history

### State Bank of India (10.4% allocation)
- **Dividend Yield**: 1.95%
- **Government Backing**: Strong institutional support

## Risk Factors
- Interest rate sensitivity
- Regulatory changes in banking sector
- Tobacco regulation impact on ITC

## Recommendations
1. Maintain current allocation
2. Consider adding utility stocks
3. Monitor interest rate environment
    `,
    recommendations: [
      {
        type: 'buy',
        symbol: 'POWERGRID',
        companyName: 'Power Grid Corporation of India Limited',
        targetPrice: 285.00,
        currentPrice: 275.00,
        reasoning: 'Stable utility with consistent dividend payments',
        priority: 'medium',
        timeframe: '6-12 months',
      },
    ],
    riskAssessment: {
      overallRisk: 'low',
      riskScore: 35,
      factors: [
        'Interest rate sensitivity',
        'Sector concentration in financials',
        'Regulatory risks',
      ],
      mitigation: [
        'Diversify across sectors',
        'Focus on quality dividend payers',
        'Monitor regulatory changes',
      ],
    },
    performanceMetrics: {
      totalReturn: 2.86,
      benchmarkReturn: 8.20,
      alpha: -5.34,
      beta: 0.65,
      sharpeRatio: 0.45,
      maxDrawdown: -3.2,
      volatility: 8.5,
    },
    status: 'published',
    tags: ['dividend-income', 'conservative', 'banking', 'stability'],
    isShared: true,
    createdAt: new Date('2024-01-08T14:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-08T14:00:00Z').toISOString(),
  },

  {
    id: 'report_003',
    analystId: 'analyst_003',
    investorId: 'investor_003',
    portfolioId: 'portfolio_003',
    title: 'Tech Growth Portfolio - Momentum Analysis',
    summary: 'High-growth technology portfolio showing strong momentum with elevated risk profile.',
    content: `
# Tech Growth Portfolio - Momentum Analysis

## Performance Highlights
Your Tech Growth Portfolio has delivered outstanding returns of 14.29%, significantly outperforming the broader market. The concentrated exposure to technology stocks has paid off handsomely.

## Sector Concentration Analysis
- **Information Technology**: 75%
- **Telecommunications**: 15%
- **Cash**: 10%

## Key Winners
1. **Infosys**: +5.57% - Digital transformation leader
2. **Wipro**: +3.84% - Cloud services growth
3. **Bharti Airtel**: +2.88% - 5G rollout benefits

## Risk Considerations
- High sector concentration
- Global economic sensitivity
- Valuation concerns at current levels

## Future Outlook
The technology sector remains well-positioned for long-term growth, driven by:
- Digital transformation acceleration
- Cloud adoption
- AI and automation trends
    `,
    recommendations: [
      {
        type: 'hold',
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        targetPrice: 4000.00,
        currentPrice: 3842.60,
        reasoning: 'Market leader with strong fundamentals',
        priority: 'high',
        timeframe: '12+ months',
      },
      {
        type: 'buy',
        symbol: 'HCLTECH',
        companyName: 'HCL Technologies Limited',
        targetPrice: 1350.00,
        currentPrice: 1285.00,
        reasoning: 'Undervalued compared to peers',
        priority: 'medium',
        timeframe: '6-9 months',
      },
    ],
    riskAssessment: {
      overallRisk: 'high',
      riskScore: 80,
      factors: [
        'High sector concentration',
        'Global economic sensitivity',
        'Valuation risks',
        'Currency exposure',
      ],
      mitigation: [
        'Gradual diversification',
        'Profit booking at highs',
        'Hedge currency exposure',
      ],
    },
    performanceMetrics: {
      totalReturn: 14.29,
      benchmarkReturn: 8.20,
      alpha: 6.09,
      beta: 1.35,
      sharpeRatio: 0.92,
      maxDrawdown: -12.8,
      volatility: 22.1,
    },
    status: 'published',
    tags: ['technology', 'growth', 'momentum', 'high-risk'],
    isShared: true,
    createdAt: new Date('2024-01-12T16:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-12T16:30:00Z').toISOString(),
  },

  {
    id: 'report_004',
    analystId: 'analyst_001',
    investorId: 'investor_004',
    portfolioId: 'portfolio_004',
    title: 'Balanced Portfolio - Sector Rotation Strategy',
    summary: 'Well-diversified portfolio positioned for sector rotation opportunities in 2024.',
    content: `
# Balanced Portfolio - Sector Rotation Strategy

## Portfolio Composition
Your Balanced Mix portfolio demonstrates excellent diversification across key sectors of the Indian economy:

- **Energy**: 25% (Reliance)
- **Financial Services**: 25% (ICICI Bank)
- **Consumer Goods**: 20% (Asian Paints)
- **Automobile**: 20% (Maruti Suzuki)
- **Cash**: 10%

## Sector Rotation Opportunities
Based on current market cycles and economic indicators:

### Overweight Recommendations
1. **Automobile Sector**: Recovery in rural demand
2. **Consumer Goods**: Festive season demand

### Underweight Recommendations
1. **Energy**: Margin pressure concerns
2. **Financial Services**: Interest rate headwinds

## Performance Attribution
- **Stock Selection**: +2.1%
- **Sector Allocation**: +1.8%
- **Market Timing**: +1.1%
    `,
    recommendations: [
      {
        type: 'buy',
        symbol: 'BAJAJFINSV',
        companyName: 'Bajaj Finserv Limited',
        targetPrice: 1650.00,
        currentPrice: 1580.00,
        reasoning: 'Diversified financial services platform',
        priority: 'high',
        timeframe: '6-12 months',
      },
    ],
    riskAssessment: {
      overallRisk: 'medium',
      riskScore: 55,
      factors: [
        'Sector diversification',
        'Market cap concentration',
        'Economic cycle exposure',
      ],
      mitigation: [
        'Regular rebalancing',
        'Monitor sector weights',
        'Maintain cash buffer',
      ],
    },
    performanceMetrics: {
      totalReturn: 5.00,
      benchmarkReturn: 8.20,
      alpha: -3.20,
      beta: 0.95,
      sharpeRatio: 0.58,
      maxDrawdown: -6.5,
      volatility: 12.8,
    },
    status: 'draft',
    tags: ['balanced', 'diversification', 'sector-rotation'],
    isShared: false,
    createdAt: new Date('2024-01-14T11:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T09:30:00Z').toISOString(),
  },
];

export const getReportsByAnalystId = (analystId: string): MockAnalysisReport[] => {
  return mockAnalysisReports.filter(report => report.analystId === analystId);
};

export const getReportsByInvestorId = (investorId: string): MockAnalysisReport[] => {
  return mockAnalysisReports.filter(report => report.investorId === investorId);
};

export const getReportsByPortfolioId = (portfolioId: string): MockAnalysisReport[] => {
  return mockAnalysisReports.filter(report => report.portfolioId === portfolioId);
};

export const getPublishedReports = (): MockAnalysisReport[] => {
  return mockAnalysisReports.filter(report => report.status === 'published');
};

export const getReportsByTag = (tag: string): MockAnalysisReport[] => {
  return mockAnalysisReports.filter(report => report.tags.includes(tag));
};

export const getRecentReports = (days: number = 30): MockAnalysisReport[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockAnalysisReports.filter(report => 
    new Date(report.createdAt) >= cutoffDate
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export default mockAnalysisReports;
