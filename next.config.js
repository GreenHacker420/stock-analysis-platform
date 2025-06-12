/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: false, // Keep TypeScript checking enabled
  },
  // External packages for server components
  serverExternalPackages: ['mongoose'],
  // Experimental features
  experimental: {
    // Add any experimental features here if needed
  },
  // Handle environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Image optimization
  images: {
    domains: ['localhost', 'via.placeholder.com'],
    unoptimized: false, // Enable optimization for Vercel
  },
  // Remove output: 'standalone' for Vercel compatibility
  // Disable x-powered-by header
  poweredByHeader: false,
  // Compression
  compress: true,
  // Trailing slash handling
  trailingSlash: false,
  // Redirects and rewrites can be added here if needed
  async redirects() {
    return [
      // Add any redirects here
    ];
  },
  async rewrites() {
    return [
      // Add any rewrites here
    ];
  },
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
