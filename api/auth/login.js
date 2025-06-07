const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Ініціалізація Supabase
const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3lxY2h5dWlobWdwdnFvc3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTU1MTksImV4cCI6MjA2NDg5MTUxOX0.Gmwe2GFN4oN7udh_ZnZJTefSa1RZdzzB7pqUBfHok7s';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Знаходимо користувача в Supabase
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('id, name, email, password')
      .eq('email', email)
      .single();

    if (selectError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Створюємо JWT токени
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';

    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
} 