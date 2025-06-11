'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  OAuthAccountNotLinked: 'This account is already linked to another user. Please try signing in with a different account or contact support.',
  OAuthCallback: 'There was an error with the OAuth callback. Please try again.',
  OAuthCreateAccount: 'Could not create OAuth account. Please try again.',
  EmailCreateAccount: 'Could not create email account. Please try again.',
  Callback: 'There was an error in the callback handler. Please try again.',
  OAuthSignin: 'Error in OAuth sign in. Please try again.',
  EmailSignin: 'Check your email address and try again.',
  CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  const errorMessage = errorMessages[error] || errorMessages.Default

  const handleRetry = () => {
    window.location.href = '/auth/signin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage}
          </p>
          {error && (
            <p className="mt-1 text-xs text-gray-500">
              Error code: {error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {error === 'OAuthAccountNotLinked' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Troubleshooting Steps:
              </h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Clear your browser cookies and cache</li>
                <li>Try signing in with a different Google account</li>
                <li>Open the app in an incognito/private window</li>
                <li>Make sure you&apos;re using the correct Google account</li>
                <li>If the issue persists, contact support</li>
              </ol>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 mb-2">Development Mode - Debug Options:</p>
                  <div className="space-y-1">
                    <a
                      href="/api/auth/debug"
                      target="_blank"
                      className="text-xs text-blue-600 hover:text-blue-800 underline block"
                    >
                      Check Auth Configuration
                    </a>
                    <button
                      onClick={() => {
                        const email = prompt('Enter your email to reset account:')
                        if (email) {
                          fetch('/api/auth/reset', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                          }).then(res => res.json()).then(data => {
                            alert(data.message || 'Reset completed')
                            window.location.reload()
                          })
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Reset Account (Dev Only)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRetry}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>

            <Link
              href="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              If this problem persists, please contact support at{' '}
              <a href="mailto:support@stockanalysis.com" className="text-indigo-600 hover:text-indigo-500">
                support@stockanalysis.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
