# Status Design Backend

Backend API для админ-панели сайта детейлинг-студии.

## Стек технологий

- **Backend**: Node.js + TypeScript + NestJS
- **ORM**: Prisma
- **БД**: PostgreSQL

## Установка и запуск

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка базы данных

Убедитесь, что PostgreSQL запущен. Отредактируйте `.env` файл с вашими данными подключения:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/statusdesign?schema=public"
```

### 3. Применение миграций

```bash
npx prisma migrate dev
```

Эта команда создаст таблицы в базе данных согласно схеме Prisma.

### 4. Запуск сервера

```bash
npm run start:dev
```

Backend будет доступен по адресу: **http://localhost:3000**

API доступен с префиксом `/api`, например: `http://localhost:3000/api/reviews`

## Структура API

### Reviews (Отзывы)

**Публичные эндпоинты:**
- `GET /api/reviews` - Получить все опубликованные отзывы

**Admin эндпоинты:**
- `GET /api/reviews/admin` - Получить все отзывы (включая неопубликованные)
- `GET /api/reviews/:id` - Получить отзыв по ID
- `POST /api/reviews/admin` - Создать новый отзыв
- `PUT /api/reviews/admin/:id` - Обновить отзыв
- `DELETE /api/reviews/admin/:id` - Удалить отзыв

**Поля модели Review:**
- `id` - Int, автоинкремент
- `rating` - Int (1-5)
- `service` - String (ключ услуги)
- `carBrand` - String
- `carModel` - String
- `text` - String
- `dateCreated` - DateTime (автоматически)
- `datePublished` - DateTime (устанавливается при публикации)
- `status` - Enum: PENDING, PUBLISHED, REJECTED
- `images` - String[] (массив URL)
- `servicesSelected` - String[]
- `tags` - String[]

### Posts (Новости и статьи)

**Публичные эндпоинты:**
- `GET /api/posts` - Получить все опубликованные посты
- `GET /api/posts/:slug` - Получить пост по slug (с инкрементом views)

**Admin эндпоинты:**
- `GET /api/posts/admin` - Получить все посты
- `GET /api/posts/admin/:id` - Получить пост по ID
- `POST /api/posts/admin` - Создать новый пост
- `PUT /api/posts/admin/:id` - Обновить пост
- `DELETE /api/posts/admin/:id` - Удалить пост

**Поля модели Post:**
- `id` - Int, автоинкремент
- `type` - Enum: NEWS, ARTICLE
- `slug` - String, уникальный
- `title` - String
- `image` - String (nullable)
- `category` - Enum: NEWS, ARTICLES
- `datePublished` - DateTime (устанавливается при публикации)
- `views` - Int (автоинкремент при просмотре)
- `excerpt` - String
- `content` - String (HTML/markdown)
- `tags` - String[]
- `priority` - Int (default 0)
- `status` - Enum: DRAFT, PUBLISHED

### Portfolio (Портфолио)

**Публичные эндпоинты:**
- `GET /api/portfolio` - Получить все опубликованные работы
- `GET /api/portfolio/:slug` - Получить работу по slug (с инкрементом views)

**Admin эндпоинты:**
- `GET /api/portfolio/admin` - Получить все работы
- `GET /api/portfolio/admin/:id` - Получить работу по ID
- `POST /api/portfolio/admin` - Создать новую работу
- `PUT /api/portfolio/admin/:id` - Обновить работу
- `DELETE /api/portfolio/admin/:id` - Удалить работу

**Поля модели PortfolioItem:**
- `id` - Int, автоинкремент
- `slug` - String, уникальный
- `title` - String
- `carBrand` - String
- `carModel` - String
- `services` - String[] (ключи услуг)
- `mainImage` - String
- `gallery` - String[] (массив URL)
- `description` - String
- `date` - DateTime
- `featured` - Boolean (default false)
- `views` - Int (автоинкремент при просмотре)
- `status` - Enum: DRAFT, PUBLISHED

### Uploads (Загрузка файлов)

**Admin эндпоинты:**
- `POST /api/uploads/images` - Загрузить изображение (multipart/form-data, поле `file`)
  - Возвращает: `{ url: "/uploads/filename.jpg" }`

Загруженные файлы доступны по адресу: `http://localhost:3000/uploads/filename.jpg`

## Бизнес-логика

### Автоматическая установка datePublished

При изменении статуса на `PUBLISHED` для Reviews и Posts автоматически устанавливается `datePublished` (если не было установлено ранее).

### Инкремент просмотров

При запросе Posts или Portfolio по slug автоматически увеличивается счетчик `views`.

## Разработка

### Полезные команды

```bash
# Генерация Prisma Client после изменения схемы
npx prisma generate

# Создание новой миграции
npx prisma migrate dev --name migration_name

# Просмотр базы данных через Prisma Studio
npx prisma studio

# Запуск в режиме разработки
npm run start:dev

# Сборка проекта
npm run build

# Запуск production версии
npm run start:prod
```

## CORS

CORS настроен для работы с админ-панелью на `http://localhost:5173`.
