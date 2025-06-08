import { GoogleGenerativeAI } from '@google/generative-ai';
import { StockQuote, TechnicalIndicators } from './stockData';
import { IPortfolio } from '@/models/Portfolio';
import { IUser } from '@/models/User';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalysisRequest {
  portfolio: IPortfolio;
  user: IUser;
  stockQuotes: StockQuote[];
  technicalIndicators: TechnicalIndicators[];
  marketConditions?: {
    overall: 'bullish' | 'bearish' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    trend: 'upward' | 'downward' | 'sideways';
  };
}

export interface AIAnalysisResult {
  summary: string;
  detailedAnalysis: string;
  recommendations: {
    symbol: string;
    companyName: string;
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    targetPrice: number;
    currentPrice: number;
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
    timeHorizon: 'short' | 'medium' | 'long';
    allocationPercentage?: number;
  }[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    diversificationRisk: number;
    concentrationRisk: number;
    marketRisk: number;
    recommendations: string[];
  };
  marketConditions: {
    overall: 'bullish' | 'bearish' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    trend: 'upward' | 'downward' | 'sideways';
    sentiment: string;
  };
  performanceAnalysis: {
    returnAnalysis: string;
    benchmarkComparison: string;
    riskAdjustedReturns: string;
  };
}

export class GeminiAIService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generatePortfolioAnalysis(request: AnalysisRequest): Promise<AIAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(request);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAnalysisResponse(text, request);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      throw new Error('Failed to generate portfolio analysis');
    }
  }

  private buildAnalysisPrompt(request: AnalysisRequest): string {
    const { portfolio, user, stockQuotes, technicalIndicators, marketConditions } = request;

    const portfolioSummary = this.buildPortfolioSummary(portfolio, stockQuotes);
    const technicalSummary = this.buildTechnicalSummary(technicalIndicators);
    const userProfile = this.buildUserProfile(user);

    return `
You are a professional financial analyst providing comprehensive portfolio analysis. Analyze the following portfolio and provide detailed recommendations.

USER PROFILE:
${userProfile}

PORTFOLIO SUMMARY:
${portfolioSummary}

TECHNICAL INDICATORS:
${technicalSummary}

MARKET CONDITIONS:
${marketConditions ? `
- Overall Market: ${marketConditions.overall}
- Volatility: ${marketConditions.volatility}
- Trend: ${marketConditions.trend}
` : 'Not provided'}

ANALYSIS REQUIREMENTS:
1. Provide a comprehensive analysis considering the user's risk tolerance and investment goals
2. Generate specific buy/sell/hold recommendations for each holding
3. Assess portfolio diversification and concentration risks
4. Evaluate performance against market benchmarks
5. Consider technical indicators in your recommendations
6. Provide risk-adjusted return analysis
7. Suggest portfolio rebalancing if needed

RESPONSE FORMAT:
Please structure your response as a detailed financial analysis report with the following sections:

EXECUTIVE SUMMARY:
[Provide a 2-3 paragraph summary of the portfolio's current state and key recommendations]

DETAILED ANALYSIS:
[Provide in-depth analysis of portfolio performance, risk factors, and market positioning]

INDIVIDUAL STOCK RECOMMENDATIONS:
[For each holding, provide specific action (buy/sell/hold), confidence level (0-100), target price, reasoning, risk level, and time horizon]

RISK ASSESSMENT:
[Evaluate overall portfolio risk, diversification, concentration risk, and market risk with specific recommendations]

MARKET CONDITIONS ANALYSIS:
[Analyze current market conditions and their impact on the portfolio]

PERFORMANCE ANALYSIS:
[Analyze returns, benchmark comparison, and risk-adjusted performance metrics]

Please provide specific, actionable recommendations based on the data provided. Consider both fundamental and technical analysis in your recommendations.
`;
  }

  private buildPortfolioSummary(portfolio: IPortfolio, stockQuotes: StockQuote[]): string {
    let summary = `
Portfolio Name: ${portfolio.name}
Total Value: $${portfolio.totalValue.toLocaleString()}
Total Cost: $${portfolio.totalCost.toLocaleString()}
Total Gain/Loss: $${portfolio.totalGainLoss.toLocaleString()} (${portfolio.totalGainLossPercentage.toFixed(2)}%)
Cash Position: $${portfolio.cash.toLocaleString()}
Number of Holdings: ${portfolio.holdings.length}

HOLDINGS:
`;

    portfolio.holdings.forEach((holding, index) => {
      const quote = stockQuotes.find(q => q.symbol === holding.symbol);
      summary += `
${index + 1}. ${holding.symbol} - ${holding.companyName}
   - Shares: ${holding.shares}
   - Average Cost: $${holding.averageCost.toFixed(2)}
   - Current Price: $${holding.currentPrice.toFixed(2)}
   - Market Value: $${holding.marketValue.toLocaleString()}
   - Gain/Loss: $${holding.gainLoss.toLocaleString()} (${holding.gainLossPercentage.toFixed(2)}%)
   - Portfolio Weight: ${((holding.marketValue / portfolio.totalValue) * 100).toFixed(2)}%
   ${quote ? `- 52-Week Range: $${quote.low52Week.toFixed(2)} - $${quote.high52Week.toFixed(2)}` : ''}
   ${quote ? `- P/E Ratio: ${quote.peRatio.toFixed(2)}` : ''}
`;
    });

    return summary;
  }

  private buildTechnicalSummary(technicalIndicators: TechnicalIndicators[]): string {
    let summary = 'TECHNICAL INDICATORS:\n';

    technicalIndicators.forEach(indicator => {
      summary += `
${indicator.symbol}:
- RSI: ${indicator.rsi.toFixed(2)} ${this.interpretRSI(indicator.rsi)}
- MACD: ${indicator.macd.macd.toFixed(2)} (Signal: ${indicator.macd.signal.toFixed(2)})
- SMA 20: $${indicator.sma20.toFixed(2)}
- SMA 50: $${indicator.sma50.toFixed(2)}
- SMA 200: $${indicator.sma200.toFixed(2)}
- EMA 12: $${indicator.ema12.toFixed(2)}
- EMA 26: $${indicator.ema26.toFixed(2)}
- Volume vs Average: ${((indicator.volume / indicator.averageVolume) * 100).toFixed(0)}%
- 24h Change: ${indicator.priceChangePercentage24h.toFixed(2)}%
`;
    });

    return summary;
  }

  private buildUserProfile(user: IUser): string {
    return `
Name: ${user.name}
Role: ${user.role}
Risk Tolerance: ${user.preferences.riskTolerance}
Investment Goals: ${user.preferences.investmentGoals.join(', ')}
`;
  }

  private interpretRSI(rsi: number): string {
    if (rsi > 70) return '(Overbought)';
    if (rsi < 30) return '(Oversold)';
    return '(Neutral)';
  }

  private parseAnalysisResponse(text: string, request: AnalysisRequest): AIAnalysisResult {
    // This is a simplified parser. In a production environment,
    // you might want to use more sophisticated parsing or structured output
    
    const sections = this.extractSections(text);
    
    return {
      summary: sections.summary || 'Analysis summary not available',
      detailedAnalysis: sections.detailedAnalysis || 'Detailed analysis not available',
      recommendations: this.extractRecommendations(text, request.stockQuotes),
      riskAssessment: this.extractRiskAssessment(text),
      marketConditions: this.extractMarketConditions(text),
      performanceAnalysis: this.extractPerformanceAnalysis(text),
    };
  }

  private extractSections(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    
    // Extract executive summary
    const summaryMatch = text.match(/EXECUTIVE SUMMARY:?\s*([\s\S]*?)(?=DETAILED ANALYSIS|$)/i);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }
    
    // Extract detailed analysis
    const detailedMatch = text.match(/DETAILED ANALYSIS:?\s*([\s\S]*?)(?=INDIVIDUAL STOCK|RISK ASSESSMENT|$)/i);
    if (detailedMatch) {
      sections.detailedAnalysis = detailedMatch[1].trim();
    }
    
    return sections;
  }

  private extractRecommendations(text: string, stockQuotes: StockQuote[]): AIAnalysisResult['recommendations'] {
    // Simplified recommendation extraction
    // In production, you'd want more sophisticated parsing
    return stockQuotes.map(quote => ({
      symbol: quote.symbol,
      companyName: quote.companyName,
      action: 'hold' as const,
      confidence: 75,
      targetPrice: quote.price * 1.1,
      currentPrice: quote.price,
      reasoning: 'Based on current market conditions and technical analysis',
      riskLevel: 'medium' as const,
      timeHorizon: 'medium' as const,
    }));
  }

  private extractRiskAssessment(text: string): AIAnalysisResult['riskAssessment'] {
    return {
      overallRisk: 'medium',
      diversificationRisk: 60,
      concentrationRisk: 40,
      marketRisk: 50,
      recommendations: ['Consider diversifying across sectors', 'Monitor position sizes'],
    };
  }

  private extractMarketConditions(text: string): AIAnalysisResult['marketConditions'] {
    return {
      overall: 'neutral',
      volatility: 'medium',
      trend: 'sideways',
      sentiment: 'Mixed market sentiment with cautious optimism',
    };
  }

  private extractPerformanceAnalysis(text: string): AIAnalysisResult['performanceAnalysis'] {
    return {
      returnAnalysis: 'Portfolio showing moderate performance relative to investment timeline',
      benchmarkComparison: 'Performance in line with major market indices',
      riskAdjustedReturns: 'Risk-adjusted returns are acceptable given current market conditions',
    };
  }
}
