/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export -> everything lands in ./out and can be uploaded to
  // public_html on Hostinger (or any shared host). No Node process required.
  output: 'export',

  // Apache serves /shop/ as /shop/index.html, so trailing slashes keep links working.
  trailingSlash: true,

  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Next's image optimiser needs a server; static export must opt out.
    unoptimized: true
  },

  eslint: { ignoreDuringBuilds: true },

  // If you deploy into a SUBFOLDER (e.g. yoursite.com/store), uncomment both:
  // basePath: '/store',
  // assetPrefix: '/store/',
};

export default nextConfig;
