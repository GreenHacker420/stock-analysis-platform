import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import User from '@/models/User';
import AnalysisReport from '@/models/AnalysisReport';
import UserAnalyst from '@/models/UserAnalyst';
import { generateAIAnalysis } from '@/lib/geminiAI';
import { mockAnalysisReports } from '@/data/mockReports';
import { mockUsers } from '@/data/mockUsers';
import { mockPortfolios } from '@/data/mockPortfolios';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { portfolioId } = body;

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch portfolio with investor details
    const portfolio = await Portfolio.findById(portfolioId).populate('investorId');
    
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let canAnalyze = false;
    
    if (session.user.role === 'investor' && portfolio.investorId._id.toString() === session.user.id) {
      canAnalyze = true;
    } else if (session.user.role === 'analyst') {
      // Check if analyst is assigned to this investor
      const assignment = await UserAnalyst.findOne({
        analystId: session.user.id,
        investorId: portfolio.investorId._id,
        status: 'active'
      });
      canAnalyze = !!assignment;
    }

    if (!canAnalyze) {
      return NextResponse.json(
        { error: 'Not authorized to analyze this portfolio' },
        { status: 403 }
      );
    }

    // Get current user details
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch stock data for all holdings
    const stockService = StockDataService.getInstance();
    const stockQuotes = [];
    const technicalIndicators = [];

    for (const holding of portfolio.holdings) {
      try {
        const quote = await stockService.getQuote(holding.symbol);
        const technical = await stockService.getTechnicalIndicators(holding.symbol);
        
        if (quote) stockQuotes.push(quote);
        if (technical) technicalIndicators.push(technical);
      } catch (error) {
        console.error(`Error fetching data for ${holding.symbol}:`, error);
      }
    }

    // Generate AI analysis
    const geminiService = new GeminiAIService();
    const startTime = Date.now();
    
    const aiAnalysis = await geminiService.generatePortfolioAnalysis({
      portfolio,
      user: portfolio.investorId,
      stockQuotes,
      technicalIndicators,
    });

    const processingTime = Date.now() - startTime;

    // Create analysis report
    const report = new AnalysisReport({
      portfolioId: portfolio._id,
      analystId: session.user.id,
      investorId: portfolio.investorId._id,
      title: `Portfolio Analysis - ${portfolio.name}`,
      summary: aiAnalysis.summary,
      aiAnalysis: aiAnalysis.detailedAnalysis,
      recommendations: aiAnalysis.recommendations,
      technicalIndicators: technicalIndicators.map(ti => ({
        symbol: ti.symbol,
        rsi: ti.rsi,
        macd: ti.macd,
        sma20: ti.sma20,
        sma50: ti.sma50,
        sma200: ti.sma200,
        ema12: ti.ema12,
        ema26: ti.ema26,
        volume: ti.volume,
        averageVolume: ti.averageVolume,
        priceChange24h: ti.priceChange24h,
        priceChangePercentage24h: ti.priceChangePercentage24h,
      })),
      marketConditions: aiAnalysis.marketConditions,
      riskAssessment: aiAnalysis.riskAssessment,
      performanceAnalysis: aiAnalysis.performanceAnalysis,
      status: 'completed',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
      tags: ['ai-generated', 'portfolio-analysis'],
      metadata: {
        aiModel: 'gemini-pro',
        processingTime,
        dataSourcesUsed: ['yahoo-finance', 'technical-indicators'],
        confidence: 85,
      },
    });

    await report.save();

    // Update portfolio's last analyzed date
    await Portfolio.findByIdAndUpdate(portfolioId, {
      lastAnalyzed: new Date(),
    });

    const populatedReport = await AnalysisReport.findById(report._id)
      .populate('portfolioId', 'name')
      .populate('analystId', 'name email')
      .populate('investorId', 'name email');

    return NextResponse.json({ 
      report: populatedReport,
      message: 'Analysis generated successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
