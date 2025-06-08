'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
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
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Gain/Loss',
      value: stats ? `$${stats.totalGainLoss.toLocaleString()}` : '$0',
      icon: stats && stats.totalGainLoss >= 0 ? TrendingUpIcon : TrendingDownIcon,
      color: stats && stats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats && stats.totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100',
      subtitle: stats ? `${stats.totalGainLossPercentage.toFixed(2)}%` : '0%',
    },
    {
      name: session?.user?.role === 'analyst' ? 'Assigned Investors' : 'Portfolios',
      value: session?.user?.role === 'analyst' 
        ? (stats?.assignedInvestorsCount || 0).toString()
        : (stats?.portfolioCount || 0).toString(),
      icon: session?.user?.role === 'analyst' ? UserGroupIcon : ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Recent Reports',
      value: (stats?.recentReportsCount || 0).toString(),
      icon: DocumentTextIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's an overview of your {session?.user?.role === 'analyst' ? 'assigned portfolios' : 'investment portfolio'}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      {stat.subtitle && (
                        <div className={`ml-2 text-sm font-medium ${
                          stat.subtitle.startsWith('-') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {stat.subtitle}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {session?.user?.role === 'investor' ? (
            <>
              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <ChartBarIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Create New Portfolio
                </span>
              </button>
              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Generate Analysis
                </span>
              </button>
            </>
          ) : (
            <>
              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <UserGroupIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Manage Investors
                </span>
              </button>
              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Create Report
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
