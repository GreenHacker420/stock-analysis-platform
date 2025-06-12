'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      console.log('No session found, redirecting to signin');
      router.replace('/auth/signin');
    } else {
      console.log('Dashboard loaded for user:', {
        email: session.user?.email,
        role: session.user?.role
      });
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to home
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DashboardOverview />
        </div>
      </main>
    </div>
  );
}
