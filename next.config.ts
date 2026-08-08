import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const hostnames = [
  'riversinsight.com',
  'media.assettype.com',
  'thumbs.dreamstime.com',
  'eos.com',
  'static.wixstatic.com',
  'pwonlyias.com',
  'notes.saralupsc.com',
  'framerusercontent.com',
  'chrysalishigh.com',
  'i.pravatar.cc',
  'images.unsplash.com',
  'npnjzfmywierjpxbnehw.supabase.co',
  'utfs.io',
];

const nextConfig: NextConfig = {
  // ⚡ REACT 19 COMPILER - AUTO-MEMOIZATION
  reactCompiler: true,

  
  images: {
    remotePatterns: [
      ...hostnames.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
      })),
      /*
      {
        protocol: 'https' as const,
        hostname: '**', // ❌ Removed for security (SSRF Risk)
      },
      */
    ],
  },
  
  // ⚡ Typed Routes for better developer experience (moved from experimental)
  // typedRoutes: true, // Enable when ready - requires full type generation
  
  experimental: {
    // ⚡ Next.js 16.3 Performance Features
    prefetchInlining: true,
    appNewScrollHandler: true,
    
    // ⚡ OPTIMIZED PACKAGE IMPORTS - Tree shaking for heavy libs
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'date-fns',
      'recharts',
    ],
    
    staleTimes: {
      dynamic: 604800,  // 7 days for dynamic pages
      static: 604800,   // 7 days for static pages
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          /*
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://apis.google.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https:;
              font-src 'self' https://fonts.gstatic.com data:;
              frame-src 'self' https://checkout.razorpay.com https://www.youtube.com;
              connect-src 'self' https:;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
          */
        ],
      },
      // Auth-related pages must never be browser-cached
      {
        source: '/login',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/signup',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/dashboard',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/2026paper',
        destination: '/open/2026-mppsc-prelims',
        permanent: false, // 307 Temporary Redirect
      },
      {
        source: '/check-score',
        destination: '/open/2026-mppsc-prelims',
        permanent: false,
      },
      {
        source: '/paper-solution',
        destination: '/open/2026-mppsc-prelims',
        permanent: false,
      },
    ];
  },
  allowedDevOrigins: ['192.168.1.2', '192.168.1.4','192.168.1.3'],
  logging: {
    browserToTerminal: true,
    // 'error' — errors only (default)
    // 'warn'  — warnings and errors
    // true    — all console output
    // false   — disabled
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG || 'mindful-mppsc-zen',

  project: process.env.SENTRY_PROJECT || 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  // Only widen on production CI, not locally
  widenClientFileUpload: process.env.NODE_ENV === 'production' && !!process.env.CI,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
