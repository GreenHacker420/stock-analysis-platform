'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { formatINR, formatPercentage } from '@/lib/currencyUtils';
import {
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  TagIcon,
  ShareIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
  CpuChipIcon,
  LightBulbIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Import mock data
import { mockAnalysisReports, getReportsByAnalystId, getReportsByInvestorId, getReportsByPortfolioId, getPublishedReports } from '@/data/mockReports';
import { mockUsers } from '@/data/mockUsers';
import { mockPortfolios } from '@/data/mockPortfolios';

interface ReportWithDetails {
  id: string;
  title: string;
  summary: string;
  content: string;
  recommendations: any[];
  riskAssessment: any;
  performanceMetrics: any;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  isShared: boolean;
  analystId: string;
  analystName: string;
  investorId: string;
  investorName: string;
  portfolioId?: string;
  portfolioName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark } = useTheme();
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'performance' | 'risk'>('date');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showAIInsights, setShowAIInsights] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadReports();
  }, [session, status, router]);

  const loadReports = async () => {
    try {
      // First try to fetch from API
      const portfolioParam = searchParams.get('portfolio');
      const investorParam = searchParams.get('investor');

      let apiUrl = '/api/reports?limit=50';
      if (portfolioParam) apiUrl += `&portfolioId=${portfolioParam}`;
      if (statusFilter !== 'all') apiUrl += `&status=${statusFilter}`;

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.reports) {
          // Transform API data to match our interface
          const reportsData = data.reports.map((report: any) => ({
            id: report._id || report.id,
            title: report.title,
            summary: report.summary,
            content: report.content,
            recommendations: report.recommendations || [],
            riskAssessment: report.riskAssessment || { overallRisk: 'medium', riskScore: 50, factors: [], mitigation: [] },
            performanceMetrics: report.performanceMetrics || { totalReturn: 0, benchmarkReturn: 0, alpha: 0, beta: 1, sharpeRatio: 0, maxDrawdown: 0, volatility: 0 },
            status: report.status,
            tags: report.tags || [],
            isShared: report.isShared || false,
            analystId: report.analystId?._id || report.analystId,
            analystName: report.analystId?.name || 'AI Assistant',
            investorId: report.investorId?._id || report.investorId,
            investorName: report.investorId?.name || 'Unknown',
            portfolioId: report.portfolioId?._id || report.portfolioId,
            portfolioName: report.portfolioId?.name || 'Unknown Portfolio',
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
          }));

          setReports(reportsData);
          console.log(`Loaded ${reportsData.length} reports from API${data.fallback ? ' (fallback mode)' : ''}`);
          return;
        }
      }

      // Fallback to mock data if API fails
      console.log('API failed, falling back to mock data...');
      let reportsData = [];

      if (session?.user.role === 'analyst') {
        reportsData = mockAnalysisReports
          .map(report => {
            const investor = mockUsers.find(user => user.id === report.investorId);
            const portfolio = mockPortfolios.find(p => p.id === report.portfolioId);
            const analyst = mockUsers.find(user => user.id === report.analystId);

            return {
              ...report,
              analystName: analyst?.name || session?.user?.name || 'AI Assistant',
              investorName: investor?.name || 'Unknown',
              portfolioName: portfolio?.name || 'Unknown Portfolio',
            } as unknown as ReportWithDetails;
          });
      } else {
        reportsData = mockAnalysisReports
          .map(report => {
            const analyst = mockUsers.find(user => user.id === report.analystId);
            const portfolio = mockPortfolios.find(p => p.id === report.portfolioId);
            const investor = mockUsers.find(user => user.id === report.investorId);

            return {
              ...report,
              analystName: analyst?.name || 'AI Assistant',
              investorName: investor?.name || session?.user?.name || 'Unknown',
              portfolioName: portfolio?.name || 'Unknown Portfolio',
            } as unknown as ReportWithDetails;
          });
      }

      // Apply filters for fallback data
      if (portfolioParam) {
        reportsData = reportsData.filter(r => r.portfolioId === portfolioParam);
      }

      if (investorParam && session?.user.role === 'analyst') {
        reportsData = reportsData.filter(r => r.investorId === investorParam);
      }

      setReports(reportsData);
      console.log(`Loaded ${reportsData.length} reports from mock data (fallback)`);

    } catch (error) {
      console.error('Error loading reports:', error);

      // Final fallback to empty array
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.portfolioName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesTag = selectedTag === 'all' || report.tags.includes(selectedTag);
      return matchesSearch && matchesStatus && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'performance':
          return b.performanceMetrics.totalReturn - a.performanceMetrics.totalReturn;
        case 'risk':
          return b.riskAssessment.riskScore - a.riskAssessment.riskScore;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return isDark
          ? 'bg-green-900/50 text-green-300 border border-green-700'
          : 'bg-green-100 text-green-800';
      case 'draft':
        return isDark
          ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
          : 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return isDark
          ? 'bg-gray-700 text-gray-300 border border-gray-600'
          : 'bg-gray-100 text-gray-800';
      default:
        return isDark
          ? 'bg-gray-700 text-gray-300 border border-gray-600'
          : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft':
        return <PencilIcon className="w-4 h-4" />;
      case 'archived':
        return <ArchiveBoxIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 30) {
      return isDark ? 'text-green-400' : 'text-green-600';
    } else if (riskScore <= 60) {
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return isDark ? 'text-red-400' : 'text-red-600';
    }
  };

  const getAllTags = () => {
    const allTags = reports.flatMap(report => report.tags);
    return [...new Set(allTags)];
  };

  const generateAIInsight = () => {
    const insights = [
      "📈 Portfolio performance is trending 15% above market average this quarter",
      "⚠️ High concentration in technology sector detected - consider diversification",
      "💡 Optimal rebalancing opportunity identified for Q2 2024",
      "🎯 Risk-adjusted returns suggest increasing allocation to defensive stocks",
      "📊 Current portfolio beta of 1.2 indicates higher volatility than market",
      "🔍 ESG-focused investments showing 8% outperformance vs traditional holdings"
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  };

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Navigation />
        <div className="max-w-[1600px] mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className={`h-8 rounded w-1/4 mb-6 ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`rounded-lg shadow p-6 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className={`h-6 rounded w-3/4 mb-4 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}></div>
                    <div className={`h-4 rounded w-1/2 mb-2 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}></div>
                    <div className={`h-4 rounded w-2/3 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navigation />
      <main className="max-w-[1600px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                AI Analysis Reports
              </h1>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {session?.user?.role === 'analyst'
                  ? `${filteredAndSortedReports.length} reports generated for your clients`
                  : `${filteredAndSortedReports.length} AI-powered insights for your portfolios`
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* AI Insights Toggle */}
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 ${
                  showAIInsights
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                AI Insights
              </button>

              {session?.user?.role === 'analyst' && (
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          {showAIInsights && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isDark ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-start">
                <CpuChipIcon className={`w-6 h-6 mr-3 mt-0.5 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    isDark ? 'text-purple-300' : 'text-purple-800'
                  }`}>
                    AI Market Intelligence
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-purple-200' : 'text-purple-700'
                  }`}>
                    {generateAIInsight()}
                  </p>
                  <button className={`mt-2 text-xs font-medium ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                  }`}>
                    View detailed analysis →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Tags</option>
                  {getAllTags().map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="performance">Sort by Performance</option>
                  <option value="risk">Sort by Risk Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <DocumentTextIcon className={`h-8 w-8 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total Reports
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {filteredAndSortedReports.length}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <ArrowTrendingUpIcon className={`h-8 w-8 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Avg Performance
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatPercentage(
                      filteredAndSortedReports.length > 0
                        ? filteredAndSortedReports.reduce((sum, r) => sum + r.performanceMetrics.totalReturn, 0) / filteredAndSortedReports.length
                        : 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <ExclamationTriangleIcon className={`h-8 w-8 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Avg Risk Score
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {filteredAndSortedReports.length > 0
                      ? Math.round(filteredAndSortedReports.reduce((sum, r) => sum + r.riskAssessment.riskScore, 0) / filteredAndSortedReports.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <CheckCircleIcon className={`h-8 w-8 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Published
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {filteredAndSortedReports.filter(r => r.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Display */}
          {filteredAndSortedReports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className={`mx-auto h-12 w-12 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`mt-2 text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>No reports found</h3>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchTerm || statusFilter !== 'all' || selectedTag !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : session?.user?.role === 'analyst'
                    ? 'Generate your first AI analysis report for a client portfolio.'
                    : 'No analysis reports have been generated for your portfolios yet.'
                }
              </p>
              {session?.user?.role === 'analyst' && (
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate AI Report
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAndSortedReports.map((report) => (
                <div key={report.id} className={`rounded-lg shadow hover:shadow-md transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                    : 'bg-white hover:shadow-lg'
                }`}>
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {report.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </span>
                          {report.isShared && (
                            <ShareIcon className={`w-4 h-4 ${
                              isDark ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                          )}
                        </div>

                        <p className={`text-sm mb-3 line-clamp-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {report.summary}
                        </p>

                        {/* Tags */}
                        {report.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {report.tags.map(tag => (
                              <span key={tag} className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                <TagIcon className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/reports/${report.id}`)}
                          className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isDark
                              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-offset-gray-800'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-offset-white'
                          }`}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Report
                        </button>
                      </div>
                    </div>

                    {/* Report Details Grid */}
                    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div>
                        <span className="font-medium">Portfolio:</span>
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {report.portfolioName}
                        </p>
                      </div>

                      {session?.user?.role === 'analyst' && (
                        <div>
                          <span className="font-medium">Client:</span>
                          <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {report.investorName}
                          </p>
                        </div>
                      )}

                      {session?.user?.role === 'investor' && (
                        <div>
                          <span className="font-medium">Analyst:</span>
                          <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {report.analystName}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="font-medium">Performance:</span>
                        <p className={`mt-1 font-medium ${
                          report.performanceMetrics.totalReturn >= 0
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}>
                          {formatPercentage(report.performanceMetrics.totalReturn)}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Risk Score:</span>
                        <p className={`mt-1 font-medium ${getRiskColor(report.riskAssessment.riskScore)}`}>
                          {report.riskAssessment.riskScore}/100
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Created:</span>
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Recommendations:</span>
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {report.recommendations.length} actions
                        </p>
                      </div>
                    </div>

                    {/* AI Insights Preview */}
                    {report.recommendations.length > 0 && (
                      <div className={`mt-4 p-3 rounded-lg border ${
                        isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start">
                          <LightBulbIcon className={`w-5 h-5 mr-2 mt-0.5 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              isDark ? 'text-blue-300' : 'text-blue-800'
                            }`}>
                              Key AI Recommendations
                            </h4>
                            <div className="mt-2 space-y-1">
                              {report.recommendations.slice(0, 2).map((rec, index) => (
                                <div key={index} className={`text-xs ${
                                  isDark ? 'text-blue-200' : 'text-blue-700'
                                }`}>
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${
                                    rec.type === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                    rec.type === 'sell' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                    rec.type === 'hold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                  }`}>
                                    {rec.type.toUpperCase()}
                                  </span>
                                  {rec.symbol} - {rec.reasoning.substring(0, 60)}...
                                </div>
                              ))}
                              {report.recommendations.length > 2 && (
                                <p className={`text-xs ${
                                  isDark ? 'text-blue-300' : 'text-blue-600'
                                }`}>
                                  +{report.recommendations.length - 2} more recommendations
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}