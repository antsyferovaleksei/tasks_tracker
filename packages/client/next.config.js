/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Налаштування для API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  
  // Environment variables
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  },
  
  // Для статичного експорту (якщо потрібно)
  trailingSlash: true,
  
  // Налаштування для Vercel
  experimental: {
    outputFileTracingRoot: '../../',
  },
}

module.exports = nextConfig 