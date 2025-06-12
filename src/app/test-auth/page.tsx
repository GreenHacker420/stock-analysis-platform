'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Fetch debug info
    fetch('/api/auth/debug')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Failed to fetch debug info:', err));
  }, []);

  const handleCredentialsSignIn = async () => {
    const result = await signIn('credentials', {
      email: 'sarah.johnson@stockanalyzer.com',
      password: 'analyst123!',
      redirect: false,
    });
    
    console.log('Sign in result:', result);
    
    if (result?.ok) {
      console.log('Sign in successful, redirecting to dashboard');
      router.push('/dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Session Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              {session ? (
                <div>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Role:</strong> {session.user?.role}</p>
                  <p><strong>Active:</strong> {session.user?.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>ID:</strong> {session.user?.id}</p>
                </div>
              ) : (
                <p>No active session</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              {!session ? (
                <>
                  <button
                    onClick={handleCredentialsSignIn}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Sign In (Analyst Demo)
                  </button>
                  <button
                    onClick={() => signIn('google')}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    Sign In with Google
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
