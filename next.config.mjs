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

  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
