'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  UserGroupIcon,
  SparklesIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

const Navigation = () => {
  const { data: session } = useSession();
  const { isDark } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'AI Chat', href: '/chat', icon: SparklesIcon },
    { name: 'Portfolios', href: '/portfolios', icon: ChartBarIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Stocks', href: '/stocks', icon: CurrencyRupeeIcon },
    ...(session?.user?.role === 'analyst'
      ? [{ name: 'Investors', href: '/investors', icon: UserGroupIcon }]
      : []
    ),
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  if (!session) {
    return null;
  }

  return (
    <nav className={`shadow-sm border-b transition-colors duration-200 ${
      isDark
        ? 'bg-gray-900 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                StockAnalyzer
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'border-blue-400 text-blue-300'
                          : 'border-blue-500 text-blue-600'
                        : isDark
                          ? 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <ThemeToggle size="sm" />
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {session.user.name}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                session.user.role === 'analyst'
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                  : (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
              }`}>
                {session.user.role}
              </span>
              <button
                onClick={() => signOut()}
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
                isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              }`}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={`sm:hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? isDark
                        ? 'bg-blue-900/20 border-blue-400 text-blue-300'
                        : 'bg-blue-50 border-blue-500 text-blue-700'
                      : isDark
                        ? 'border-transparent text-gray-400 hover:bg-gray-800 hover:border-gray-600 hover:text-gray-200'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className={`pt-4 pb-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {session.user.name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className={`text-base font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {session.user.name}
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {session.user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => signOut()}
                className={`block px-4 py-2 text-base font-medium w-full text-left transition-colors duration-200 ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
