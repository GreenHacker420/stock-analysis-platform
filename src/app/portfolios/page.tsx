'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { PlusIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { formatINR, formatPercentage } from '@/lib/currencyUtils';

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
  const { isDark } = useTheme();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAnalysis, setGeneratingAnalysis] = useState<string | null>(null);

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

  const handleViewDetails = (portfolioId: string) => {
    router.push(`/portfolios/${portfolioId}`);
  };

  const handleGenerateAnalysis = async (portfolioId: string) => {
    setGeneratingAnalysis(portfolioId);
    try {
      const response = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to the generated report
        router.push(`/reports/${data.report._id}`);
      } else {
        console.error('Failed to generate analysis');
        alert('Failed to generate analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('Error generating analysis. Please try again.');
    } finally {
      setGeneratingAnalysis(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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

  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {session.user.role === 'analyst' ? 'Client Portfolios' : 'My Portfolios'}
            </h1>
            {session.user.role === 'investor' && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Portfolio
              </button>
            )}
          </div>

          {portfolios.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className={`mx-auto h-12 w-12 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`mt-2 text-sm font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}>No portfolios</h3>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {session.user.role === 'analyst'
                  ? 'No client portfolios assigned to you yet.'
                  : 'Get started by creating your first portfolio.'
                }
              </p>
              {session.user.role === 'investor' && (
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Portfolio
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <div key={portfolio._id} className={`rounded-lg shadow hover:shadow-md transition-shadow ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'
                }`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-medium truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {portfolio.name}
                      </h3>
                      <ChartBarIcon className={`w-5 h-5 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>

                    {session.user.role === 'analyst' && (
                      <p className={`text-sm mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Client: {portfolio.investorId.name}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</span>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {formatINR(portfolio.totalValue)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gain/Loss</span>
                        <span className={`text-sm font-medium ${
                          portfolio.totalGainLoss >= 0
                            ? (isDark ? 'text-green-400' : 'text-green-600')
                            : (isDark ? 'text-red-400' : 'text-red-600')
                        }`}>
                          {formatINR(portfolio.totalGainLoss)} ({portfolio.totalGainLossPercentage.toFixed(2)}%)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Holdings</span>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {portfolio.holdings.length} stocks
                        </span>
                      </div>

                      {portfolio.lastAnalyzed && (
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Analyzed</span>
                          <span className={`text-sm font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {new Date(portfolio.lastAnalyzed).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleViewDetails(portfolio._id)}
                        className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleGenerateAnalysis(portfolio._id)}
                        disabled={generatingAnalysis === portfolio._id}
                        className={`flex-1 inline-flex justify-center items-center text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          generatingAnalysis === portfolio._id
                            ? 'bg-blue-400 text-white cursor-not-allowed'
                            : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                      >
                        {generatingAnalysis === portfolio._id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            Generate Analysis
                          </>
                        )}
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
