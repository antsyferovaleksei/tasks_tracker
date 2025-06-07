// Vercel serverless function export
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  res.status(200).json({
    success: true,
    message: 'Tasks Tracker API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health - API health check',
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login'
    ],
    timestamp: new Date().toISOString()
  });
}; 