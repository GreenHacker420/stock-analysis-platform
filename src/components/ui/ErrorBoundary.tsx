'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  isDark?: boolean;
}

function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  // Simple theme detection (you might want to use your theme context here)
  const isDark = typeof window !== 'undefined' && 
    window.document.documentElement.classList.contains('dark');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-[400px] flex items-center justify-center p-8 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className={`max-w-md w-full text-center rounded-lg p-8 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            isDark ? 'bg-red-900/20' : 'bg-red-50'
          }`}
        >
          <ExclamationTriangleIcon className={`w-8 h-8 ${
            isDark ? 'text-red-400' : 'text-red-500'
          }`} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-xl font-semibold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Something went wrong
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-sm mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </motion.p>

        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-left mb-6 p-4 rounded-md ${
              isDark ? 'bg-gray-900 border border-gray-600' : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <summary className={`cursor-pointer text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Error Details (Development)
            </summary>
            <pre className={`mt-2 text-xs overflow-auto ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>
              {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </motion.details>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {onRetry && (
            <button
              onClick={onRetry}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Chart-specific error fallback
export function ChartErrorFallback({ onRetry }: ErrorFallbackProps) {
  const isDark = typeof window !== 'undefined' && 
    window.document.documentElement.classList.contains('dark');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`h-64 flex items-center justify-center rounded-lg border-2 border-dashed ${
        isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <div className="text-center p-6">
        <ExclamationTriangleIcon className={`w-8 h-8 mx-auto mb-3 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <h3 className={`text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Chart failed to load
        </h3>
        <p className={`text-xs mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Unable to render chart data
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
