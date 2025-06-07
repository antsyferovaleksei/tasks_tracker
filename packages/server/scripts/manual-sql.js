const { createClient } = require('@supabase/supabase-js');

async function executeSQLManually() {
  require('dotenv').config();
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔨 Створення таблиць вручну...');

  // SQL для створення всіх таблиць
  const createUsersSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  console.log('📋 SQL для створення таблиць:');
  console.log('=====================================');
  console.log('1. Таблиця users:');
  console.log(createUsersSQL);
  
  console.log('2. Таблиця projects:');
  console.log(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#1976d2',
      archived BOOLEAN DEFAULT FALSE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log('3. Таблиця tasks:');
  console.log(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'TODO',
      priority TEXT DEFAULT 'MEDIUM',
      due_date TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      archived BOOLEAN DEFAULT FALSE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log('4. Таблиця tags:');
  console.log(`
    CREATE TABLE IF NOT EXISTS tags (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#666666',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log('5. Таблиця task_tags:');
  console.log(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, tag_id)
    );
  `);

  console.log('=====================================');
  console.log('🌐 Скопіюйте цей SQL код та виконайте в Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk/editor');
  console.log('=====================================');

  // Тестуємо створення простої таблиці users
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'test@test.com',
        name: 'Test User',
        password: 'test123'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Таблиці ще не створені. Виконайте SQL вище в Dashboard.');
        return false;
      } else {
        console.log('⚠️ Помилка:', error.message);
        return false;
      }
    } else {
      console.log('✅ Таблиця users працює!');
      // Видаляємо тестового користувача
      await supabase.from('users').delete().eq('id', data.id);
      console.log('🗑️ Тестового користувача видалено');
      return true;
    }
  } catch (err) {
    console.error('💥 Помилка:', err.message);
    return false;
  }
}

executeSQLManually(); 