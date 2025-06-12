'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark } = useTheme();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const rawCallbackUrl = searchParams.get('callbackUrl');

  // Ensure callback URL is always a valid production URL
  const callbackUrl = (() => {
    if (!rawCallbackUrl) return '/dashboard';

    try {
      // If it's a relative URL, use it as-is
      if (rawCallbackUrl.startsWith('/')) {
        return rawCallbackUrl;
      }

      // If it's an absolute URL, validate it's from our domain
      const url = new URL(rawCallbackUrl);
      if (url.hostname === 'stock.greenhacker.tech' || url.hostname === 'localhost') {
        return url.pathname + url.search;
      }

      // Default to dashboard for any other domain
      return '/dashboard';
    } catch {
      // If URL parsing fails, default to dashboard
      return '/dashboard';
    }
  })();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (session?.user && session.user.isActive) {
      console.log('User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [session, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show a message while redirecting
  if (session?.user && session.user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            You are already signed in. Redirecting...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            If you are not redirected automatically, <a href="/dashboard" className="text-indigo-600 hover:text-indigo-500">click here</a>.
          </p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: false, // Handle redirect manually for better control
      });

      console.log('Google sign in result:', { ok: result?.ok, error: result?.error, url: result?.url });

      if (result?.ok) {
        console.log('Google sign in successful, redirecting to:', callbackUrl);
        router.replace(callbackUrl);
      } else if (result?.error) {
        console.error('Google sign in error:', result.error);
        // Redirect to error page with error details
        router.push(`/auth/error?error=${result.error}`);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      router.push('/auth/error?error=Configuration');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFormErrors({});

    // Validate form
    const errors: typeof formErrors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting credentials sign in for:', formData.email);
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: callbackUrl,
        redirect: false, // Handle redirect manually for better control
      });

      console.log('Sign in result:', { ok: result?.ok, error: result?.error, url: result?.url });

      if (result?.ok) {
        console.log('Sign in successful, redirecting to:', callbackUrl);
        // Successful sign-in, redirect to callback URL
        router.replace(callbackUrl);
      } else if (result?.error) {
        console.error('Sign in failed:', result.error);
        setFormErrors({
          general: result.error === 'CredentialsSignin'
            ? 'Invalid email or password'
            : result.error
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setFormErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900">
            <LogIn className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Access your stock analysis platform
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(error || formErrors.general) && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {formErrors.general && <p>{formErrors.general}</p>}
                  {error === 'OAuthAccountNotLinked' && (
                    <p>This account is already linked to another user. Please try a different account or clear your browser data.</p>
                  )}
                  {error === 'AccessDenied' && (
                    <p>Access was denied. Please try again or contact support.</p>
                  )}
                  {error === 'Configuration' && (
                    <p>There is a configuration issue. Please contact support.</p>
                  )}
                  {error && !['OAuthAccountNotLinked', 'AccessDenied', 'Configuration'].includes(error) && !formErrors.general && (
                    <p>An error occurred during sign in. Please try again.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700`}
                  placeholder="Enter your email address"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
              )}
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Demo Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                  <div className="font-medium text-blue-700 dark:text-blue-300 mb-2">👨‍💼 Analyst Account</div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><span className="font-medium">Email:</span> sarah.johnson@stockanalyzer.com</div>
                    <div><span className="font-medium">Password:</span> analyst123!</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ email: 'sarah.johnson@stockanalyzer.com', password: 'analyst123!' });
                    }}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                  >
                    Use these credentials
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                  <div className="font-medium text-green-700 dark:text-green-300 mb-2">👤 Investor Account</div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><span className="font-medium">Email:</span> john.doe@email.com</div>
                    <div><span className="font-medium">Password:</span> investor123!</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ email: 'john.doe@email.com', password: 'investor123!' });
                    }}
                    className="mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium"
                  >
                    Use these credentials
                  </button>
                </div>
              </div>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-300"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
