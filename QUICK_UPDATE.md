# Быстрое обновление на VPS

## Для обновления существующего деплоя

Если у вас уже установлена старая версия админки, используйте этот скрипт:

```bash
# 1. Зайдите на сервер по SSH
ssh user@your-server-ip

# 2. Перейдите в директорию проекта
cd /path/to/status-design  # замените на ваш путь

# 3. Делаем скрипт исполняемым (если еще не сделано)
chmod +x update.sh

# 4. Запускаем обновление
./update.sh
```

Скрипт автоматически:
- ✅ Создаст резервную копию базы данных
- ✅ Получит последние изменения из git
- ✅ Пересоберет Docker образы
- ✅ Перезапустит контейнеры
- ✅ Применит миграции базы данных
- ✅ Сохранит все ваши данные (uploads, БД)

## Если что-то пошло не так

Просмотр логов:
```bash
docker-compose logs -f --tail=50
```

Перезапуск конкретного сервиса:
```bash
docker-compose restart backend
```

Восстановление из резервной копии (если нужно):
```bash
docker-compose exec -T postgres psql -U postgres status_design < backups/backup_YYYYMMDD_HHMMSS.sql
```

## Альтернативный способ (ручной)

Если скрипт не работает, можно обновить вручную:

```bash
# Остановка контейнеров
docker-compose down

# Получение изменений
git pull

# Пересборка и запуск
docker-compose build --no-cache
docker-compose up -d

# Применение миграций
docker-compose exec backend npx prisma migrate deploy
```
