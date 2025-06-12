'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ExclamationTriangleIcon, 
  CubeIcon,
  ChartBarIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface Chart2DFallbackProps {
  title?: string;
  data?: unknown[];
  onRetry?: () => void;
  type?: 'portfolio' | 'performance' | 'scatter' | 'generic';
  className?: string;
}

export default function Chart2DFallback({ 
  title = "3D Chart", 
  data = [], 
  onRetry,
  type = 'generic',
  className = '' 
}: Chart2DFallbackProps) {
  const { isDark } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'portfolio':
        return CubeIcon;
      case 'performance':
        return ChartBarIcon;
      default:
        return CubeIcon;
    }
  };

  const Icon = getIcon();

  const renderSimpleFallback = () => {
    switch (type) {
      case 'portfolio':
        return <PortfolioFallback data={data} isDark={isDark} />;
      case 'performance':
        return <PerformanceFallback data={data} isDark={isDark} />;
      case 'scatter':
        return <ScatterFallback data={data} isDark={isDark} />;
      default:
        return <GenericFallback isDark={isDark} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-lg border-2 border-dashed p-6 ${
        isDark 
          ? 'border-gray-600 bg-gray-800/50' 
          : 'border-gray-300 bg-gray-50'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-sm font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {title}
          </h3>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Retry 3D rendering"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Fallback content */}
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        {renderSimpleFallback()}
      </div>

      {/* Footer message */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <ExclamationTriangleIcon className={`w-4 h-4 ${
            isDark ? 'text-yellow-400' : 'text-yellow-500'
          }`} />
          <span className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            3D rendering unavailable
          </span>
        </div>
        <p className={`text-xs ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Showing simplified 2D representation
        </p>
      </div>
    </motion.div>
  );
}

// Portfolio fallback component
function PortfolioFallback({ data, isDark }: { data: unknown[]; isDark: boolean }) {
  const portfolioData = data as Array<{ symbol: string; percentage: number; color: string; value: number }>;

  if (!portfolioData || portfolioData.length === 0) {
    return <GenericFallback isDark={isDark} />;
  }

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-6">
        <div className={`text-lg font-semibold ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Portfolio Allocation
        </div>
        <div className={`text-sm mt-1 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          2D Representation
        </div>
      </div>

      {/* Donut chart representation using CSS */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Background circle */}
          <div className={`absolute inset-0 rounded-full border-8 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}></div>

          {/* Segments */}
          {portfolioData.slice(0, 6).map((item, index) => {
            const startAngle = portfolioData.slice(0, index).reduce((sum, prev) => sum + (prev.percentage * 3.6), 0);
            const endAngle = startAngle + (item.percentage * 3.6);

            return (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from ${startAngle}deg, ${item.color} 0deg, ${item.color} ${item.percentage * 3.6}deg, transparent ${item.percentage * 3.6}deg)`,
                  borderRadius: '50%',
                  mask: 'radial-gradient(circle at center, transparent 60px, black 60px)',
                  WebkitMask: 'radial-gradient(circle at center, transparent 60px, black 60px)',
                }}
              />
            );
          })}

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-sm font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Portfolio
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend with bars */}
      <div className="space-y-3">
        {portfolioData.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium truncate ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.symbol}
                </span>
                <span className={`text-sm font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <div className={`h-2 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Performance fallback component
function PerformanceFallback({ data, isDark }: { data: unknown[]; isDark: boolean }) {
  const performanceData = data as Array<{ symbol: string; performance: number; name: string }>;
  
  if (!performanceData || performanceData.length === 0) {
    return <GenericFallback isDark={isDark} />;
  }

  return (
    <div className="w-full space-y-3">
      <div className="text-center mb-4">
        <div className={`text-lg font-semibold ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Stock Performance
        </div>
      </div>
      
      {/* Simple performance grid */}
      <div className="grid grid-cols-2 gap-3">
        {performanceData.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-white/50'
            } border ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <div className={`text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {item.symbol}
            </div>
            <div className={`text-lg font-bold ${
              item.performance >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {item.performance >= 0 ? '+' : ''}{item.performance.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Scatter plot fallback component
function ScatterFallback({ data, isDark }: { data: unknown[]; isDark: boolean }) {
  const scatterData = data as Array<{ symbol: string; risk: number; return: number; color: string }>;
  
  if (!scatterData || scatterData.length === 0) {
    return <GenericFallback isDark={isDark} />;
  }

  return (
    <div className="w-full space-y-3">
      <div className="text-center mb-4">
        <div className={`text-lg font-semibold ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Risk vs Return
        </div>
      </div>
      
      {/* Simple table representation */}
      <div className="space-y-2">
        <div className={`grid grid-cols-3 gap-2 text-xs font-medium ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div>Symbol</div>
          <div>Risk</div>
          <div>Return</div>
        </div>
        {scatterData.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`grid grid-cols-3 gap-2 text-sm p-2 rounded ${
              isDark ? 'bg-gray-700/30' : 'bg-gray-100/50'
            }`}
          >
            <div className={`font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {item.symbol}
            </div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {item.risk.toFixed(1)}
            </div>
            <div className={`font-medium ${
              item.return >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {item.return.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Generic fallback component
function GenericFallback({ isDark }: { isDark: boolean }) {
  return (
    <div className="text-center space-y-3">
      <CubeIcon className={`w-16 h-16 mx-auto ${
        isDark ? 'text-gray-600' : 'text-gray-400'
      }`} />
      <div className={`text-sm ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        3D visualization not available
      </div>
    </div>
  );
}
