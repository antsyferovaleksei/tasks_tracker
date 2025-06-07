const { createClient } = require('@supabase/supabase-js');

async function createAllTables() {
  require('dotenv').config();
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Створення таблиць в Supabase...');

  const tables = [
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'projects',
      sql: `
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
      `
    },
    {
      name: 'tasks',
      sql: `
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
      `
    },
    {
      name: 'tags',
      sql: `
        CREATE TABLE IF NOT EXISTS tags (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          color TEXT DEFAULT '#666666',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'task_tags',
      sql: `
        CREATE TABLE IF NOT EXISTS task_tags (
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (task_id, tag_id)
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📊 Створюю таблицю ${table.name}...`);
      
      // Спробуємо створити таблицю через пряме виконання SQL
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: table.sql 
      });

      if (error) {
        console.log(`⚠️ Не вдалося створити ${table.name} через RPC:`, error.message);
        
        // Спробуємо через звичайні операції
        await testTableExists(supabase, table.name);
      } else {
        console.log(`✅ Таблиця ${table.name} створена успішно!`);
      }
    } catch (err) {
      console.error(`❌ Помилка створення ${table.name}:`, err.message);
    }
  }

  // Тестуємо що таблиці працюють
  await testAllTables(supabase);
}

async function testTableExists(supabase, tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error && error.code === '42P01') {
      console.log(`❌ Таблиця ${tableName} не існує`);
      return false;
    }
    console.log(`✅ Таблиця ${tableName} доступна`);
    return true;
  } catch (err) {
    console.log(`❌ Помилка тестування ${tableName}:`, err.message);
    return false;
  }
}

async function testAllTables(supabase) {
  console.log('\n🧪 Тестування доступності таблиць...');
  
  const tables = ['users', 'projects', 'tasks', 'tags', 'task_tags'];
  
  for (const table of tables) {
    await testTableExists(supabase, table);
  }
  
  console.log('\n🎯 Якщо таблиці не існують, створіть їх вручну в Dashboard:');
  console.log('🌐 https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk/editor');
}

createAllTables(); 