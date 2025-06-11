'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/layout/Navigation';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  UserIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentGoals: string[];
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    reportUpdates: boolean;
  };
  display: {
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    numberFormat: 'US' | 'EU';
    chartAnimations: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [preferences, setPreferences] = useState<UserPreferences>({
    riskTolerance: 'medium',
    investmentGoals: [],
    notifications: {
      email: true,
      push: false,
      priceAlerts: true,
      reportUpdates: true,
    },
    display: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US',
      chartAnimations: true,
      autoRefresh: true,
      refreshInterval: 30,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'display', name: 'Display', icon: EyeIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'trading', name: 'Trading', icon: ChartBarIcon },
  ];

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreferences = (section: keyof UserPreferences, key: string, value: string | boolean | number) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [key]: value,
      },
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Settings
            </h1>
            <p className={`mt-2 text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your account preferences and application settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className={`space-y-1 rounded-lg p-4 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? isDark
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-blue-100 text-blue-700'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className={`rounded-lg shadow-sm ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <h2 className={`text-xl font-semibold mb-6 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Profile Information
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                          isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {session.user.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {session.user.name}
                          </h3>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {session.user.email}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                            session.user.role === 'analyst'
                              ? isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                          }`}>
                            {session.user.role}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Risk Tolerance
                          </label>
                          <select
                            value={preferences.riskTolerance}
                            onChange={(e) => updatePreferences('riskTolerance', '', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="low">Conservative</option>
                            <option value="medium">Moderate</option>
                            <option value="high">Aggressive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Theme & Display Tab */}
                {activeTab === 'display' && (
                  <div className="p-6">
                    <h2 className={`text-xl font-semibold mb-6 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Display Preferences
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Theme Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            Theme
                          </h3>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Choose between light and dark mode
                          </p>
                        </div>
                        <ThemeToggle showLabel size="lg" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Currency
                          </label>
                          <select
                            value={preferences.display.currency}
                            onChange={(e) => updatePreferences('display', 'currency', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Date Format
                          </label>
                          <select
                            value={preferences.display.dateFormat}
                            onChange={(e) => updatePreferences('display', 'dateFormat', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>

                      {/* Chart Settings */}
                      <div className="space-y-4">
                        <h3 className={`text-lg font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          Chart Settings
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Chart Animations
                            </p>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Enable smooth animations for charts and graphs
                            </p>
                          </div>
                          <button
                            onClick={() => updatePreferences('display', 'chartAnimations', !preferences.display.chartAnimations)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences.display.chartAnimations
                                ? 'bg-blue-600'
                                : isDark ? 'bg-gray-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.display.chartAnimations ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Auto Refresh
                            </p>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Automatically refresh data at regular intervals
                            </p>
                          </div>
                          <button
                            onClick={() => updatePreferences('display', 'autoRefresh', !preferences.display.autoRefresh)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences.display.autoRefresh
                                ? 'bg-blue-600'
                                : isDark ? 'bg-gray-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.display.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className={`px-6 py-4 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    {saveMessage && (
                      <div className={`flex items-center space-x-2 ${
                        saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'
                      }`}>
                        <CheckIcon className="h-5 w-5" />
                        <span className="text-sm">{saveMessage}</span>
                      </div>
                    )}
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isSaving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                      } text-white`}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
