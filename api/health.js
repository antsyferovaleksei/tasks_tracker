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

  try {
    res.status(200).json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        supabaseConfigured: !!process.env.SUPABASE_KEY,
        jwtConfigured: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 