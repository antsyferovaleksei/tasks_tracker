export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
    environment: process.env.NODE_ENV || 'production',
  });
} 