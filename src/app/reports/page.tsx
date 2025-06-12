'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

interface AnalysisReport {
  _id: string;
  title: string;
  summary: string;
  status: 'draft' | 'completed' | 'archived';
  createdAt: string;
  validUntil: string;
  portfolioId: {
    _id: string;
    name: string;
  };
  analystId: {
    _id: string;
    name: string;
    email: string;
  };
  investorId: {
    _id: string;
    name: string;
    email: string;
  };
  metadata: {
    confidence: number;
    aiModel: string;
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchReports();
  }, [session, status, router]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/${reportId}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDark
          ? 'bg-green-900/20 text-green-300 border border-green-800'
          : 'bg-green-100 text-green-800';
      case 'draft':
        return isDark
          ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-800'
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Analysis Reports
            </h1>
            <p className={`mt-1 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {session.user.role === 'analyst'
                ? 'Reports you have generated for your clients'
                : 'AI-generated analysis reports for your portfolios'
              }
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className={`mx-auto h-12 w-12 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`mt-2 text-sm font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}>No reports</h3>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {session.user.role === 'analyst'
                  ? 'You haven\'t generated any reports yet.'
                  : 'No analysis reports have been generated for your portfolios yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className={`rounded-lg shadow hover:shadow-md transition-shadow ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'
                }`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {report.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>

                        <p className={`text-sm mb-3 line-clamp-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {report.summary}
                        </p>

                        <div className={`grid grid-cols-2 gap-4 text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <div>
                            <span className="font-medium">Portfolio:</span> {report.portfolioId.name}
                          </div>
                          {session.user.role === 'analyst' && (
                            <div>
                              <span className="font-medium">Client:</span> {report.investorId.name}
                            </div>
                          )}
                          {session.user.role === 'investor' && (
                            <div>
                              <span className="font-medium">Analyst:</span> {report.analystId.name}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Created:</span> {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Valid Until:</span> {new Date(report.validUntil).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Confidence:</span> {report.metadata.confidence}%
                          </div>
                          <div>
                            <span className="font-medium">AI Model:</span> {report.metadata.aiModel}
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex-shrink-0">
                        <button
                          onClick={() => handleViewReport(report._id)}
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
