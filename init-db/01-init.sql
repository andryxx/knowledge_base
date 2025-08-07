-- Инициализация базы данных Knowledge Base
-- Создаем расширение для UUID если его нет
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Устанавливаем временную зону
SET timezone = 'UTC';