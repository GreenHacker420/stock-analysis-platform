'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut({ 
          redirect: false,
          callbackUrl: '/' 
        });
        
        // Clear any local storage or session storage if needed
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to home page
        router.replace('/');
      } catch (error) {
        console.error('Sign out error:', error);
        router.replace('/');
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Signing out...
        </h2>
      </div>
    </div>
  );
}
