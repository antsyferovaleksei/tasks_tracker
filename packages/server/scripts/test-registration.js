const https = require('https');

async function testRegistration() {
  require('dotenv').config();
  
  console.log('🧪 Тестування реєстрації користувача...');
  
  // Дані для реєстрації
  const userData = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123'
  };

  const postData = JSON.stringify(userData);

  // Опції для запиту до нашого API
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('📤 Надсилаю запит реєстрації...');
  console.log('📧 Email:', userData.email);
  console.log('👤 Name:', userData.name);

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📨 Статус відповіді:', res.statusCode);
      
      try {
        const response = JSON.parse(data);
        console.log('📄 Відповідь:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 201) {
          console.log('✅ Реєстрація пройшла успішно!');
          console.log('🎉 Користувач створений в Supabase');
          console.log('🔑 Access Token отримано');
        } else {
          console.log('❌ Помилка реєстрації');
        }
      } catch (parseError) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('💥 Помилка запиту:', e.message);
    console.log('\n🔧 Можливі причини:');
    console.log('1. Сервер не запущений (npm run dev:server)');
    console.log('2. Таблиця users не створена в Supabase');
    console.log('3. Невірні налаштування в .env');
  });

  req.write(postData);
  req.end();
}

// Також тестуємо напряму з Supabase
async function testSupabaseConnection() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🔌 Тестування підключення до Supabase...');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Помилка Supabase:', error.message, error.code);
      if (error.code === '42P01') {
        console.log('\n📝 Створіть таблицю users:');
        console.log('🌐 https://supabase.com/dashboard/project/gwkyqchyuihmgpvqosvk/editor');
      }
    } else {
      console.log('✅ Supabase підключення працює!');
      console.log('📊 Таблиця users доступна');
    }
  } catch (err) {
    console.log('💥 Критична помилка:', err.message);
  }
}

console.log('🚀 Початок тестування...\n');
testSupabaseConnection().then(() => {
  console.log('\n🌐 Тестування API...');
  testRegistration();
}); 