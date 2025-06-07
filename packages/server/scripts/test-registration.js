const https = require('https');

async function testRegistration() {
  require('dotenv').config();
  
  console.log('🧪 Тестування реєстрації користувача через Vercel...');
  
  // Дані для реєстрації
  const userData = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123'
  };

  const postData = JSON.stringify(userData);

  // Опції для запиту до Vercel API
  const options = {
    hostname: 'tasks-tracker-client.vercel.app',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('📤 Надсилаю запит реєстрації до Vercel...');
  console.log('🌐 URL: https://tasks-tracker-client.vercel.app/api/auth/register');
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
        } else if (res.statusCode === 400) {
          console.log('⚠️ Помилка валідації або користувач уже існує');
        } else if (res.statusCode === 500) {
          console.log('❌ Серверна помилка - перевірте Supabase налаштування');
        } else {
          console.log('❌ Неочікувана помилка реєстрації');
        }
      } catch (parseError) {
        console.log('📄 Raw response:', data);
        console.log('💥 Parse error:', parseError.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('💥 Помилка запиту:', e.message);
    console.log('\n🔧 Можливі причини:');
    console.log('1. Проблеми з інтернет підключенням');
    console.log('2. Vercel deployment має проблеми');
    console.log('3. API endpoint не існує або недоступний');
  });

  req.write(postData);
  req.end();
}

// Також тестуємо напряму з Supabase
async function testSupabaseConnection() {
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  
  console.log('🔌 Тестування підключення до Supabase...');
  console.log('🌐 Supabase URL:', supabaseUrl);
  console.log('🔑 API Key:', supabaseKey ? 'EXISTS' : 'MISSING');

  if (!supabaseKey) {
    console.log('❌ SUPABASE_KEY відсутній в .env');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

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
      
      // Додатково тестуємо вставку даних
      console.log('\n🧪 Тестування вставки користувача...');
      const testUser = {
        email: `direct-test-${Date.now()}@example.com`,
        name: 'Direct Test User',
        password: 'test123'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([testUser])
        .select()
        .single();

      if (insertError) {
        console.log('❌ Помилка вставки:', insertError.message);
      } else {
        console.log('✅ Пряма вставка в Supabase працює!');
        console.log('👤 Створений користувач:', insertData.email);
        
        // Видаляємо тестового користувача
        await supabase.from('users').delete().eq('id', insertData.id);
        console.log('🗑️ Тестового користувача видалено');
      }
    }
  } catch (err) {
    console.log('💥 Критична помилка:', err.message);
  }
}

console.log('🚀 Початок тестування через Vercel...\n');
testSupabaseConnection().then(() => {
  console.log('\n🌐 Тестування API через https://tasks-tracker-client.vercel.app...');
  setTimeout(() => {
    testRegistration();
  }, 1000);
}); 