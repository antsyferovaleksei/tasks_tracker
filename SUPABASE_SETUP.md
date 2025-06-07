# 🗄️ Налаштування Supabase PostgreSQL

## Крок 1: Створення проекту Supabase

1. **Перейдіть на** [supabase.com](https://supabase.com)
2. **Зареєструйтеся** or увійдіть в існуючий акаунт
3. **Натисніть** "New Project"
4. **Заповніть дані:**
   - Name: `tasks-tracker`
   - Database Password: `створіть сильний пароль`
   - Region: `оберіть найближчий до вас`
5. **Натисніть** "Create new project"

## Крок 2: Отримання Database URL

1. **Перейдіть у Settings** → **Database**
2. **Знайдіть секцію** "Connection string"
3. **Оберіть** "Nodejs" 
4. **Скопіюйте** connection string, він виглядає так:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

## Крок 3: Налаштування Environment Variables у Vercel

1. **Перейдіть у** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Оберіть ваш проект** `tasks-tracker-client`
3. **Перейдіть у** Settings → Environment Variables
4. **Додайте змінну:**
   - **Name:** `DATABASE_URL`
   - **Value:** `ваш_connection_string_з_supabase`
   - **Environment:** Production (і Deployment якщо потрібно)

## Крок 4: Тестування локально

1. **Створіть файл** `.env` у корені проекту:
   ```bash
   cp env.example .env
   ```

2. **Відредагуйте** `.env` файл:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   NODE_ENV=development
   ```

3. **Тестуйте локально:**
   ```bash
   npm run dev
   ```

## Крок 5: Деплой на Vercel

```bash
npm run build:vercel
vercel --prod
```

## 🔍 Структура бази даних

API автоматично створить таблицю `users`:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

## ✅ Переваги Supabase

- ✨ **Безкоштовний tier** до 500MB
- 🚀 **Швидке налаштування** 
- 🔐 **Вбудована аутентифікація** (можна використати пізніше)
- 📊 **Зручна панель адміністратора**
- 🌍 **Глобальна CDN**
- 📝 **Автоматичні бекапи**

## 🛠️ Додаткові можливості

Пізніше можна додати:
- Real-time subscriptions
- Row Level Security (RLS)
- Storage для файлів
- Edge Functions

## 🔧 Troubleshooting

### Помилка підключення:
- Перевірте правильність DATABASE_URL
- Переконайтеся що IP адреса дозволена (Supabase дозволяє всі за замовчуванням)

### Таблиці не створюються:
- Перевірте логи у Vercel Functions
- Переконайтеся що Environment Variables встановлені

### Повільні запити:
- Додайте індекси для часто використовуваних полів
- Розгляньте Connection Pooling 