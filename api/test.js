export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    message: '🎯 API Test Endpoint Working!',
    timestamp: new Date().toISOString(),
    hasDatabase: !!process.env.DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
    nodeEnv: process.env.NODE_ENV,
  });
} 