# Telegram Mini App Setup Guide

## Как запустить YouTube Manager в Telegram Mini App

### Шаг 1: Создание Telegram Bot

1. Откройте Telegram и найдите бота [@BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например, "YouTube Manager")
   - Введите username бота (должен заканчиваться на `_bot`, например, `youtube_manager_bot`)
4. Скопируйте полученный **Bot Token** (выглядит как `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Шаг 2: Настройка Mini App

1. Отправьте @BotFather команду `/mybots`
2. Выберите ваш бот
3. Выберите "Bot Settings" → "Menu button" → "Configure menu button"
4. Отправьте URL вашего приложения (например, `https://youtube-manager.example.com`)

### Шаг 3: Развертывание приложения

Приложение уже готово к развертыванию. Используйте Management Dashboard для публикации:

1. Нажмите кнопку **Publish** в Management Dashboard
2. Выберите доступность (Public/Private)
3. Скопируйте URL приложения

### Шаг 4: Связывание с Telegram Bot

1. Отправьте @BotFather команду `/setmenubutton`
2. Выберите ваш бот
3. Вставьте URL приложения из шага 3

### Шаг 5: Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите кнопку меню (три точки)
3. Выберите "Menu button" или нажмите на кнопку приложения
4. Приложение должно открыться в Mini App

## Структура проекта

```
youtube-telegram-miniapp/
├── client/                 # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── pages/         # Страницы приложения
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # Custom hooks (включая useTelegram)
│   │   ├── lib/           # Библиотеки (tRPC)
│   │   ├── App.tsx        # Главный компонент
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML с Telegram SDK
├── server/                 # Backend (Express + tRPC)
│   ├── routers.ts         # tRPC процедуры
│   ├── db.ts              # Работа с БД
│   ├── youtube.ts         # YouTube API интеграция
│   └── storage.ts         # S3 хранилище
├── drizzle/               # Миграции БД
│   └── schema.ts          # Схема БД
└── shared/                # Общий код
```

## Основные функции

- **Поиск видео** - поиск видео на YouTube
- **Просмотр каналов** - информация о каналах и их видео
- **Управление API Key** - сохранение и удаление YouTube API Key
- **Поддержка Telegram Theme** - автоматическая смена темы оформления
- **Haptic Feedback** - вибрация при взаимодействии

## Переменные окружения

Приложение автоматически использует следующие переменные:

- `VITE_APP_TITLE` - Название приложения
- `VITE_APP_LOGO` - Логотип приложения
- `DATABASE_URL` - Строка подключения к БД
- `JWT_SECRET` - Секрет для подписи сессий
- `VITE_APP_ID` - ID приложения в Manus
- `OAUTH_SERVER_URL` - URL OAuth сервера

## Команды

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev

# Запуск тестов
pnpm test

# Сборка для production
pnpm build

# Миграция БД
pnpm db:push
```

## Поддержка

Для вопросов и проблем обратитесь к документации:
- [Telegram Mini App Documentation](https://core.telegram.org/bots/webapps)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Manus Documentation](https://docs.manus.im)

## Лицензия

MIT
