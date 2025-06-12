'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  UserIcon,
  CpuChipIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
    metadata?: {
      stocks?: string[];
      confidence?: number;
      analysisType?: string;
    };
  };
  onStockClick?: (symbol: string) => void;
}

export default function ChatMessage({ message, onStockClick }: ChatMessageProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getAnalysisIcon = (type?: string) => {
    switch (type) {
      case 'portfolio_analysis':
        return ChartBarIcon;
      case 'risk_assessment':
        return ExclamationTriangleIcon;
      case 'stock_recommendation':
        return SparklesIcon;
      case 'market_analysis':
        return ArrowTrendingUpIcon;
      default:
        return CpuChipIcon;
    }
  };

  const getAnalysisColor = (type?: string) => {
    switch (type) {
      case 'portfolio_analysis':
        return 'text-blue-500';
      case 'risk_assessment':
        return 'text-orange-500';
      case 'stock_recommendation':
        return 'text-purple-500';
      case 'market_analysis':
        return 'text-green-500';
      default:
        return isDark ? 'text-purple-400' : 'text-purple-500';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    // Headers
    h1: ({ children }: any) => (
      <h1 className={`text-xl font-bold mb-3 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className={`text-lg font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className={`text-base font-semibold mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className={`text-sm font-semibold mb-1 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {children}
      </h4>
    ),

    // Paragraphs
    p: ({ children }: any) => (
      <div className="text-sm leading-relaxed mb-2 last:mb-0">
        {children}
      </div>
    ),

    // Lists
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 mb-2 ml-2">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 mb-2 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-sm">
        {children}
      </li>
    ),

    // Code blocks
    code: ({ inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code
            className={`px-1.5 py-0.5 rounded text-xs font-mono ${
              isDark
                ? 'bg-gray-600 text-gray-200'
                : 'bg-gray-200 text-gray-800'
            }`}
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <div className={`rounded-lg p-3 mb-2 overflow-x-auto ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <code
            className={`text-xs font-mono block ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}
            {...props}
          >
            {children}
          </code>
        </div>
      );
    },

    // Tables
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-2">
        <table className={`min-w-full text-xs border-collapse ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        }`}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className={`border-b ${
        isDark ? 'border-gray-600' : 'border-gray-300'
      }`}>
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className={`px-2 py-1 text-left font-semibold ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className={`px-2 py-1 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {children}
      </td>
    ),

    // Blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className={`border-l-4 pl-3 py-1 mb-2 italic ${
        isDark
          ? 'border-blue-400 bg-blue-900/20 text-blue-200'
          : 'border-blue-500 bg-blue-50 text-blue-800'
      }`}>
        {children}
      </blockquote>
    ),

    // Links
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline hover:no-underline ${
          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
        }`}
        onClick={(e) => {
          // Security check for links
          if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
            e.preventDefault();
          }
        }}
      >
        {children}
      </a>
    ),

    // Strong and emphasis
    strong: ({ children }: any) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),

    // Horizontal rule
    hr: () => (
      <hr className={`my-3 border-t ${
        isDark ? 'border-gray-600' : 'border-gray-300'
      }`} />
    )
  };

  // Enhanced content formatting with markdown support
  const formatContent = (content: string) => {
    // Pre-process content for financial formatting
    let processedContent = content
      // Format currency symbols
      .replace(/₹(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '**₹$1**')
      .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '**$$$1**')
      // Format percentages
      .replace(/(\d+(?:\.\d+)?%)/g, '**$1**')
      // Format stock symbols
      .replace(/\b([A-Z]{2,10}(?:\.NSE|\.BSE)?)\b/g, '`$1`');

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, {
            allowedTags: [
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'p', 'div', 'br', 'strong', 'em', 'u', 's',
              'ul', 'ol', 'li',
              'table', 'thead', 'tbody', 'tr', 'th', 'td',
              'blockquote', 'code', 'pre',
              'a', 'hr'
            ],
            allowedAttributes: {
              'a': ['href', 'target', 'rel'],
              'code': ['className'],
              'pre': ['className']
            }
          }]
        ]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    );
  };

  const AnalysisIcon = getAnalysisIcon(message.metadata?.analysisType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex max-w-4xl w-full ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${
          message.role === 'user' ? 'ml-4' : 'mr-4'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            message.role === 'user'
              ? isDark ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
              : isDark ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            {message.role === 'user' ? (
              <UserIcon className="w-5 h-5 text-white" />
            ) : (
              <AnalysisIcon className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`group relative flex-1 ${
          message.role === 'user' ? 'max-w-2xl' : 'max-w-full'
        }`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm ${
            message.role === 'user'
              ? isDark
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : isDark
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200 shadow-md'
          }`}>
            {/* Loading State */}
            {message.isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Analyzing your request...</span>
              </div>
            ) : (
              <>
                {/* Message Content */}
                <div className="max-w-none">
                  {formatContent(message.content)}
                </div>

                {/* Stock Tags */}
                {message.metadata?.stocks && message.metadata.stocks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.metadata.stocks.map((stock) => (
                      <button
                        key={stock}
                        onClick={() => onStockClick?.(stock)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 ${
                          message.role === 'user'
                            ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                            : isDark
                              ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {stock}
                      </button>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                {message.metadata && message.role === 'assistant' && (
                  <div className={`mt-4 flex items-center justify-between text-xs border-t pt-3 ${
                    isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-4">
                      {message.metadata.analysisType && (
                        <span className="flex items-center space-x-1">
                          <AnalysisIcon className={`w-3 h-3 ${getAnalysisColor(message.metadata.analysisType)}`} />
                          <span className="capitalize">
                            {message.metadata.analysisType.replace('_', ' ')}
                          </span>
                        </span>
                      )}
                      {message.metadata.confidence && (
                        <span className={`flex items-center space-x-1 ${getConfidenceColor(message.metadata.confidence)}`}>
                          <span>Confidence: {message.metadata.confidence}%</span>
                        </span>
                      )}
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={handleCopy}
                      className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:scale-105 ${
                        isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                      }`}
                      title="Copy message"
                    >
                      {copied ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Timestamp */}
            <div className={`mt-3 text-xs ${
              message.role === 'user'
                ? 'text-blue-100/80'
                : isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
