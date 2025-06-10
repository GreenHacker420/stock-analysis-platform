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
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
    const recommendations: AIAnalysisResult['recommendations'] = [];

    for (const quote of stockQuotes) {
      // Extract recommendation for each stock from the AI response
      const stockSection = this.extractStockSection(text, quote.symbol);

      const action = this.extractAction(stockSection) || 'hold';
      const confidence = this.extractConfidence(stockSection) || 75;
      const reasoning = this.extractReasoning(stockSection) || 'Based on current market conditions and technical analysis';
      const riskLevel = this.extractRiskLevel(stockSection) || 'medium';
      const timeHorizon = this.extractTimeHorizon(stockSection) || 'medium';

      recommendations.push({
        symbol: quote.symbol,
        companyName: quote.companyName,
        action: action as 'buy' | 'sell' | 'hold',
        confidence,
        targetPrice: this.calculateTargetPrice(quote.price, action),
        currentPrice: quote.price,
        reasoning,
        riskLevel: riskLevel as 'low' | 'medium' | 'high',
        timeHorizon: timeHorizon as 'short' | 'medium' | 'long',
      });
    }

    return recommendations;
  }

  private extractRiskAssessment(text: string): AIAnalysisResult['riskAssessment'] {
    const riskSection = this.extractSectionContent(text, 'RISK ASSESSMENT');

    const overallRisk = this.extractRiskFromText(riskSection, 'overall') || 'medium';
    const diversificationRisk = this.extractNumericValue(riskSection, 'diversification') || 60;
    const concentrationRisk = this.extractNumericValue(riskSection, 'concentration') || 40;
    const marketRisk = this.extractNumericValue(riskSection, 'market') || 50;
    const recommendations = this.extractRiskRecommendations(riskSection);

    return {
      overallRisk: overallRisk as 'low' | 'medium' | 'high',
      diversificationRisk,
      concentrationRisk,
      marketRisk,
      recommendations,
    };
  }

  private extractMarketConditions(text: string): AIAnalysisResult['marketConditions'] {
    const marketSection = this.extractSectionContent(text, 'MARKET CONDITIONS');

    const overall = this.extractMarketSentiment(marketSection, 'overall') || 'neutral';
    const volatility = this.extractMarketSentiment(marketSection, 'volatility') || 'medium';
    const trend = this.extractMarketTrend(marketSection) || 'sideways';
    const sentiment = this.extractSentimentDescription(marketSection) || 'Mixed market sentiment with cautious optimism';

    return {
      overall: overall as 'bullish' | 'bearish' | 'neutral',
      volatility: volatility as 'low' | 'medium' | 'high',
      trend: trend as 'upward' | 'downward' | 'sideways',
      sentiment,
    };
  }

  private extractPerformanceAnalysis(text: string): AIAnalysisResult['performanceAnalysis'] {
    const performanceSection = this.extractSectionContent(text, 'PERFORMANCE ANALYSIS');

    return {
      returnAnalysis: this.extractSubsection(performanceSection, 'return') || 'Portfolio showing moderate performance relative to investment timeline',
      benchmarkComparison: this.extractSubsection(performanceSection, 'benchmark') || 'Performance in line with major market indices',
      riskAdjustedReturns: this.extractSubsection(performanceSection, 'risk-adjusted') || 'Risk-adjusted returns are acceptable given current market conditions',
    };
  }

  // Helper methods for improved AI response parsing
  private extractStockSection(text: string, symbol: string): string {
    const regex = new RegExp(`${symbol}[:\\s-]([^\\n]*(?:\\n(?!\\w+:)[^\\n]*)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1] : '';
  }

  private extractAction(stockSection: string): string | null {
    const buyPattern = /\b(buy|purchase|acquire)\b/i;
    const sellPattern = /\b(sell|dispose|exit)\b/i;
    const holdPattern = /\b(hold|maintain|keep)\b/i;

    if (buyPattern.test(stockSection)) return 'buy';
    if (sellPattern.test(stockSection)) return 'sell';
    if (holdPattern.test(stockSection)) return 'hold';

    return null;
  }

  private extractConfidence(stockSection: string): number | null {
    const confidencePattern = /confidence[:\s]*(\d+)%?/i;
    const match = stockSection.match(confidencePattern);
    return match ? parseInt(match[1]) : null;
  }

  private extractReasoning(stockSection: string): string | null {
    const reasoningPattern = /(?:reason|rationale|because)[:\s]*([^.]+)/i;
    const match = stockSection.match(reasoningPattern);
    return match ? match[1].trim() : null;
  }

  private extractRiskLevel(stockSection: string): string | null {
    const lowRiskPattern = /\b(low|minimal|conservative)\s+risk\b/i;
    const highRiskPattern = /\b(high|significant|aggressive)\s+risk\b/i;
    const mediumRiskPattern = /\b(medium|moderate|balanced)\s+risk\b/i;

    if (lowRiskPattern.test(stockSection)) return 'low';
    if (highRiskPattern.test(stockSection)) return 'high';
    if (mediumRiskPattern.test(stockSection)) return 'medium';

    return null;
  }

  private extractTimeHorizon(stockSection: string): string | null {
    const shortPattern = /\b(short|immediate|near)[\s-]?term\b/i;
    const longPattern = /\b(long|extended)[\s-]?term\b/i;
    const mediumPattern = /\b(medium|mid)[\s-]?term\b/i;

    if (shortPattern.test(stockSection)) return 'short';
    if (longPattern.test(stockSection)) return 'long';
    if (mediumPattern.test(stockSection)) return 'medium';

    return null;
  }

  private calculateTargetPrice(currentPrice: number, action: string): number {
    switch (action) {
      case 'buy':
        return currentPrice * 1.15; // 15% upside target
      case 'sell':
        return currentPrice * 0.95; // 5% downside protection
      default:
        return currentPrice * 1.05; // 5% modest upside for hold
    }
  }

  private extractSectionContent(text: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractSubsection(content: string, keyword: string): string | null {
    const regex = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'i');
    const match = content.match(regex);
    return match ? match[0].trim() : null;
  }

  private extractRiskFromText(text: string, riskType: string): string | null {
    const lowPattern = new RegExp(`${riskType}[^.]*\\b(low|minimal|conservative)\\b`, 'i');
    const highPattern = new RegExp(`${riskType}[^.]*\\b(high|significant|aggressive)\\b`, 'i');
    const mediumPattern = new RegExp(`${riskType}[^.]*\\b(medium|moderate|balanced)\\b`, 'i');

    if (lowPattern.test(text)) return 'low';
    if (highPattern.test(text)) return 'high';
    if (mediumPattern.test(text)) return 'medium';

    return null;
  }

  private extractNumericValue(text: string, keyword: string): number | null {
    const regex = new RegExp(`${keyword}[^\\d]*(\\d+)`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
  }

  private extractRiskRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.match(/^[-•*]\s*/) || line.toLowerCase().includes('recommend')) {
        const cleaned = line.replace(/^[-•*]\s*/, '').trim();
        if (cleaned.length > 10) {
          recommendations.push(cleaned);
        }
      }
    }

    return recommendations.length > 0 ? recommendations : ['Consider diversifying across sectors', 'Monitor position sizes'];
  }

  private extractMarketSentiment(text: string, type: string): string | null {
    if (type === 'overall') {
      if (/\b(bullish|positive|optimistic|upward)\b/i.test(text)) return 'bullish';
      if (/\b(bearish|negative|pessimistic|downward)\b/i.test(text)) return 'bearish';
      return 'neutral';
    }

    if (type === 'volatility') {
      if (/\b(low|stable|calm)\s+volatility\b/i.test(text)) return 'low';
      if (/\b(high|extreme|elevated)\s+volatility\b/i.test(text)) return 'high';
      return 'medium';
    }

    return null;
  }

  private extractMarketTrend(text: string): string | null {
    if (/\b(upward|rising|ascending|bullish)\s+trend\b/i.test(text)) return 'upward';
    if (/\b(downward|falling|descending|bearish)\s+trend\b/i.test(text)) return 'downward';
    if (/\b(sideways|lateral|flat|consolidating)\s+trend\b/i.test(text)) return 'sideways';

    return null;
  }

  private extractSentimentDescription(text: string): string | null {
    const sentimentPattern = /sentiment[:\s]*([^.]+)/i;
    const match = text.match(sentimentPattern);
    return match ? match[1].trim() : null;
  }
}
