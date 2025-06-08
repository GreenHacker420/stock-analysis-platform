import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import User from '@/models/User';
import UserAnalyst from '@/models/UserAnalyst';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let portfolios;

    if (session.user.role === 'investor') {
      // Investors can only see their own portfolios
      portfolios = await Portfolio.find({ 
        investorId: session.user.id,
        isActive: true 
      }).populate('investorId', 'name email');
    } else if (session.user.role === 'analyst') {
      // Analysts can see portfolios of their assigned investors
      const assignments = await UserAnalyst.find({
        analystId: session.user.id,
        status: 'active'
      });

      const investorIds = assignments.map(assignment => assignment.investorId);
      
      portfolios = await Portfolio.find({
        investorId: { $in: investorIds },
        isActive: true
      }).populate('investorId', 'name email');
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

      // Verify the analyst is assigned to this investor
      const assignment = await UserAnalyst.findOne({
        analystId: session.user.id,
        investorId: investorId,
        status: 'active'
      });

      if (!assignment) {
        return NextResponse.json(
          { error: 'Not authorized to create portfolio for this investor' },
          { status: 403 }
        );
      }
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
