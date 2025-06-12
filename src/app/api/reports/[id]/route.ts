import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AnalysisReport from '@/models/AnalysisReport';
import { mockAnalysisReports } from '@/data/mockReports';
import { mockUsers } from '@/data/mockUsers';
import { mockPortfolios } from '@/data/mockPortfolios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    await connectDB();

    // Try to fetch from database first
    try {
      const report = await AnalysisReport.findById(reportId)
        .populate('portfolioId', 'name')
        .populate('analystId', 'name email')
        .populate('investorId', 'name email');

      if (report) {
        return NextResponse.json({
          success: true,
          report,
          source: 'database'
        });
      }
    } catch (dbError) {
      console.error('Database query failed, falling back to mock data:', dbError);
    }

    // Fallback to mock data
    console.log('Using mock data for report detail...');
    
    const mockReport = mockAnalysisReports.find(r => r.id === reportId);
    
    if (!mockReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Add user and portfolio details to mock report
    const analyst = mockUsers.find(u => u.id === mockReport.analystId);
    const investor = mockUsers.find(u => u.id === mockReport.investorId);
    const portfolio = mockPortfolios.find(p => p.id === mockReport.portfolioId);

    const reportWithDetails = {
      ...mockReport,
      _id: mockReport.id,
      analystId: {
        _id: mockReport.analystId,
        name: analyst?.name || 'Unknown',
        email: analyst?.email || ''
      },
      investorId: {
        _id: mockReport.investorId,
        name: investor?.name || 'Unknown',
        email: investor?.email || ''
      },
      portfolioId: portfolio ? {
        _id: mockReport.portfolioId,
        name: portfolio.name
      } : null,
      // Add metadata property that the frontend expects
      metadata: {
        confidence: mockReport.riskAssessment?.riskScore || 75,
        aiModel: 'Gemini-2.0-Flash',
      },
      // Add validUntil property that the frontend expects
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      // Add detailed analysis content
      aiAnalysis: `
## Portfolio Performance Analysis

This comprehensive analysis of the ${portfolio?.name || 'portfolio'} reveals several key insights:

### Current Market Position
The portfolio demonstrates a balanced approach to Indian equity markets with strategic positioning across multiple sectors. Current holdings show:

- **Technology Sector**: Strong representation with quality stocks showing consistent growth patterns
- **Financial Services**: Well-diversified exposure to both private and public sector banks
- **Consumer Goods**: Defensive positioning with established market leaders

### Risk Assessment
Based on current market conditions and portfolio composition:

**Overall Risk Level**: ${mockReport.riskAssessment?.overallRisk || 'Medium'}
**Risk Score**: ${mockReport.riskAssessment?.riskScore || 75}/100
**Market Correlation**: Moderate correlation with Nifty 50 index

### Technical Analysis Summary
Recent technical indicators suggest:
- RSI levels indicate neither overbought nor oversold conditions
- Moving averages show sustained upward momentum
- Volume patterns support current price trends

### Recommendations
1. **Maintain Current Allocation**: The portfolio shows good sector diversification
2. **Monitor Market Volatility**: Keep track of global market sentiment impacts
3. **Rebalancing Opportunity**: Consider minor adjustments in the next quarter
4. **Risk Management**: Current stop-loss levels are appropriate

### Market Outlook
The Indian equity markets continue to show resilience with:
- Strong domestic consumption patterns
- Favorable government policies
- Robust corporate earnings growth
- Increasing foreign institutional investment

This analysis is generated using advanced AI models and should be considered alongside traditional financial analysis methods.
      `,
      isActive: true
    };

    return NextResponse.json({
      success: true,
      report: reportWithDetails,
      source: 'mock_data'
    });

  } catch (error) {
    console.error('Error in report detail API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
