import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Portfolio from '@/models/Portfolio';
import AnalysisReport from '@/models/AnalysisReport';
import { mockUsers } from '@/data/mockUsers';
import { mockPortfolios } from '@/data/mockPortfolios';
import { mockAnalysisReports } from '@/data/mockReports';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters to determine what to seed
    const { searchParams } = new URL(request.url);
    const seedType = searchParams.get('type') || 'all';
    const clearExisting = searchParams.get('clear') === 'true';

    let results = {
      users: { created: 0, skipped: 0, errors: 0 },
      portfolios: { created: 0, skipped: 0, errors: 0 },
      reports: { created: 0, skipped: 0, errors: 0 }
    };

    // Clear existing data if requested
    if (clearExisting) {
      if (seedType === 'all' || seedType === 'users') {
        await User.deleteMany({});
      }
      if (seedType === 'all' || seedType === 'portfolios') {
        await Portfolio.deleteMany({});
      }
      if (seedType === 'all' || seedType === 'reports') {
        await AnalysisReport.deleteMany({});
      }
    }

    // Seed Users
    if (seedType === 'all' || seedType === 'users') {
      console.log('Seeding users...');
      
      for (const mockUser of mockUsers) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ email: mockUser.email });
          
          if (existingUser) {
            results.users.skipped++;
            continue;
          }

          // Create new user
          const userData = {
            email: mockUser.email,
            name: mockUser.name,
            image: mockUser.image,
            role: mockUser.role,
            isActive: mockUser.isActive,
            lastLogin: mockUser.lastLogin ? new Date(mockUser.lastLogin) : new Date(),
            preferences: mockUser.preferences,
            // Note: We don't seed passwords for security reasons
          };

          const user = new User(userData);
          await user.save();
          results.users.created++;
          
        } catch (error) {
          console.error(`Error creating user ${mockUser.email}:`, error);
          results.users.errors++;
        }
      }
    }

    // Seed Portfolios
    if (seedType === 'all' || seedType === 'portfolios') {
      console.log('Seeding portfolios...');
      
      for (const mockPortfolio of mockPortfolios) {
        try {
          // Check if portfolio already exists
          const existingPortfolio = await Portfolio.findOne({ name: mockPortfolio.name });
          
          if (existingPortfolio) {
            results.portfolios.skipped++;
            continue;
          }

          // Find the investor user in the database by email only
          const mockInvestor = mockUsers.find(u => u.id === mockPortfolio.investorId);
          const investor = await User.findOne({ email: mockInvestor?.email });

          if (!investor) {
            console.warn(`Investor not found for portfolio ${mockPortfolio.name}`);
            results.portfolios.errors++;
            continue;
          }

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

          // Create portfolio data
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
          results.portfolios.created++;
          
        } catch (error) {
          console.error(`Error creating portfolio ${mockPortfolio.name}:`, error);
          results.portfolios.errors++;
        }
      }
    }

    // Seed Reports
    if (seedType === 'all' || seedType === 'reports') {
      console.log('Seeding reports...');
      
      for (const mockReport of mockAnalysisReports) {
        try {
          // Check if report already exists
          const existingReport = await AnalysisReport.findOne({ title: mockReport.title });
          
          if (existingReport) {
            results.reports.skipped++;
            continue;
          }

          // Find the analyst and investor users in the database by email only
          const mockAnalyst = mockUsers.find(u => u.id === mockReport.analystId);
          const mockInvestor = mockUsers.find(u => u.id === mockReport.investorId);
          const mockPortfolio = mockPortfolios.find(p => p.id === mockReport.portfolioId);

          const analyst = await User.findOne({ email: mockAnalyst?.email });
          const investor = await User.findOne({ email: mockInvestor?.email });
          const portfolio = await Portfolio.findOne({ name: mockPortfolio?.name });

          if (!analyst || !investor) {
            console.warn(`Analyst or investor not found for report ${mockReport.title}`);
            results.reports.errors++;
            continue;
          }

          // Create report data
          const reportData = {
            title: mockReport.title,
            summary: mockReport.summary,
            content: mockReport.summary, // Use summary as content since content doesn't exist in mock data
            recommendations: mockReport.recommendations || [],
            riskAssessment: mockReport.riskAssessment || { overallRisk: 'medium', riskScore: 50, factors: [], mitigation: [] },
            performanceMetrics: (mockReport as any).performanceMetrics || { totalReturn: 0, benchmarkReturn: 0, alpha: 0, beta: 1, sharpeRatio: 0, maxDrawdown: 0, volatility: 0 },
            status: mockReport.status,
            tags: mockReport.tags || [],
            isShared: false, // Default value since not in mock data
            analystId: analyst._id,
            investorId: investor._id,
            portfolioId: portfolio?._id,
          };

          const report = new AnalysisReport(reportData);
          await report.save();
          results.reports.created++;
          
        } catch (error) {
          console.error(`Error creating report ${mockReport.title}:`, error);
          results.reports.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeding completed',
      results,
      summary: {
        totalCreated: results.users.created + results.portfolios.created + results.reports.created,
        totalSkipped: results.users.skipped + results.portfolios.skipped + results.reports.skipped,
        totalErrors: results.users.errors + results.portfolios.errors + results.reports.errors
      }
    });

  } catch (error) {
    console.error('Database seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    // Get current counts from database
    const userCount = await User.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();
    const reportCount = await AnalysisReport.countDocuments();

    // Get mock data counts
    const mockCounts = {
      users: mockUsers.length,
      portfolios: mockPortfolios.length,
      reports: mockAnalysisReports.length
    };

    return NextResponse.json({
      success: true,
      currentCounts: {
        users: userCount,
        portfolios: portfolioCount,
        reports: reportCount
      },
      mockDataCounts: mockCounts,
      needsSeeding: {
        users: userCount < mockCounts.users,
        portfolios: portfolioCount < mockCounts.portfolios,
        reports: reportCount < mockCounts.reports
      }
    });

  } catch (error) {
    console.error('Database status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clearType = searchParams.get('type') || 'all';

    let results = {
      users: 0,
      portfolios: 0,
      reports: 0
    };

    if (clearType === 'all' || clearType === 'users') {
      const userResult = await User.deleteMany({});
      results.users = userResult.deletedCount || 0;
    }

    if (clearType === 'all' || clearType === 'portfolios') {
      const portfolioResult = await Portfolio.deleteMany({});
      results.portfolios = portfolioResult.deletedCount || 0;
    }

    if (clearType === 'all' || clearType === 'reports') {
      const reportResult = await AnalysisReport.deleteMany({});
      results.reports = reportResult.deletedCount || 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      deletedCounts: results,
      totalDeleted: results.users + results.portfolios + results.reports
    });

  } catch (error) {
    console.error('Database clear error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
