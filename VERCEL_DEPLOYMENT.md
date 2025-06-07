# 🚀 Deployment на Vercel - Tasks Tracker

Цей документ містить покрокові інструкції для deployment вашого проекту Tasks Tracker на Vercel.

## 📋 Підготовка до deployment

### 1. Встановіть Vercel CLI
```bash
npm install -g vercel
```

### 2. Авторизуйтесь у Vercel
```bash
vercel login
```

## 🎯 Варіанти deployment

### Варіант 1: Автоматичний deployment через Git (Рекомендовано)

1. **Завантажте код на GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Підключіть репозиторій до Vercel:**
   - Відкрийте [vercel.com](https://vercel.com)
   - Натисніть "New Project"
   - Імпортуйте ваш GitHub репозиторій
   - Vercel автоматично визначить конфігурацію

### Варіант 2: Manual deployment через CLI

```bash
# З кореневої директорії проекту
vercel --prod
```

## 🗄️ Налаштування бази даних

### Варіант 1: Vercel Postgres (Рекомендовано)
1. У Vercel Dashboard → Project → Storage → Create Database
2. Виберіть "Postgres"
3. Скопіюйте `DATABASE_URL` з налаштувань

### Варіант 2: Neon (Безкоштовна альтернатива)
1. Зареєструйтесь на [neon.tech](https://neon.tech)
2. Створіть новий проект
3. Скопіюйте connection string

## 🔧 Environment Variables

У Vercel Dashboard → Project → Settings → Environment Variables додайте:

### Обов'язкові змінні:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
NODE_ENV=production
```

### Опціональні змінні:
```env
CLIENT_URL=https://your-app.vercel.app
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📁 Структура для Vercel

Проект налаштований із наступною структурою:
```
tasks_tracker/
├── api/
│   └── index.js          # Vercel API routes
├── packages/
│   ├── client/           # React frontend
│   └── server/           # Express backend (переписаний для serverless)
├── vercel.json           # Vercel конфігурація
└── package.json
```

## 🔧 Команди для deployment

### Build локально (тестування):
```bash
npm run build:vercel
```

### Deploy на Vercel:
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## 🎯 Після deployment

### 1. Налаштуйте базу даних:
```bash
# Підключіться до вашої бази даних та виконайте міграції
# or використайте Prisma Studio через Vercel
```

### 2. Перевірте роботу:
- Frontend: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api`
- Health check: `https://your-app.vercel.app/api/health`

### 3. Налаштуйте custom domain (опціонально):
- У Vercel Dashboard → Project → Settings → Domains
- Додайте ваш домен

## 🔍 Troubleshooting

### Якщо не працює API:
1. Перевірте environment variables
2. Перевірте логи у Vercel Dashboard → Functions
3. Переконайтесь що база даних доступна

### Якщо не працює frontend:
1. Перевірте build логи
2. Переконайтесь що API URL налаштований правильно
3. Перевірте browser console для помилок

### Корисні команди:
```bash
# Перегляд логів
vercel logs

# Перегляд deployments
vercel ls

# Видалення deployment
vercel rm deployment-url
```

## 🎉 Готово!

Ваш Tasks Tracker тепер працює на Vercel з:
- ✅ Автоматичними deployment з Git
- ✅ Serverless API функціями
- ✅ PostgreSQL базою даних
- ✅ HTTPS сертифікатами
- ✅ Global CDN
- ✅ Автоматичними оновленнями

## 📞 Підтримка

Якщо виникли проблеми:
1. Перевірте [Vercel документацію](https://vercel.com/docs)
2. Подивіться логи у Vercel Dashboard
3. Перевірте статус Vercel на [status.vercel.com](https://status.vercel.com) 