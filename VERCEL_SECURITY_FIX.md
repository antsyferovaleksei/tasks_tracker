# 🔧 Виправлення проблеми з Vercel Security

## Проблема
API endpoints захищені Vercel SSO і повертають "Authentication Required"

## Рішення

### Крок 1: Відкрийте налаштування безпеки
🔗 [Налаштування Security](https://vercel.com/aleksei-antsyferovs-projects/tasks-tracker-client/settings/security)

### Крок 2: Вимкніть захист
- ❌ **Vercel Authentication** → OFF
- ❌ **Password Protection** → OFF  
- ❌ **Trusted IPs** → OFF

### Крок 3: Збережіть
Натисніть **Save**

### Крок 4: Перевірте API
Після збереження, API має працювати:
- https://tasks-tracker-client.vercel.app/api
- https://tasks-tracker-client.vercel.app/api/auth/register
- https://tasks-tracker-client.vercel.app/api/auth/login

## ✅ Після виправлення

Ваш логін та реєстрація працюватимуть коректно з PostgreSQL базою даних! 