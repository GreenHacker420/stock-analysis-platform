import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import AnalysisReport from '@/models/AnalysisReport';
import User from '@/models/User';
import { mockPortfolios } from '@/data/mockPortfolios';
import { mockAnalysisReports } from '@/data/mockReports';
import { mockUsers } from '@/data/mockUsers';

// Helper function to check database status
async function checkDatabaseStatus() {
  try {
    const userCount = await User.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();
    const reportCount = await AnalysisReport.countDocuments();

    return {
      hasUsers: userCount > 0,
      hasPortfolios: portfolioCount > 0,
      hasReports: reportCount > 0,
      hasData: userCount > 0 && portfolioCount > 0 && reportCount > 0
    };
  } catch (error) {
    console.error('Dashboard stats: Error checking database status:', error);
    return {
      hasUsers: false,
      hasPortfolios: false,
      hasReports: false,
      hasData: false
    };
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check database status
    const dbStatus = await checkDatabaseStatus();

    let stats;

    // Try to get data from database if it has data
    if (dbStatus.hasData) {
      try {
      if (session.user.role === 'investor') {
        // For demo purposes, calculate stats from all portfolios
        const portfolios = await Portfolio.find({ isActive: true });

        const totalPortfolioValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
        const totalGainLoss = portfolios.reduce((sum, portfolio) => sum + portfolio.totalGainLoss, 0);
        const totalCost = portfolios.reduce((sum, portfolio) => sum + portfolio.totalCost, 0);
        const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        // Get recent reports count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReportsCount = await AnalysisReport.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
          isActive: true
        });

        stats = {
          totalPortfolioValue,
          totalGainLoss,
          totalGainLossPercentage,
          portfolioCount: portfolios.length,
          recentReportsCount,
        };

      } else if (session.user.role === 'analyst') {
        // For demo purposes, calculate stats from all portfolios and reports
        const portfolios = await Portfolio.find({ isActive: true });

        const totalPortfolioValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
        const totalGainLoss = portfolios.reduce((sum, portfolio) => sum + portfolio.totalGainLoss, 0);
        const totalCost = portfolios.reduce((sum, portfolio) => sum + portfolio.totalCost, 0);
        const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        // Get recent reports count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReportsCount = await AnalysisReport.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
          isActive: true
        });

        const totalInvestors = await User.countDocuments({ role: 'investor', isActive: true });

        stats = {
          totalPortfolioValue,
          totalGainLoss,
          totalGainLossPercentage,
          portfolioCount: portfolios.length,
          recentReportsCount,
          assignedInvestorsCount: totalInvestors,
        };

        } else {
          return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
        }

      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError);
        stats = null; // Will trigger fallback below
      }
    }

    // Fallback to mock data if database query failed or no data
    if (!stats) {
      console.log('Using mock data for dashboard stats...');

      // Fallback to mock data calculations
      const totalPortfolioValue = mockPortfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
      const totalGainLoss = mockPortfolios.reduce((sum, portfolio) => sum + portfolio.totalGainLoss, 0);
      const totalCost = mockPortfolios.reduce((sum, portfolio) => sum + portfolio.totalCost, 0);
      const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      // Get recent reports count from mock data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentReportsCount = mockAnalysisReports.filter(report =>
        new Date(report.createdAt) >= thirtyDaysAgo
      ).length;

      stats = {
        totalPortfolioValue,
        totalGainLoss,
        totalGainLossPercentage,
        portfolioCount: mockPortfolios.length,
        recentReportsCount,
        assignedInvestorsCount: mockUsers.filter(u => u.role === 'investor').length,
        source: 'mock_data'
      };
    }

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
