'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/layout/Navigation';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';

interface ChatMessage {
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
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick action prompts for common stock analysis questions
  const quickActions: QuickAction[] = [
    {
      id: 'portfolio-analysis',
      label: 'Analyze My Portfolio',
      prompt: 'Please analyze my current portfolio and provide investment recommendations.',
      icon: ChartBarIcon,
      color: 'blue'
    },
    {
      id: 'market-trends',
      label: 'Market Trends',
      prompt: 'What are the current market trends in the Indian stock market?',
      icon: ArrowTrendingUpIcon,
      color: 'green'
    },
    {
      id: 'stock-recommendation',
      label: 'Stock Recommendations',
      prompt: 'Can you recommend some good stocks to buy in the current market?',
      icon: SparklesIcon,
      color: 'purple'
    },
    {
      id: 'risk-assessment',
      label: 'Risk Assessment',
      prompt: 'Help me assess the risk level of my current investments.',
      icon: ExclamationTriangleIcon,
      color: 'orange'
    }
  ];

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/auth/signin');
      return;
    }

    // Load conversations
    loadConversations();

    // Add welcome message if no conversation is selected
    if (messages.length === 0 && !conversationId) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${session.user?.name}! 👋 I'm your AI stock analysis assistant. I can help you with:

• Portfolio analysis and recommendations
• Stock market insights and trends
• Risk assessment and diversification advice
• Technical analysis and price predictions
• Investment strategies tailored to your goals

What would you like to know about your investments today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [session, status, router, messages.length, conversationId]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.conversation.messages || []);
        setConversationId(id);
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowSidebar(false);

    // Add welcome message for new conversation
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${session?.user?.name}! 👋 I'm your AI stock analysis assistant. I can help you with:

• Portfolio analysis and recommendations
• Stock market insights and trends
• Risk assessment and diversification advice
• Technical analysis and price predictions
• Investment strategies tailored to your goals

What would you like to know about your investments today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: 'Analyzing your request...',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/chat/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
          conversationId: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat(aiMessage));

      // Update conversation ID if this is a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        loadConversations(); // Refresh conversations list
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: 'error',
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleStockClick = (symbol: string) => {
    // Navigate to stock details or add to watchlist
    console.log('Stock clicked:', symbol);
    // You could implement navigation to stock details page
    // router.push(`/stocks/${symbol}`);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navigation />

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
        } border-r shadow-xl lg:shadow-none`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={startNewConversation}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                }`}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Chat
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className={`text-sm font-semibold mb-4 flex items-center ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Recent Conversations
              </h3>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => loadConversation(conversation._id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      conversationId === conversation._id
                        ? isDark
                          ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 border border-blue-700/50'
                          : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200'
                        : isDark
                          ? 'hover:bg-gray-800 text-gray-300 border border-transparent hover:border-gray-700'
                          : 'hover:bg-white text-gray-700 border border-transparent hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate mb-1">
                          {conversation.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className={`text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {conversation.metadata?.totalMessages || 0} messages
                          </p>
                          {conversation.metadata?.averageConfidence && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              conversation.metadata.averageConfidence >= 80
                                ? 'bg-green-100 text-green-700'
                                : conversation.metadata.averageConfidence >= 60
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {conversation.metadata.averageConfidence}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ChatBubbleLeftRightIcon className="w-4 h-4 flex-shrink-0 ml-2 opacity-60" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`lg:hidden p-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Bars3Icon className={`w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </button>
                  <div className={`p-3 rounded-2xl ${
                    isDark ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}>
                    <SparklesIcon className={`w-7 h-7 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      AI Stock Analysis Chat
                    </h1>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Get personalized investment insights powered by AI
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: '400px' }}>
                <div className="max-w-4xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onStockClick={handleStockClick}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="max-w-4xl mx-auto px-6 py-4">
                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
                  }`}>
                    <p className={`text-sm font-semibold mb-4 flex items-center ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Quick actions to get started:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          disabled={isLoading}
                          className={`flex items-center space-x-3 p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] ${
                            isDark
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className={`p-2 rounded-lg ${
                            action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            action.color === 'green' ? 'bg-green-100 text-green-600' :
                            action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            {/* Chat Tips */}
            <div className="px-6 py-4">
              <div className={`max-w-4xl mx-auto p-4 rounded-xl border ${
                isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-blue-50/50 border-blue-200'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center ${
                  isDark ? 'text-blue-400' : 'text-blue-800'
                }`}>
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  💡 Chat Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <ul className={`text-sm space-y-1 ${
                    isDark ? 'text-gray-300' : 'text-blue-700'
                  }`}>
                    <li>• Ask specific questions about stocks</li>
                    <li>• Request portfolio analysis</li>
                  </ul>
                  <ul className={`text-sm space-y-1 ${
                    isDark ? 'text-gray-300' : 'text-blue-700'
                  }`}>
                    <li>• Get market insights and recommendations</li>
                    <li>• Ask for risk assessment advice</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
