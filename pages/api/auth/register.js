const bcrypt = require('bcryptjs');
const { query, initializeTables } = require('../lib/database.js');

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
    // Ініціалізуємо таблиці при першому запиті
    await initializeTables();

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

    // Перевіряємо чи користувач вже існує
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Хешуємо пароль
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Створюємо нового користувача
    const result = await query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Перевіряємо тип помилки для більш детального повідомлення
    if (error.code === '23505') { // PostgreSQL unique constraint error
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}; 