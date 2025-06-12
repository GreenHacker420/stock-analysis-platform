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

// Helper function to check if database has data
async function checkDatabaseStatus() {
  try {
    const reportCount = await AnalysisReport.countDocuments();
    const userCount = await User.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();

    return {
      hasUsers: userCount > 0,
      hasPortfolios: portfolioCount > 0,
      hasReports: reportCount > 0,
      isEmpty: reportCount === 0 && userCount === 0 && portfolioCount === 0
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return {
      hasUsers: false,
      hasPortfolios: false,
      hasReports: false,
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

    // Check if database has data
    const dbStatus = await checkDatabaseStatus();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // If database has reports, try to fetch from database
    if (dbStatus.hasReports) {
      try {
        let query: any = { isActive: true };

        if (portfolioId) query.portfolioId = portfolioId;
        if (status) query.status = status;

        const reports = await AnalysisReport.find(query)
          .populate('portfolioId', 'name')
          .populate('analystId', 'name email')
          .populate('investorId', 'name email')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip);

        const total = await AnalysisReport.countDocuments({ isActive: true });

        return NextResponse.json({
          success: true,
          reports,
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
    console.log('Using mock data for reports...');

    let filteredReports = mockAnalysisReports;

    // Apply basic filtering for fallback
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
        // Add metadata property that the frontend expects
        metadata: {
          confidence: report.riskAssessment?.riskScore || 75, // Use risk score as confidence or default to 75
          aiModel: 'Gemini-1.5-Pro',
        },
        // Add validUntil property that the frontend expects
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: true
      };
    });

    return NextResponse.json({
      success: true,
      reports: reportsWithDetails,
      source: 'mock_data',
      pagination: {
        total: reportsWithDetails.length,
        limit: 50,
        skip: 0,
        hasMore: false
      }
    });

  } catch (error) {
    console.error('Error in reports API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
