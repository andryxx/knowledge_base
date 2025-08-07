FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci && npm cache clean --force

COPY src/ ./src/
COPY typeorm/ ./typeorm/

RUN npm run build

FROM node:18-alpine AS production

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/typeorm ./typeorm

RUN mkdir -p /app/logs

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]