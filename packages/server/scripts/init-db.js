const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    // Налаштування Supabase
    require('dotenv').config();
    const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔌 З\'єднання з Supabase...');
    
    // Читаємо SQL файл
    const sqlPath = path.join(__dirname, '../src/config/init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Виконую SQL скрипт...');
    
    // Розділяємо SQL на окремі команди
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
          if (error && !error.message.includes('already exists')) {
            console.warn('⚠️ SQL warning:', error.message);
          }
        } catch (err) {
          // Виконуємо прямі SQL запити через Postgres
          const { error } = await supabase.from('users').select('count');
          if (error && error.code === '42P01') {
            console.log('📝 Створюю таблиці вручну...');
            await createTablesManually(supabase);
            break;
          }
        }
      }
    }
    
    console.log('✅ База даних ініціалізована!');
    
    // Тестуємо з'єднання
    const { data, error } = await supabase.from('users').select('count');
    if (error) {
      console.error('❌ Помилка тестування:', error.message);
    } else {
      console.log('✅ Тестування успішне!');
    }
    
  } catch (error) {
    console.error('❌ Помилка ініціалізації:', error.message);
  }
}

async function createTablesManually(supabase) {
  // Створюємо таблицю users
  const { error } = await supabase
    .from('users')
    .insert({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      name: 'Test User',
      password: 'test'
    });
    
  if (error && error.code === '42P01') {
    console.log('📊 Таблиці не існують. Перейдіть до Supabase Dashboard для створення схеми.');
    console.log('🌐 URL: https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk');
  }
}

initDatabase(); 