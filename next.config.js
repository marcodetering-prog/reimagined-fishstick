/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Turbopack is enabled by default in Next.js 16
    turbo: {
      // Optimize build speed
      resolveAlias: {},
    },
  },
  // Enable detailed logging in production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Reduce output size
  compress: true,
  // Optimize production build (no source maps for faster builds)
  productionBrowserSourceMaps: false,
  // Optimize images for faster loading
  images: {
    unoptimized: false,
  },
}

module.exports = nextConfig
