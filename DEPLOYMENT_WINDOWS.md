# Деплой на Windows (локальное тестирование)

## Быстрый старт

### 1. Убедитесь что Docker Desktop запущен

### 2. Создайте файл `.env.prod`
```powershell
cp .env.prod.example .env.prod
```

Откройте `.env.prod` и установите безопасные значения:
```env
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
```

### 3. Запустите деплой
```powershell
.\deploy.ps1
```

## Управление

### Просмотр логов
```powershell
docker compose -f docker-compose.prod.yml logs -f
```

### Остановка
```powershell
docker compose -f docker-compose.prod.yml down
```

### Перезапуск
```powershell
docker compose -f docker-compose.prod.yml restart
```

### Статус
```powershell
docker compose -f docker-compose.prod.yml ps
```

## Доступ к сервисам

- **API**: http://localhost:4000
- **Swagger документация**: http://localhost:4000/docs
- **PostgreSQL**: localhost:5432

## После тестирования на Windows

Когда всё работает локально, вы можете перенести на VPS:

1. Скопируйте файлы на VPS:
   - `docker-compose.prod.yml`
   - `Dockerfile.api`
   - `.dockerignore`
   - `deploy.sh`
   - Весь проект

2. На VPS создайте `.env.prod` с production паролями

3. Запустите деплой:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

Подробная инструкция для VPS находится в файле `DEPLOYMENT.md`
