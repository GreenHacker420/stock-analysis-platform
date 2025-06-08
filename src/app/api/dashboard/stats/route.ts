import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import AnalysisReport from '@/models/AnalysisReport';
import UserAnalyst from '@/models/UserAnalyst';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let stats;

    if (session.user.role === 'investor') {
      // Get investor stats
      const portfolios = await Portfolio.find({ 
        investorId: session.user.id,
        isActive: true 
      });

      const totalPortfolioValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
      const totalGainLoss = portfolios.reduce((sum, portfolio) => sum + portfolio.totalGainLoss, 0);
      const totalCost = portfolios.reduce((sum, portfolio) => sum + portfolio.totalCost, 0);
      const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      // Get recent reports count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentReportsCount = await AnalysisReport.countDocuments({
        investorId: session.user.id,
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
      // Get analyst stats
      const assignments = await UserAnalyst.find({
        analystId: session.user.id,
        status: 'active'
      });

      const investorIds = assignments.map(assignment => assignment.investorId);
      
      const portfolios = await Portfolio.find({
        investorId: { $in: investorIds },
        isActive: true
      });

      const totalPortfolioValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
      const totalGainLoss = portfolios.reduce((sum, portfolio) => sum + portfolio.totalGainLoss, 0);
      const totalCost = portfolios.reduce((sum, portfolio) => sum + portfolio.totalCost, 0);
      const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      // Get recent reports count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentReportsCount = await AnalysisReport.countDocuments({
        analystId: session.user.id,
        createdAt: { $gte: thirtyDaysAgo },
        isActive: true
      });

      stats = {
        totalPortfolioValue,
        totalGainLoss,
        totalGainLossPercentage,
        portfolioCount: portfolios.length,
        recentReportsCount,
        assignedInvestorsCount: investorIds.length,
      };

    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
