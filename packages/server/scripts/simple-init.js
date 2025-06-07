const { createClient } = require('@supabase/supabase-js');

async function createUsersTable() {
  require('dotenv').config();
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔌 Підключення до Supabase...');
  console.log('Key:', supabaseKey ? 'OK' : 'MISSING');

  // Тестуємо створення тестового користувача
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        name: 'Test User',
        password: 'test123'
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Помилка:', error.message);
      console.log('📋 Код помилки:', error.code);
      
      if (error.code === '42P01') {
        console.log('\n📊 Таблиця "users" не існує!');
        console.log('🔧 Створіть таблицю вручну в Supabase Dashboard:');
        console.log('🌐 https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk/editor');
        console.log('\n📝 SQL для створення таблиці:');
        console.log(`
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
      }
    } else {
      console.log('✅ Таблиця users працює!');
      console.log('👤 Створений користувач:', data);
      
      // Видаляємо тестового користувача
      await supabase.from('users').delete().eq('email', 'test@example.com');
      console.log('🗑️ Тестового користувача видалено');
    }
  } catch (err) {
    console.error('💥 Критична помилка:', err.message);
  }
}

createUsersTable(); 