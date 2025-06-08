'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Portfolio {
  _id: string;
  name: string;
  description?: string;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: any[];
  cash: number;
  lastAnalyzed?: string;
  investorId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function PortfoliosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchPortfolios();
  }, [session, status, router]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolios');
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.portfolios);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {session.user.role === 'analyst' ? 'Client Portfolios' : 'My Portfolios'}
            </h1>
            {session.user.role === 'investor' && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Portfolio
              </button>
            )}
          </div>

          {portfolios.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {session.user.role === 'analyst' 
                  ? 'No client portfolios assigned to you yet.'
                  : 'Get started by creating your first portfolio.'
                }
              </p>
              {session.user.role === 'investor' && (
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Portfolio
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <div key={portfolio._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {portfolio.name}
                      </h3>
                      <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    {session.user.role === 'analyst' && (
                      <p className="text-sm text-gray-600 mb-2">
                        Client: {portfolio.investorId.name}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Value</span>
                        <span className="text-sm font-medium text-gray-900">
                          ${portfolio.totalValue.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Gain/Loss</span>
                        <span className={`text-sm font-medium ${
                          portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${portfolio.totalGainLoss.toLocaleString()} ({portfolio.totalGainLossPercentage.toFixed(2)}%)
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Holdings</span>
                        <span className="text-sm font-medium text-gray-900">
                          {portfolio.holdings.length} stocks
                        </span>
                      </div>
                      
                      {portfolio.lastAnalyzed && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Last Analyzed</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(portfolio.lastAnalyzed).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700">
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200">
                        Generate Analysis
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
