'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch debug info
    fetch('/api/auth/debug')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Failed to fetch debug info:', err));
  }, []);

  const testCredentialsSignIn = async () => {
    console.log('Testing credentials sign in...');
    const result = await signIn('credentials', {
      email: 'sarah.johnson@stockanalyzer.com',
      password: 'analyst123!',
      redirect: false,
    });
    
    console.log('Sign in result:', result);
    
    if (result?.ok) {
      console.log('Sign in successful, redirecting to dashboard');
      router.push('/dashboard');
    } else {
      console.error('Sign in failed:', result?.error);
    }
  };

  const testGoogleSignIn = async () => {
    console.log('Testing Google sign in...');
    const result = await signIn('google', {
      callbackUrl: '/dashboard',
      redirect: false,
    });
    
    console.log('Google sign in result:', result);
  };

  const testDashboardRedirect = () => {
    console.log('Testing dashboard redirect...');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Redirect Test Page
          </h1>

          {/* Session Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Session Status</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Status:</strong> {status}</p>
              {session ? (
                <div>
                  <p><strong>User:</strong> {session.user?.email}</p>
                  <p><strong>Role:</strong> {session.user?.role}</p>
                  <p><strong>Active:</strong> {session.user?.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>ID:</strong> {session.user?.id}</p>
                </div>
              ) : (
                <p>No active session</p>
              )}
            </div>
          </div>

          {/* Debug Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Debug Information</h2>
            <div className="bg-gray-100 p-4 rounded">
              {debugInfo ? (
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              ) : (
                <p>Loading debug info...</p>
              )}
            </div>
          </div>

          {/* Test Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Test Actions</h2>
            <div className="space-y-3">
              {!session ? (
                <>
                  <button
                    onClick={testCredentialsSignIn}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-3"
                  >
                    Test Credentials Sign In
                  </button>
                  <button
                    onClick={testGoogleSignIn}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-3"
                  >
                    Test Google Sign In
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-3"
                >
                  Sign Out
                </button>
              )}
              <button
                onClick={testDashboardRedirect}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Test Dashboard Redirect
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Instructions</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Check the session status above</li>
              <li>If not signed in, try the credentials sign in with demo account</li>
              <li>After successful sign in, you should be redirected to dashboard</li>
              <li>Test the dashboard redirect button to verify middleware protection</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
