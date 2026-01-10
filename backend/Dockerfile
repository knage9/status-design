# Multi-stage build для NestJS приложения

# Stage 1: Build admin-client
FROM node:20-alpine AS admin-client-builder
WORKDIR /app/admin-client
COPY admin-client/package*.json ./
RUN npm ci
COPY admin-client/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
COPY --from=admin-client-builder /app/admin-client/dist ./admin-client/dist
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

# Установка зависимостей только для production
COPY package*.json ./
RUN npm ci --only=production

# Копируем собранные файлы
COPY --from=backend-builder /app/dist ./dist
COPY --from=admin-client-builder /app/admin-client/dist ./admin-client/dist

# Копируем необходимые файлы
COPY prisma ./prisma

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Устанавливаем Prisma CLI для миграций
RUN npm install -g prisma

EXPOSE 3000

# Запускаем миграции и приложение
CMD ["sh", "-c", "prisma migrate deploy && node dist/main"]
