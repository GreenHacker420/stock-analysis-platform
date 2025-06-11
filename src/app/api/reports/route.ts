import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AnalysisReport from '@/models/AnalysisReport';

import User from '@/models/User';
import Portfolio from '@/models/Portfolio';
import { mockAnalysisReports } from '@/data/mockReports';
import { mockUsers } from '@/data/mockUsers';
import { mockPortfolios } from '@/data/mockPortfolios';

// Helper function to check if database needs seeding
async function checkAndSeedDatabase() {
  try {
    const reportCount = await AnalysisReport.countDocuments();
    const userCount = await User.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();

    // If database is empty, trigger seeding
    if (reportCount === 0 || userCount === 0 || portfolioCount === 0) {
      console.log('Database appears empty, triggering automatic seeding...');

      // Seed users first
      if (userCount === 0) {
        for (const mockUser of mockUsers) {
          const existingUser = await User.findOne({ email: mockUser.email });
          if (!existingUser) {
            const userData = {
              email: mockUser.email,
              name: mockUser.name,
              image: mockUser.image,
              role: mockUser.role,
              isActive: mockUser.isActive,
              lastLogin: mockUser.lastLogin ? new Date(mockUser.lastLogin) : new Date(),
              preferences: mockUser.preferences,
            };
            const user = new User(userData);
            await user.save();
          }
        }
      }

      // Seed portfolios
      if (portfolioCount === 0) {
        for (const mockPortfolio of mockPortfolios) {
          const existingPortfolio = await Portfolio.findOne({ name: mockPortfolio.name });
          if (!existingPortfolio) {
            const mockInvestor = mockUsers.find(u => u.id === mockPortfolio.investorId);
            const investor = await User.findOne({ email: mockInvestor?.email });

            if (investor) {
              // Transform holdings to match database schema
              const transformedHoldings = mockPortfolio.holdings.map((holding: any) => ({
                symbol: holding.symbol,
                companyName: holding.companyName,
                shares: holding.quantity, // quantity → shares
                averageCost: holding.averagePrice, // averagePrice → averageCost
                currentPrice: holding.currentPrice,
                marketValue: holding.totalValue, // totalValue → marketValue
                gainLoss: holding.gainLoss,
                gainLossPercentage: holding.gainLossPercentage,
                lastUpdated: holding.lastUpdated || new Date()
              }));

              const portfolioData = {
                name: mockPortfolio.name,
                description: mockPortfolio.description,
                totalValue: mockPortfolio.totalValue,
                totalCost: mockPortfolio.totalCost,
                totalGainLoss: mockPortfolio.totalGainLoss,
                totalGainLossPercentage: mockPortfolio.totalGainLossPercentage,
                holdings: transformedHoldings,
                cash: mockPortfolio.cash,
                isActive: mockPortfolio.isActive,
                lastAnalyzed: mockPortfolio.lastAnalyzed ? new Date(mockPortfolio.lastAnalyzed) : undefined,
                riskScore: mockPortfolio.riskScore,
                diversificationScore: 50, // Default value
                performanceMetrics: {
                  dailyReturn: 0,
                  weeklyReturn: 0,
                  monthlyReturn: 0,
                  yearlyReturn: 0,
                  volatility: 0,
                  sharpeRatio: 0
                },
                investorId: investor._id,
              };
              const portfolio = new Portfolio(portfolioData);
              await portfolio.save();
            }
          }
        }
      }

      // Seed reports
      if (reportCount === 0) {
        for (const mockReport of mockAnalysisReports) {
          const existingReport = await AnalysisReport.findOne({ title: mockReport.title });
          if (!existingReport) {
            const mockAnalyst = mockUsers.find(u => u.id === mockReport.analystId);
            const mockInvestor = mockUsers.find(u => u.id === mockReport.investorId);
            const mockPortfolio = mockPortfolios.find(p => p.id === mockReport.portfolioId);

            const analyst = await User.findOne({ email: mockAnalyst?.email });
            const investor = await User.findOne({ email: mockInvestor?.email });
            const portfolio = await Portfolio.findOne({ name: mockPortfolio?.name });

            if (analyst && investor) {
              const reportData = {
                title: mockReport.title,
                summary: mockReport.summary,
                content: (mockReport as any).content || mockReport.summary,
                recommendations: (mockReport as any).recommendations || [],
                riskAssessment: (mockReport as any).riskAssessment || { overallRisk: 'medium', riskScore: 50, factors: [], mitigation: [] },
                performanceMetrics: (mockReport as any).performanceMetrics || { totalReturn: 0, benchmarkReturn: 0, alpha: 0, beta: 1, sharpeRatio: 0, maxDrawdown: 0, volatility: 0 },
                status: mockReport.status,
                tags: (mockReport as any).tags || [],
                isShared: (mockReport as any).isShared || false,
                analystId: analyst._id,
                investorId: investor._id,
                portfolioId: portfolio?._id,
              };
              const report = new AnalysisReport(reportData);
              await report.save();
            }
          }
        }
      }

      console.log('Automatic seeding completed');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error during automatic seeding:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check and seed database if needed
    await checkAndSeedDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    let reports;

    if (session.user.role === 'investor') {
      // For demo purposes, show all reports (in production, filter by investorId)
      let query: any = { isActive: true };

      if (portfolioId) query.portfolioId = portfolioId;
      if (status) query.status = status;

      reports = await AnalysisReport.find(query)
        .populate('portfolioId', 'name')
        .populate('analystId', 'name email')
        .populate('investorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

    } else if (session.user.role === 'analyst') {
      // For demo purposes, show all reports (in production, filter by analystId)
      let query: any = { isActive: true };

      if (portfolioId) query.portfolioId = portfolioId;
      if (status) query.status = status;

      reports = await AnalysisReport.find(query)
        .populate('portfolioId', 'name')
        .populate('analystId', 'name email')
        .populate('investorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    const total = await AnalysisReport.countDocuments({ isActive: true });

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);

    // Fallback to mock data if database fails
    console.log('Falling back to mock data...');

    try {
      let filteredReports = mockAnalysisReports;

      // Apply basic filtering for fallback
      const { searchParams } = new URL(request.url);
      const portfolioId = searchParams.get('portfolioId');
      const status = searchParams.get('status');

      if (portfolioId) {
        filteredReports = filteredReports.filter(r => r.portfolioId === portfolioId);
      }

      if (status) {
        filteredReports = filteredReports.filter(r => r.status === status);
      }

      // Add user and portfolio names
      const reportsWithDetails = filteredReports.map(report => {
        const analyst = mockUsers.find(u => u.id === report.analystId);
        const investor = mockUsers.find(u => u.id === report.investorId);
        const portfolio = mockPortfolios.find(p => p.id === report.portfolioId);

        return {
          ...report,
          _id: report.id,
          analystId: {
            _id: report.analystId,
            name: analyst?.name || 'Unknown',
            email: analyst?.email || ''
          },
          investorId: {
            _id: report.investorId,
            name: investor?.name || 'Unknown',
            email: investor?.email || ''
          },
          portfolioId: portfolio ? {
            _id: report.portfolioId,
            name: portfolio.name
          } : null,
          isActive: true
        };
      });

      return NextResponse.json({
        success: true,
        reports: reportsWithDetails,
        fallback: true,
        pagination: {
          total: reportsWithDetails.length,
          limit: 50,
          skip: 0,
          hasMore: false
        }
      });

    } catch (fallbackError) {
      console.error('Fallback to mock data also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to fetch reports and fallback failed' },
        { status: 500 }
      );
    }
  }
}
