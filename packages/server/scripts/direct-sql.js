const https = require('https');

async function createTablesDirectly() {
  require('dotenv').config();
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;

  console.log('🚀 Створення таблиць через прямий SQL...');

  // Всі SQL команди в одному запиті
  const sql = `
    -- Створення таблиці users
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Створення таблиці projects
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

    -- Створення таблиці tasks
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

    -- Створення таблиці tags
    CREATE TABLE IF NOT EXISTS tags (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#666666',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Створення таблиці task_tags
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, tag_id)
    );

    -- Створення індексів
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `;

  try {
    // Спробуємо виконати SQL через PostgREST API
    const postData = JSON.stringify({
      query: sql
    });

    const options = {
      hostname: 'gwkyqchyuihmgpvqosvk.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    console.log('📡 Надсилаю SQL до Supabase...');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📨 Відповідь від Supabase:', res.statusCode);
        console.log('📄 Дані:', data);
        
        if (res.statusCode === 200) {
          console.log('✅ SQL виконано успішно!');
          testTables();
        } else {
          console.log('❌ Помилка виконання SQL');
          console.log('Створіть таблиці вручну в Dashboard:');
          console.log('https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk/editor');
        }
      });
    });

    req.on('error', (e) => {
      console.error('💥 Помилка запиту:', e.message);
      console.log('\n📋 Виконайте цей SQL в Dashboard:');
      console.log(sql);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('💥 Помилка:', error.message);
    console.log('\n📋 Виконайте цей SQL в Dashboard:');
    console.log(sql);
  }
}

async function testTables() {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🧪 Тестування таблиць...');

  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) {
      console.log('❌ Таблиці не доступні:', error.message);
    } else {
      console.log('✅ Таблиці створені успішно!');
    }
  } catch (err) {
    console.log('❌ Помилка тестування:', err.message);
  }
}

createTablesDirectly(); 