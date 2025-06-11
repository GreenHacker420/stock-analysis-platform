import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import User from '@/models/User';
import { mockPortfolios } from '@/data/mockPortfolios';
import { mockUsers } from '@/data/mockUsers';

// Helper function to check if database has portfolios
async function checkPortfolioStatus() {
  try {
    const portfolioCount = await Portfolio.countDocuments();
    const userCount = await User.countDocuments();

    return {
      hasUsers: userCount > 0,
      hasPortfolios: portfolioCount > 0,
      isEmpty: portfolioCount === 0 && userCount === 0
    };
  } catch (error) {
    console.error('Error checking portfolio database status:', error);
    return {
      hasUsers: false,
      hasPortfolios: false,
      isEmpty: true
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if database has portfolios
    const dbStatus = await checkPortfolioStatus();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // If database has portfolios, try to fetch from database
    if (dbStatus.hasPortfolios) {
      try {
        const portfolios = await Portfolio.find({
          isActive: true
        })
        .populate('investorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

        const total = await Portfolio.countDocuments({ isActive: true });

        return NextResponse.json({
          success: true,
          portfolios,
          source: 'database',
          pagination: {
            total,
            limit,
            skip,
            hasMore: skip + limit < total
          }
        });
      } catch (dbError) {
        console.error('Database query failed, falling back to mock data:', dbError);
      }
    }

    // Fallback to mock data
    console.log('Using mock portfolio data...');

    // Add user names to mock portfolios
    const portfoliosWithDetails = mockPortfolios.map(portfolio => {
      const investor = mockUsers.find(u => u.id === portfolio.investorId);

      return {
        ...portfolio,
        _id: portfolio.id,
        investorId: {
          _id: portfolio.investorId,
          name: investor?.name || 'Unknown',
          email: investor?.email || ''
        }
      };
    });

    return NextResponse.json({
      success: true,
      portfolios: portfoliosWithDetails,
      source: 'mock_data',
      pagination: {
        total: portfoliosWithDetails.length,
        limit: 50,
        skip: 0,
        hasMore: false
      }
    });

  } catch (error) {
    console.error('Error in portfolios API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, investorId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Portfolio name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let targetInvestorId = investorId;

    // If user is an investor, they can only create portfolios for themselves
    if (session.user.role === 'investor') {
      targetInvestorId = session.user.id;
    } else if (session.user.role === 'analyst') {
      // Analysts can create portfolios for their assigned investors
      if (!investorId) {
        return NextResponse.json(
          { error: 'Investor ID is required for analysts' },
          { status: 400 }
        );
      }

      // For demo purposes, allow analysts to create portfolios for any investor
      // In production, you would verify the analyst is assigned to this investor
    }

    // Verify the target investor exists
    const investor = await User.findById(targetInvestorId);
    if (!investor || investor.role !== 'investor') {
      return NextResponse.json(
        { error: 'Invalid investor' },
        { status: 400 }
      );
    }

    const portfolio = new Portfolio({
      investorId: targetInvestorId,
      name,
      description,
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercentage: 0,
      holdings: [],
      cash: 0,
      riskScore: 0,
      diversificationScore: 0,
      performanceMetrics: {
        dailyReturn: 0,
        weeklyReturn: 0,
        monthlyReturn: 0,
        yearlyReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
      },
    });

    await portfolio.save();

    const populatedPortfolio = await Portfolio.findById(portfolio._id)
      .populate('investorId', 'name email');

    return NextResponse.json({ portfolio: populatedPortfolio }, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
