/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    instrumentationHook: true,
  },
  // Enable detailed logging in production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig
