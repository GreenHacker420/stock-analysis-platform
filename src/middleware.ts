import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    console.log('Middleware executing for:', req.nextUrl.pathname);
    console.log('User token:', !!req.nextauth.token);

    // If user is not authenticated, redirect to signin
    if (!req.nextauth.token) {
      console.log('No token found, redirecting to signin');
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    console.log('User authenticated, allowing access');
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth pages (let them handle their own logic)
     * - home page
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|auth/|api/|$).*)',
  ],
}
