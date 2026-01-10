#!/bin/bash

# Скрипт деплоя на VPS сервер
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем деплой Status Design на VPS..."

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker сначала."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose сначала."
    exit 1
fi

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаю из .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Файл .env создан. Пожалуйста, отредактируйте его и установите правильные значения!"
        echo "   Особенно важно изменить DB_PASSWORD и JWT_SECRET!"
        exit 1
    else
        echo "❌ Файл .env.example не найден!"
        exit 1
    fi
fi

# Создание директории для логов nginx
mkdir -p nginx/logs

# Остановка старых контейнеров (если есть)
echo "🛑 Останавливаем старые контейнеры..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Сборка и запуск
echo "🔨 Собираем образы и запускаем контейнеры..."
docker-compose up -d --build || docker compose up -d --build

# Ожидание готовности базы данных
echo "⏳ Ждем готовности базы данных..."
sleep 5

# Проверка статуса
echo "📊 Проверяем статус контейнеров..."
docker-compose ps || docker compose ps

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📝 Полезные команды:"
echo "   - Просмотр логов: docker-compose logs -f"
echo "   - Остановка: docker-compose down"
echo "   - Перезапуск: docker-compose restart"
echo "   - Просмотр статуса: docker-compose ps"
echo ""
echo "🌐 Приложение доступно по адресу:"
echo "   - Frontend: http://your-server-ip"
echo "   - Admin панель: http://your-server-ip/admin"
echo "   - API: http://your-server-ip/api"
echo ""
