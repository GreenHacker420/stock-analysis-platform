'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// Import our new 3D and advanced chart components
import Portfolio3DChart from '@/components/charts/3D/Portfolio3DChart';
import StockPerformanceCubes from '@/components/charts/3D/StockPerformanceCubes';
import MarketGlobe from '@/components/charts/3D/MarketGlobe';
import RiskPyramid from '@/components/charts/3D/RiskPyramid';
import StockChart from '@/components/charts/StockChart';
import ScatterPlot3D from '@/components/charts/3D/ScatterPlot3D';
import AnimatedLineChart from '@/components/charts/AnimatedLineChart';
import HeatmapChart from '@/components/charts/HeatmapChart';
import CorrelationMatrix from '@/components/charts/CorrelationMatrix';
import ChartExport from '@/components/charts/ChartExport';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardStats {
  totalPortfolioValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  portfolioCount: number;
  recentReportsCount: number;
  assignedInvestorsCount?: number; // For analysts
}

const DashboardOverview = () => {
  const { data: session } = useSession();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demonstrations
  const samplePortfolioData = [
    { symbol: 'AAPL', name: 'Apple Inc.', value: 50000, percentage: 25, color: '#1f77b4', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', value: 40000, percentage: 20, color: '#ff7f0e', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', value: 35000, percentage: 17.5, color: '#2ca02c', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc.', value: 30000, percentage: 15, color: '#d62728', sector: 'Automotive' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', value: 25000, percentage: 12.5, color: '#9467bd', sector: 'E-commerce' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', value: 20000, percentage: 10, color: '#8c564b', sector: 'Technology' }
  ];

  const sampleStockPerformance = [
    { symbol: 'AAPL', name: 'Apple Inc.', performance: 5.2, volume: 89000000, marketCap: 2800000000000, price: 175.43 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', performance: -2.1, volume: 45000000, marketCap: 1600000000000, price: 2750.12 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', performance: 3.8, volume: 67000000, marketCap: 2400000000000, price: 320.85 },
    { symbol: 'TSLA', name: 'Tesla Inc.', performance: -8.5, volume: 120000000, marketCap: 800000000000, price: 245.67 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', performance: 1.2, volume: 78000000, marketCap: 1200000000000, price: 3180.45 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', performance: 12.3, volume: 95000000, marketCap: 1100000000000, price: 450.23 }
  ];

  const sampleRiskData = [
    { level: 'Conservative', description: 'Low-risk investments', percentage: 30, value: 60000, color: '#10b981', riskScore: 2 },
    { level: 'Moderate', description: 'Balanced risk-return', percentage: 45, value: 90000, color: '#f59e0b', riskScore: 3 },
    { level: 'Aggressive', description: 'High-risk, high-reward', percentage: 20, value: 40000, color: '#ef4444', riskScore: 4 },
    { level: 'Speculative', description: 'Very high risk', percentage: 5, value: 10000, color: '#8b5cf6', riskScore: 5 }
  ];

  const sampleScatterData = [
    { symbol: 'AAPL', name: 'Apple Inc.', risk: 35, return: 15.2, marketCap: 2800000000000, sector: 'Technology', color: '#1f77b4' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', risk: 45, return: 12.8, marketCap: 1600000000000, sector: 'Technology', color: '#ff7f0e' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', risk: 30, return: 18.5, marketCap: 2400000000000, sector: 'Technology', color: '#2ca02c' },
    { symbol: 'TSLA', name: 'Tesla Inc.', risk: 75, return: 25.3, marketCap: 800000000000, sector: 'Automotive', color: '#d62728' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', risk: 50, return: 14.7, marketCap: 1200000000000, sector: 'E-commerce', color: '#9467bd' }
  ];

  const sampleLineData = [
    {
      name: 'Portfolio Value',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        value: 200000 + Math.random() * 50000 + i * 1000,
        volume: Math.random() * 1000000
      })),
      color: '#3b82f6',
      fillGradient: true
    }
  ];

  const sampleHeatmapData = [
    { sector: 'Technology', metric: 'Performance', value: 8.5, displayValue: '8.5%' },
    { sector: 'Technology', metric: 'Volume', value: 6.2, displayValue: '6.2M' },
    { sector: 'Technology', metric: 'Volatility', value: 4.1, displayValue: '4.1%' },
    { sector: 'Healthcare', metric: 'Performance', value: 3.2, displayValue: '3.2%' },
    { sector: 'Healthcare', metric: 'Volume', value: 2.8, displayValue: '2.8M' },
    { sector: 'Healthcare', metric: 'Volatility', value: 2.5, displayValue: '2.5%' },
    { sector: 'Finance', metric: 'Performance', value: -1.5, displayValue: '-1.5%' },
    { sector: 'Finance', metric: 'Volume', value: 4.5, displayValue: '4.5M' },
    { sector: 'Finance', metric: 'Volatility', value: 6.8, displayValue: '6.8%' }
  ];

  const sampleCorrelationData = [
    { stock1: 'AAPL', stock2: 'MSFT', correlation: 0.75, significance: 'high' as const },
    { stock1: 'AAPL', stock2: 'GOOGL', correlation: 0.68, significance: 'high' as const },
    { stock1: 'AAPL', stock2: 'TSLA', correlation: 0.32, significance: 'medium' as const },
    { stock1: 'MSFT', stock2: 'GOOGL', correlation: 0.82, significance: 'high' as const },
    { stock1: 'MSFT', stock2: 'TSLA', correlation: 0.28, significance: 'medium' as const },
    { stock1: 'GOOGL', stock2: 'TSLA', correlation: 0.15, significance: 'low' as const }
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`overflow-hidden shadow rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Portfolio Value',
      value: stats ? `$${stats.totalPortfolioValue.toLocaleString()}` : '$0',
      icon: CurrencyDollarIcon,
      color: 'text-blue-600',
      bgColor: isDark ? 'bg-blue-900/50' : 'bg-blue-100',
    },
    {
      name: 'Total Gain/Loss',
      value: stats ? `$${stats.totalGainLoss.toLocaleString()}` : '$0',
      icon: stats && stats.totalGainLoss >= 0 ? TrendingUpIcon : TrendingDownIcon,
      color: stats && stats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats && stats.totalGainLoss >= 0
        ? (isDark ? 'bg-green-900/50' : 'bg-green-100')
        : (isDark ? 'bg-red-900/50' : 'bg-red-100'),
      subtitle: stats ? `${stats.totalGainLossPercentage.toFixed(2)}%` : '0%',
    },
    {
      name: session?.user?.role === 'analyst' ? 'Assigned Investors' : 'Portfolios',
      value: session?.user?.role === 'analyst'
        ? (stats?.assignedInvestorsCount || 0).toString()
        : (stats?.portfolioCount || 0).toString(),
      icon: session?.user?.role === 'analyst' ? UserGroupIcon : ChartBarIcon,
      color: 'text-purple-600',
      bgColor: isDark ? 'bg-purple-900/50' : 'bg-purple-100',
    },
    {
      name: 'Recent Reports',
      value: (stats?.recentReportsCount || 0).toString(),
      icon: DocumentTextIcon,
      color: 'text-orange-600',
      bgColor: isDark ? 'bg-orange-900/50' : 'bg-orange-100',
    },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: '3d-charts', name: '3D Visualizations', icon: CurrencyDollarIcon },
    { id: 'advanced-charts', name: 'Advanced Charts', icon: TrendingUpIcon },
    { id: 'analytics', name: 'Analytics', icon: DocumentTextIcon },
  ];

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* Header with theme toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {session?.user?.name}
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Advanced analytics dashboard with 3D visualizations and AI insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle showLabel />
          <ChartExport
            chartRef={dashboardRef as React.RefObject<HTMLElement>}
            filename="dashboard"
            title="Stock Analysis Dashboard"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`overflow-hidden shadow-lg rounded-xl backdrop-blur-sm border ${
              isDark
                ? 'bg-gray-800/80 border-gray-700'
                : 'bg-white/80 border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </div>
                      {stat.subtitle && (
                        <div className={`ml-2 text-sm font-medium ${
                          stat.subtitle.startsWith('-') ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {stat.subtitle}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Portfolio3DChart
              data={samplePortfolioData}
              totalValue={200000}
              className="lg:col-span-1"
            />
            <AnimatedLineChart
              lines={sampleLineData}
              title="Portfolio Performance"
              yAxisLabel="Value ($)"
              showVolume={true}
              className="lg:col-span-1"
            />
          </div>
        )}

        {activeTab === '3d-charts' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Portfolio3DChart
                data={samplePortfolioData}
                totalValue={200000}
              />
              <StockPerformanceCubes
                data={sampleStockPerformance}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MarketGlobe
                data={[]}
              />
              <RiskPyramid
                data={sampleRiskData}
                totalValue={200000}
              />
            </div>
            <ScatterPlot3D
              data={sampleScatterData}
            />
          </div>
        )}

        {activeTab === 'advanced-charts' && (
          <div className="space-y-8">
            <StockChart
              symbol="AAPL"
              height={500}
              period="3mo"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HeatmapChart
                data={sampleHeatmapData}
                title="Sector Performance Heatmap"
                colorScheme="performance"
              />
              <CorrelationMatrix
                data={sampleCorrelationData}
                stocks={['AAPL', 'MSFT', 'GOOGL', 'TSLA']}
                title="Stock Correlation Matrix"
                showSignificance={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`p-6 rounded-xl backdrop-blur-sm border ${
                isDark
                  ? 'bg-gray-800/80 border-gray-700'
                  : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  AI Insights
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}>
                    <p className={`text-sm ${
                      isDark ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      Portfolio shows strong diversification across tech sector
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-green-900/30' : 'bg-green-50'
                  }`}>
                    <p className={`text-sm ${
                      isDark ? 'text-green-200' : 'text-green-800'
                    }`}>
                      Risk-adjusted returns are above market average
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'
                  }`}>
                    <p className={`text-sm ${
                      isDark ? 'text-yellow-200' : 'text-yellow-800'
                    }`}>
                      Consider rebalancing towards defensive sectors
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl backdrop-blur-sm border ${
                isDark
                  ? 'bg-gray-800/80 border-gray-700'
                  : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Market Sentiment
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Overall Market
                    </span>
                    <span className="text-sm font-medium text-green-500">Bullish</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Tech Sector
                    </span>
                    <span className="text-sm font-medium text-green-500">Strong</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Volatility
                    </span>
                    <span className="text-sm font-medium text-yellow-500">Moderate</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl backdrop-blur-sm border ${
                isDark
                  ? 'bg-gray-800/80 border-gray-700'
                  : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {session?.user?.role === 'investor' ? (
                    <>
                      <button className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                        isDark
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}>
                        <ChartBarIcon className="mx-auto h-6 w-6 mb-2" />
                        <span className="block text-sm font-medium">
                          Create Portfolio
                        </span>
                      </button>
                      <button className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                        isDark
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}>
                        <DocumentTextIcon className="mx-auto h-6 w-6 mb-2" />
                        <span className="block text-sm font-medium">
                          Generate Analysis
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                        isDark
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}>
                        <UserGroupIcon className="mx-auto h-6 w-6 mb-2" />
                        <span className="block text-sm font-medium">
                          Manage Investors
                        </span>
                      </button>
                      <button className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                        isDark
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}>
                        <DocumentTextIcon className="mx-auto h-6 w-6 mb-2" />
                        <span className="block text-sm font-medium">
                          Create Report
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
