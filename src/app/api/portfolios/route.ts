import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import User from '@/models/User';
import { mockPortfolios } from '@/data/mockPortfolios';
import { mockUsers } from '@/data/mockUsers';

// Helper function to check if database needs seeding for portfolios
async function checkAndSeedPortfolios() {
  try {
    const portfolioCount = await Portfolio.countDocuments();
    const userCount = await User.countDocuments();

    // If database is empty, trigger seeding
    if (portfolioCount === 0 || userCount === 0) {
      console.log('Portfolio database appears empty, triggering automatic seeding...');

      // Seed users first if needed
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

      console.log('Portfolio automatic seeding completed');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error during portfolio automatic seeding:', error);
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
    await checkAndSeedPortfolios();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    let portfolios;

    if (session.user.role === 'investor') {
      // For demo purposes, show all portfolios (in production, filter by investorId)
      portfolios = await Portfolio.find({
        isActive: true
      })
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    } else if (session.user.role === 'analyst') {
      // For demo purposes, show all portfolios (in production, filter by assigned investors)
      portfolios = await Portfolio.find({
        isActive: true
      })
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    const total = await Portfolio.countDocuments({ isActive: true });

    return NextResponse.json({
      success: true,
      portfolios,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);

    // Fallback to mock data if database fails
    console.log('Falling back to mock portfolio data...');

    try {
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
        fallback: true,
        pagination: {
          total: portfoliosWithDetails.length,
          limit: 50,
          skip: 0,
          hasMore: false
        }
      });

    } catch (fallbackError) {
      console.error('Fallback to mock portfolio data also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to fetch portfolios and fallback failed' },
        { status: 500 }
      );
    }
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
