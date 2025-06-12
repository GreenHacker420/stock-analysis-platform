'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeftIcon, DocumentTextIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

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
  aiAnalysis?: string;
  recommendations?: any[];
  riskAssessment?: any;
  marketConditions?: any;
  performanceAnalysis?: any;
}

export default function ReportDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { isDark } = useTheme();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    if (params.id) {
      fetchReport(params.id as string);
    }
  }, [session, status, router, params.id]);

  const fetchReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        console.error('Report not found');
        router.push('/reports');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      router.push('/reports');
    } finally {
      setLoading(false);
    }
  };

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

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className={`h-8 rounded w-1/4 mb-6 ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
              <div className={`rounded-lg shadow p-6 ${
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !report) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation />
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className={`inline-flex items-center text-sm font-medium mb-4 transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Reports
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {report.title}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Confidence: {report.metadata.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            {/* Summary */}
            <div className={`rounded-lg shadow p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-lg font-medium mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Executive Summary
              </h2>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {report.summary}
              </p>
            </div>

            {/* Detailed Analysis */}
            {report.aiAnalysis && (
              <div className={`rounded-lg shadow p-6 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h2 className={`text-lg font-medium mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Detailed Analysis
                </h2>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {report.aiAnalysis}
                </div>
              </div>
            )}

            {/* Report Metadata */}
            <div className={`rounded-lg shadow p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-lg font-medium mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Report Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      Portfolio
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {report.portfolioId.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <UserIcon className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {session.user.role === 'analyst' ? 'Client' : 'Analyst'}
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {session.user.role === 'analyst' ? report.investorId.name : report.analystId.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarIcon className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      Created
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarIcon className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      Valid Until
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(report.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
