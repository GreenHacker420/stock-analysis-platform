'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'chart';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md',
  variant = 'spinner',
  className = '',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const SpinnerVariant = () => (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-transparent rounded-full ${
        isDark ? 'border-t-blue-400' : 'border-t-blue-600'
      }`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );

  const DotsVariant = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${
            isDark ? 'bg-blue-400' : 'bg-blue-600'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  const PulseVariant = () => (
    <motion.div
      className={`${sizeClasses[size]} rounded-full ${
        isDark ? 'bg-blue-400' : 'bg-blue-600'
      }`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const BarsVariant = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            isDark ? 'bg-blue-400' : 'bg-blue-600'
          }`}
          style={{ height: `${12 + i * 4}px` }}
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );

  const ChartVariant = () => (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-transparent rounded-full ${
          isDark ? 'border-t-green-400 border-r-blue-400' : 'border-t-green-600 border-r-blue-600'
        }`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className={`absolute inset-2 border border-transparent rounded-full ${
          isDark ? 'border-t-yellow-400' : 'border-t-yellow-600'
        }`}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'bars':
        return <BarsVariant />;
      case 'chart':
        return <ChartVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {renderVariant()}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${textSizes[size]} font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark ? 'bg-gray-900/80' : 'bg-white/80'
      } backdrop-blur-sm`}>
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loading component for charts
export function ChartSkeleton({ className = '' }: { className?: string }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`animate-pulse ${className}`}>
      <div className={`h-64 rounded-lg ${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      } loading-shimmer`}>
        <div className="p-4 space-y-3">
          <div className={`h-4 rounded ${
            isDark ? 'bg-gray-600' : 'bg-gray-300'
          } w-1/3`}></div>
          <div className={`h-3 rounded ${
            isDark ? 'bg-gray-600' : 'bg-gray-300'
          } w-1/2`}></div>
        </div>
      </div>
    </div>
  );
}

// Card skeleton for dashboard
export function CardSkeleton({ className = '' }: { className?: string }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`animate-pulse ${className}`}>
      <div className={`rounded-lg p-6 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-sm loading-shimmer`}>
        <div className="space-y-4">
          <div className={`h-4 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          } w-1/4`}></div>
          <div className={`h-8 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          } w-1/2`}></div>
          <div className="space-y-2">
            <div className={`h-3 rounded ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } w-full`}></div>
            <div className={`h-3 rounded ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } w-3/4`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`animate-pulse ${className}`}>
      <div className={`rounded-lg overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}>
        {/* Header */}
        <div className={`p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-4 rounded ${
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className={`h-4 rounded ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
