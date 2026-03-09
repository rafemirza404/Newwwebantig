/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lkichrvvnymkcmezadiq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Disable TypeScript build errors (pre-existing type issues from Vite migration)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint build errors during migration
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow @anthropic-ai/sdk to run server-side only
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', '@react-pdf/renderer'],
  },
};

module.exports = nextConfig;
