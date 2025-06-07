const { createClient } = require('@supabase/supabase-js');

async function createMinimalTable() {
  require('dotenv').config();
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🎯 Мінімальне створення таблиці users...');
  console.log('========================');
  
  console.log('📝 КРОК 1: Відкрийте Supabase SQL Editor:');
  console.log('🌐 https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk/editor');
  
  console.log('\n📝 КРОК 2: Вставте та виконайте цей SQL:');
  console.log('```sql');
  console.log(`CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
  console.log('```');
  
  console.log('\n📝 КРОК 3: Після створення таблиці запустіть тест:');
  console.log('node scripts/test-registration.js');
  
  console.log('\n🔄 Автоматичне тестування через 5 секунд...');
  
  setTimeout(async () => {
    console.log('\n🧪 Тестування існування таблиці...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
        
      if (error) {
        if (error.code === '42P01') {
          console.log('❌ Таблиця users ще не існує');
          console.log('👆 Виконайте SQL код вище в Dashboard');
        } else {
          console.log('⚠️ Інша помилка:', error.message);
        }
      } else {
        console.log('✅ Таблиця users існує та доступна!');
        console.log('🎉 Можна тестувати реєстрацію користувачів');
      }
    } catch (err) {
      console.log('💥 Помилка тестування:', err.message);
    }
  }, 5000);
}

createMinimalTable(); 