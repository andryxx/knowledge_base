# Используем Node.js 18 Alpine как базовый образ
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY tsconfig*.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci && npm cache clean --force

# Копируем исходный код
COPY src/ ./src/
COPY typeorm/ ./typeorm/

# Собираем приложение
RUN npm run build

# Production образ
FROM node:18-alpine AS production

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Создаем пользователя для приложения
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/typeorm ./typeorm

# Создаем директории для логов
RUN mkdir -p /app/logs

# Меняем владельца файлов
RUN chown -R nestjs:nodejs /app
USER nestjs

# Открываем порт
EXPOSE 3000

# Healthcheck (временно отключен)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3000/health || exit 1

# Запускаем приложение
CMD ["node", "dist/src/main.js"]