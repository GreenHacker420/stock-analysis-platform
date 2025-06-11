'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { formatINR, formatPercentage } from '@/lib/currencyUtils';
import { 
  UserGroupIcon, 
  EyeIcon, 
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Import mock data
import { mockInvestors } from '@/data/mockUsers';
import { getPortfoliosByInvestorId, getTotalPortfolioValue } from '@/data/mockPortfolios';
import { getReportsByInvestorId } from '@/data/mockReports';

interface InvestorWithStats {
  id: string;
  name: string;
  email: string;
  image?: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  stats: {
    totalPortfolioValue: number;
    portfolioCount: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
    reportsCount: number;
    lastReportDate?: Date;
  };
}

export default function InvestorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();
  const [investors, setInvestors] = useState<InvestorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'performance' | 'lastLogin'>('name');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'analyst') {
      router.push('/dashboard');
      return;
    }

    // Load investor data with statistics
    const loadInvestors = () => {
      const investorsWithStats: InvestorWithStats[] = mockInvestors.map(investor => {
        const portfolios = getPortfoliosByInvestorId(investor.id);
        const reports = getReportsByInvestorId(investor.id);
        
        const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
        const totalCost = portfolios.reduce((sum, p) => sum + p.totalCost, 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
        
        const lastReport = reports.length > 0 
          ? new Date(Math.max(...reports.map(r => new Date(r.createdAt).getTime())))
          : undefined;

        return {
          id: investor.id,
          name: investor.name,
          email: investor.email,
          image: investor.image,
          isActive: investor.isActive,
          lastLogin: investor.lastLogin ? new Date(investor.lastLogin) : undefined,
          preferences: investor.preferences,
          stats: {
            totalPortfolioValue: totalValue,
            portfolioCount: portfolios.length,
            totalGainLoss,
            totalGainLossPercentage,
            reportsCount: reports.length,
            lastReportDate: lastReport,
          }
        };
      });

      setInvestors(investorsWithStats);
      setLoading(false);
    };

    loadInvestors();
  }, [session, status, router]);

  // Filter and sort investors
  const filteredAndSortedInvestors = investors
    .filter(investor => {
      const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investor.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || investor.preferences.riskTolerance === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value':
          return b.stats.totalPortfolioValue - a.stats.totalPortfolioValue;
        case 'performance':
          return b.stats.totalGainLossPercentage - a.stats.totalGainLossPercentage;
        case 'lastLogin':
          const aLogin = a.lastLogin?.getTime() || 0;
          const bLogin = b.lastLogin?.getTime() || 0;
          return bLogin - aLogin;
        default:
          return 0;
      }
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return isDark ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100';
      case 'medium':
        return isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-100';
      case 'high':
        return isDark ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-100';
      default:
        return isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-700 bg-gray-100';
    }
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
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
                My Clients
              </h1>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Manage and analyze your investor clients' portfolios
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>

          {/* Filters and Search */}
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4">
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
                    placeholder="Search clients..."
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

              {/* Risk Filter */}
              <div className="sm:w-48">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value as any)}
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="name">Sort by Name</option>
                  <option value="value">Sort by Portfolio Value</option>
                  <option value="performance">Sort by Performance</option>
                  <option value="lastLogin">Sort by Last Login</option>
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
                <UserGroupIcon className={`h-8 w-8 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total Clients
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {filteredAndSortedInvestors.length}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <BanknotesIcon className={`h-8 w-8 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total AUM
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatINR(
                      filteredAndSortedInvestors.reduce((sum, inv) => sum + inv.stats.totalPortfolioValue, 0),
                      { compact: true }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <ChartBarIcon className={`h-8 w-8 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
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
                      filteredAndSortedInvestors.length > 0
                        ? filteredAndSortedInvestors.reduce((sum, inv) => sum + inv.stats.totalGainLossPercentage, 0) / filteredAndSortedInvestors.length
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
                <UserIcon className={`h-8 w-8 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Active Clients
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {filteredAndSortedInvestors.filter(inv => inv.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Investors Grid */}
          {filteredAndSortedInvestors.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className={`mx-auto h-12 w-12 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`mt-2 text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>No clients found</h3>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchTerm || riskFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first client.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedInvestors.map((investor) => (
                <div key={investor.id} className={`rounded-lg shadow hover:shadow-md transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                    : 'bg-white hover:shadow-lg'
                }`}>
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {investor.image ? (
                          <img
                            src={investor.image}
                            alt={investor.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <UserIcon className={`h-6 w-6 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                          </div>
                        )}
                        <div className="ml-3">
                          <h3 className={`text-lg font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {investor.name}
                          </h3>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {investor.email}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getRiskColor(investor.preferences.riskTolerance)
                      }`}>
                        {investor.preferences.riskTolerance} risk
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Portfolio Value</span>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatINR(investor.stats.totalPortfolioValue, { compact: true })}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Performance</span>
                        <span className={`text-sm font-medium flex items-center ${
                          investor.stats.totalGainLoss >= 0 
                            ? 'text-green-500 dark:text-green-400' 
                            : 'text-red-500 dark:text-red-400'
                        }`}>
                          {investor.stats.totalGainLoss >= 0 ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                          )}
                          {formatPercentage(investor.stats.totalGainLossPercentage)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Portfolios</span>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {investor.stats.portfolioCount}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Reports</span>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {investor.stats.reportsCount}
                        </span>
                      </div>

                      {investor.lastLogin && (
                        <div className="flex justify-between">
                          <span className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>Last Login</span>
                          <span className={`text-sm font-medium flex items-center ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {investor.lastLogin.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex space-x-3">
                      <button 
                        onClick={() => router.push(`/portfolios?investor=${investor.id}`)}
                        className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <ChartBarIcon className="w-4 h-4 inline mr-1" />
                        View Portfolios
                      </button>
                      <button 
                        onClick={() => router.push(`/reports?investor=${investor.id}`)}
                        className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <EyeIcon className="w-4 h-4 inline mr-1" />
                        Reports
                      </button>
                    </div>
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
