const { createServer } = require('http');
const { parse } = require('url');

// Імпортуємо наші API routes
const registerHandler = require('../../../pages/api/auth/register.js');
const loginHandler = require('../../../pages/api/auth/login.js');

// Простий роутер
const routes = {
  '/api/auth/register': registerHandler,
  '/api/auth/login': loginHandler
};

const server = createServer(async (req, res) => {
  const { pathname } = parse(req.url, true);
  const handler = routes[pathname];

  if (handler) {
    // Збираємо body для POST запитів
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
      }

      await handler(req, res);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Локальний тестовий сервер запущений на http://localhost:${PORT}`);
  
  // Тестуємо реєстрацію після запуску сервера
  setTimeout(testRegistration, 1000);
});

async function testRegistration() {
  const https = require('https');

  console.log('\n🧪 Тестування реєстрації локально...');
  
  const userData = {
    email: `local-test-${Date.now()}@example.com`,
    name: 'Local Test User',
    password: 'password123'
  };

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('📤 Надсилаю запит реєстрації...');
  console.log('📧 Email:', userData.email);

  const req = require('http').request(options, (res) => {
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
          console.log('✅ Локальна реєстрація працює!');
          console.log('🎉 Можна деплоїти на Vercel');
        } else {
          console.log('❌ Помилка локальної реєстрації');
        }
      } catch (parseError) {
        console.log('📄 Raw response:', data);
        console.log('💥 Parse error:', parseError.message);
      }
      
      // Закриваємо сервер після тесту
      server.close();
    });
  });

  req.on('error', (e) => {
    console.error('💥 Помилка запиту:', e.message);
    server.close();
  });

  req.write(postData);
  req.end();
} 