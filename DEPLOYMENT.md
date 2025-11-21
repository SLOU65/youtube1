# Развертывание YouTube Telegram Mini App на Vercel + Supabase

## Шаг 1: Подготовка GitHub репозитория

1. Создайте аккаунт на [GitHub](https://github.com) (если его нет)
2. Создайте новый репозиторий `youtube-telegram-miniapp`
3. Загрузьте код проекта:

```bash
cd youtube-telegram-miniapp
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/youtube-telegram-miniapp.git
git push -u origin main
```

## Шаг 2: Создание Supabase проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project" или "New Project"
3. Заполните форму:
   - **Project name**: `youtube-manager`
   - **Database Password**: Придумайте сильный пароль и сохраните его
   - **Region**: Выберите ближайший регион
4. Нажмите "Create new project" и дождитесь инициализации (5-10 минут)

### Получение данных для подключения:

1. В Supabase перейдите в **Project Settings** → **Database**
2. Скопируйте **Connection String** (выглядит как `postgresql://...`)
3. Также скопируйте:
   - **Project URL** (из Settings → API)
   - **Anon Key** (из Settings → API)
   - **Service Role Key** (из Settings → API)

### Создание таблиц в Supabase:

1. В Supabase перейдите в **SQL Editor**
2. Нажмите "New Query"
3. Вставьте SQL из файла `drizzle/schema.sql` (или используйте миграции)
4. Выполните запрос

Если файла нет, используйте Drizzle миграции:

```bash
# Локально
DATABASE_URL="postgresql://..." pnpm db:push
```

## Шаг 3: Создание Vercel проекта

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Выберите "Import Git Repository"
4. Найдите и выберите репозиторий `youtube-telegram-miniapp`
5. Нажмите "Import"

### Настройка переменных окружения:

На странице "Configure Project" добавьте следующие переменные:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

VITE_APP_TITLE=YouTube Manager
VITE_APP_ID=your-app-id
VITE_APP_LOGO=https://your-logo-url.png
VITE_OAUTH_PORTAL_URL=https://your-oauth-url
OAUTH_SERVER_URL=https://your-oauth-server-url
JWT_SECRET=your-jwt-secret-key
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

**Важно**: Замените значения на ваши реальные данные!

## Шаг 4: Развертывание

1. После добавления переменных нажмите "Deploy"
2. Дождитесь завершения развертывания (обычно 2-5 минут)
3. После успешного развертывания вы получите URL вроде: `https://youtube-manager.vercel.app`

## Шаг 5: Настройка Telegram Bot

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте **Bot Token**

### Настройка Mini App:

1. Отправьте @BotFather команду `/setmenubutton`
2. Выберите ваш бот
3. Вставьте URL вашего приложения: `https://youtube-manager.vercel.app`

## Шаг 6: Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку приложения
3. Приложение должно открыться в Mini App

## Решение проблем

### Ошибка подключения к БД

- Проверьте, что `DATABASE_URL` правильный
- Убедитесь, что IP адрес Vercel добавлен в Supabase Firewall
- В Supabase перейдите в **Project Settings** → **Database** → **Firewall** и добавьте IP `0.0.0.0/0` (или IP Vercel)

### Ошибка при развертывании

- Проверьте логи в Vercel Dashboard
- Убедитесь, что все переменные окружения установлены
- Проверьте, что `package.json` содержит все зависимости

### Приложение не загружается

- Проверьте консоль браузера (F12) на ошибки
- Убедитесь, что все переменные окружения правильные
- Проверьте, что API доступен (откройте `https://youtube-manager.vercel.app/api/trpc/auth.me`)

## Обновление кода

После изменений в коде:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Vercel автоматически развернет новую версию.

## Полезные команды

```bash
# Проверить статус развертывания
vercel logs

# Просмотреть переменные окружения
vercel env ls

# Локальное тестирование перед развертыванием
vercel dev
```

## Дополнительная информация

- [Документация Vercel](https://vercel.com/docs)
- [Документация Supabase](https://supabase.com/docs)
- [Telegram Mini App API](https://core.telegram.org/bots/webapps)
- [YouTube Data API](https://developers.google.com/youtube/v3)

---

**Готово!** Ваше приложение теперь доступно в интернете и работает как Telegram Mini App! 🚀
