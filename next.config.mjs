/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server runtime (Vercel serverless functions). We no longer export static
  // HTML: pages render on demand and read from Neon Postgres through the API
  // routes in src/app/api/*. See MIGRATE-TO-SERVER.md (Route D).
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // The <Img> component uses a plain <img>, so Vercel Blob URLs and local
    // SVGs both work without remotePatterns config.
    unoptimized: true
  },

  eslint: { ignoreDuringBuilds: true },

  async headers() {
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https://cdn.stocksnap.io https://*.public.blob.vercel-storage.com",
      // Next.js injects inline hydration scripts; recharts/UI use inline styles.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
        ]
      }
    ];
  }
};

export default nextConfig;
