# Tasks Tracker

Сучасний веб-додаток для трекінгу tasks з тайм-трекінгом та аналітикою.

## Функціональність

- ✅ Управління користувачами (реєстрація, авторизація)
- ✅ Створення/редагування/видалення tasks
- ✅ Система статусів та пріоритетів
- ✅ Тайм-трекінг з таймером
- ✅ Організація за projectами
- ✅ Search та фільтрація
- ✅ Нагадування про дедлайни
- ✅ Analytics та звітність
- ✅ Адаптивний дизайн

## Технології

### Frontend
- React 18 + TypeScript
- Vite
- Material-UI
- Zustand (State Management)
- React Query (Server State)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation

## Розробка

### Вимоги
- Node.js >= 18
- npm >= 9

### Встановлення

```bash
# Клонування репозиторію
git clone <repository-url>
cd tasks-tracker

# Встановлення залежностей
npm install

# Settings змінних середовища
cp .env.example .env
# Відредагуйте .env файл

# Запуск в режимі розробки
npm run dev
```

### Доступні команди

```bash
npm run dev          # Запуск фронтенду та бекенду
npm run dev:client   # Тільки фронтенд
npm run dev:server   # Тільки бекенд
npm run build        # Збірка для продакшену
npm run test         # Запуск тестів
npm run lint         # Лінтінг коду
npm run format       # Форматування коду
```

## Структура projectу

```
tasks-tracker/
├── packages/
│   ├── client/      # React фронтенд
│   ├── server/      # Express бекенд
│   └── shared/      # Загальні типи та утиліти
├── docs/            # Документація
└── docker/          # Docker конфігурація
```

## Розгортання

Project налаштований для розгортання на:
- Frontend: Vercel
- Backend: Railway.app
- Database: Supabase

## Ліцензія

MIT 