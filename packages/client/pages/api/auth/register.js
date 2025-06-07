const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Ініціалізація Supabase
const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3lxY2h5dWlobWdwdnFvc3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTU1MTksImV4cCI6MjA2NDg5MTUxOX0.Gmwe2GFN4oN7udh_ZnZJTefSa1RZdzzB7pqUBfHok7s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Vercel serverless function export
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
    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Додаткова валідація
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Email валідація
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Перевіряємо чи користувач вже існує
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Хешуємо пароль
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Створюємо нового користувача в Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: name,
          email: email,
          password: passwordHash
        }
      ])
      .select('id, name, email, created_at')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      
      if (insertError.code === '23505') { // Unique constraint error
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again later.'
      });
    }

    // Створюємо JWT токени
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';

    const accessToken = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email 
      },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}; 