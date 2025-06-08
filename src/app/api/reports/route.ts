import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AnalysisReport from '@/models/AnalysisReport';
import UserAnalyst from '@/models/UserAnalyst';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let reports;

    if (session.user.role === 'investor') {
      // Investors can only see their own reports
      reports = await AnalysisReport.find({ 
        investorId: session.user.id,
        isActive: true 
      })
      .populate('portfolioId', 'name')
      .populate('analystId', 'name email')
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 });

    } else if (session.user.role === 'analyst') {
      // Analysts can see reports for their assigned investors
      const assignments = await UserAnalyst.find({
        analystId: session.user.id,
        status: 'active'
      });

      const investorIds = assignments.map(assignment => assignment.investorId);
      
      reports = await AnalysisReport.find({
        investorId: { $in: investorIds },
        isActive: true
      })
      .populate('portfolioId', 'name')
      .populate('analystId', 'name email')
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 });

    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
