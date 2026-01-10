# Инструкция по деплою на VPS сервер

Этот документ описывает процесс развертывания приложения Status Design на VPS сервере.

## Требования

- VPS сервер с Ubuntu 20.04+ (или другой Linux дистрибутив)
- SSH доступ к серверу
- Docker и Docker Compose установлены на сервере
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске

## Подготовка сервера

### 1. Установка Docker

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose (если не установлен)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка сессии (или выход и вход снова)
newgrp docker
```

### 2. Клонирование репозитория

```bash
# Переход в директорию для проектов
cd /opt  # или в другую директорию по вашему выбору

# Клонирование репозитория
git clone <your-repository-url> status-design
cd status-design
```

### 3. Настройка переменных окружения

```bash
# Копирование примера .env файла
cp .env.example .env

# Редактирование .env файла
nano .env
```

**Важно настроить следующие переменные:**

```env
# Безопасный пароль для базы данных
DB_PASSWORD=your_very_secure_password_here

# Секретный ключ для JWT токенов (используйте случайную строку)
JWT_SECRET=your_random_secret_key_here_min_32_chars

# Порт для frontend (80 для HTTP, можно настроить HTTPS позже)
FRONTEND_PORT=80

# Порт для backend API
BACKEND_PORT=3000
```

**Для генерации безопасного JWT_SECRET:**
```bash
openssl rand -base64 32
```

## Деплой

### Способ 1: Использование скрипта деплоя

```bash
# Делаем скрипт исполняемым
chmod +x deploy.sh

# Запускаем деплой
./deploy.sh
```

### Способ 2: Ручной деплой

```bash
# Создание директории для логов nginx
mkdir -p nginx/logs

# Сборка и запуск всех сервисов
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

## Проверка работы

После успешного деплоя проверьте:

1. **Frontend:** `http://your-server-ip`
2. **Admin панель:** `http://your-server-ip/admin`
3. **API:** `http://your-server-ip/api`

### Проверка через curl

```bash
# Проверка API
curl http://localhost/api

# Проверка frontend
curl http://localhost
```

## Управление приложением

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только база данных
docker-compose logs -f postgres

# Только nginx
docker-compose logs -f nginx
```

### Остановка приложения

```bash
docker-compose down
```

### Перезапуск приложения

```bash
docker-compose restart
```

### Остановка с удалением данных

```bash
# ⚠️ ВНИМАНИЕ: Это удалит все данные в базе данных!
docker-compose down -v
```

### Обновление приложения

```bash
# Получение последних изменений
git pull

# Пересборка и перезапуск
docker-compose up -d --build
```

## Настройка HTTPS (опционально)

Для настройки HTTPS рекомендуется использовать Let's Encrypt через certbot:

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата (замените your-domain.com на ваш домен)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

После этого обновите nginx.conf для поддержки HTTPS или используйте отдельный конфиг для HTTPS.

## Настройка домена

1. Настройте DNS записи вашего домена, указывающие на IP адрес VPS сервера:
   - A запись: `@ -> your-server-ip`
   - A запись: `www -> your-server-ip`

2. Обновите nginx.conf, заменив `server_name _;` на `server_name your-domain.com www.your-domain.com;`

3. Перезапустите nginx:
   ```bash
   docker-compose restart nginx
   ```

## Резервное копирование

### Резервное копирование базы данных

```bash
# Создание резервной копии
docker-compose exec postgres pg_dump -U postgres status_design > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из резервной копии
docker-compose exec -T postgres psql -U postgres status_design < backup_20240101_120000.sql
```

### Резервное копирование загруженных файлов

```bash
# Создание архива с загруженными файлами
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```

## Мониторинг

### Проверка использования ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Использование диска
df -h

# Использование памяти
free -h
```

## Решение проблем

### Приложение не запускается

1. Проверьте логи: `docker-compose logs`
2. Проверьте статус контейнеров: `docker-compose ps`
3. Убедитесь, что порты не заняты: `sudo netstat -tulpn | grep :80`

### База данных не подключается

1. Проверьте переменные окружения в `.env`
2. Проверьте логи postgres: `docker-compose logs postgres`
3. Убедитесь, что контейнер postgres запущен: `docker-compose ps postgres`

### Ошибки миграций Prisma

```bash
# Запуск миграций вручную
docker-compose exec backend npx prisma migrate deploy

# Или через sh
docker-compose exec backend sh -c "prisma migrate deploy"
```

### Очистка и перезапуск

```bash
# Остановка и удаление контейнеров
docker-compose down

# Очистка старых образов (опционально)
docker system prune -a

# Запуск заново
docker-compose up -d --build
```

## Полезные команды

```bash
# Зайти в контейнер backend
docker-compose exec backend sh

# Зайти в базу данных
docker-compose exec postgres psql -U postgres -d status_design

# Выполнить Prisma команды
docker-compose exec backend npx prisma studio  # Откроет Prisma Studio

# Перезапуск конкретного сервиса
docker-compose restart backend

# Просмотр использования ресурсов
docker stats
```

## Обновление существующего деплоя

Если у вас уже установлено приложение и нужно просто обновить его до новой версии:

```bash
# Использование скрипта обновления
chmod +x update.sh
./update.sh
```

Скрипт обновления:
- ✅ Создаст резервную копию базы данных
- ✅ Получит последние изменения из git (если используется)
- ✅ Пересоберет образы Docker
- ✅ Перезапустит контейнеры с сохранением данных
- ✅ Применит миграции базы данных

**Важно:** Скрипт сохраняет все данные:
- База данных (volumes)
- Загруженные файлы (uploads)
- Настройки (.env файл)

### Ручное обновление

```bash
# Получение изменений
git pull

# Пересборка и перезапуск
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Применение миграций (если нужно)
docker-compose exec backend npx prisma migrate deploy
```

## Контакты и поддержка

При возникновении проблем проверьте логи приложения или обратитесь к разработчикам проекта.
