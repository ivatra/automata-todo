# Деплой бэкенда на VPS

Инструкция по развертыванию бэкенда (API + PostgreSQL) на VPS сервере через Docker.

## Предварительные требования

На VPS должны быть установлены:
- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)
- Git

## Установка Docker на VPS (если не установлен)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

## Шаги деплоя

### 1. Клонирование репозитория на VPS

```bash
git clone <your-repo-url> automata-todo
cd automata-todo
```

### 2. Настройка переменных окружения

Создайте файл `.env.prod` на основе примера:

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Установите следующие переменные:

```env
# Пароль для PostgreSQL (используйте надежный пароль)
DB_PASSWORD=your_secure_password_here

# JWT Secret (минимум 32 символа)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
```

**Важно:** Используйте сложные пароли для production! Например:
```bash
# Генерация безопасного пароля
openssl rand -base64 32
```

### 3. Запуск деплоя

```bash
chmod +x deploy.sh
./deploy.sh
```

Скрипт автоматически:
- Остановит старые контейнеры
- Соберет новые Docker образы
- Запустит PostgreSQL и API
- Выполнит миграции базы данных

### 4. Проверка статуса

```bash
# Проверить запущенные контейнеры
docker compose -f docker-compose.prod.yml ps

# Просмотреть логи
docker compose -f docker-compose.prod.yml logs -f api

# Проверить здоровье API
curl http://localhost:4000/health
```

## Управление сервисами

### Просмотр логов

```bash
# Все логи
docker compose -f docker-compose.prod.yml logs -f

# Только API
docker compose -f docker-compose.prod.yml logs -f api

# Только БД
docker compose -f docker-compose.prod.yml logs -f db
```

### Остановка сервисов

```bash
docker compose -f docker-compose.prod.yml down
```

### Перезапуск сервисов

```bash
docker compose -f docker-compose.prod.yml restart
```

### Обновление приложения

```bash
# 1. Получить последние изменения
git pull origin main

# 2. Запустить деплой
./deploy.sh
```

## Открытие портов на VPS

Если используете firewall (ufw, iptables), откройте порт 4000:

```bash
# UFW
sudo ufw allow 4000/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 4000 -j ACCEPT
```

## Настройка Nginx (опционально)

Для использования домена и SSL сертификата, настройте Nginx как reverse proxy:

```bash
sudo apt-get install nginx certbot python3-certbot-nginx
```

Создайте конфиг `/etc/nginx/sites-available/automata-todo`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфиг и получите SSL:

```bash
sudo ln -s /etc/nginx/sites-available/automata-todo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

## Бэкапы базы данных

### Создание бэкапа

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres automata_todo > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U postgres automata_todo < backup_20231201_120000.sql
```

### Автоматические бэкапы (cron)

Добавьте в crontab (`crontab -e`):

```bash
# Ежедневный бэкап в 3:00 AM
0 3 * * * cd /path/to/automata-todo && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres automata_todo > /backups/automata_todo_$(date +\%Y\%m\%d).sql
```

## Мониторинг

### Проверка использования ресурсов

```bash
docker stats
```

### Проверка места на диске

```bash
df -h
docker system df
```

### Очистка старых образов

```bash
docker system prune -a
```

## Troubleshooting

### Контейнеры не запускаются

```bash
# Просмотр подробных логов
docker compose -f docker-compose.prod.yml logs --tail=100

# Проверка переменных окружения
cat .env.prod
```

### База данных недоступна

```bash
# Проверка здоровья БД
docker compose -f docker-compose.prod.yml exec db pg_isready -U postgres

# Подключение к БД
docker compose -f docker-compose.prod.yml exec db psql -U postgres automata_todo
```

### Ошибки миграций

```bash
# Запуск миграций вручную
docker compose -f docker-compose.prod.yml exec api pnpm run db:migrate
```

## Безопасность

1. **Не коммитьте `.env.prod`** в Git - файл уже добавлен в `.gitignore`
2. Используйте сложные пароли (минимум 32 символа)
3. Регулярно обновляйте Docker образы
4. Настройте firewall на VPS
5. Используйте SSL сертификаты для production
6. Ограничьте доступ к порту 5432 PostgreSQL (только внутри Docker сети)

## Полезные команды

```bash
# Вход в контейнер API
docker compose -f docker-compose.prod.yml exec api sh

# Вход в PostgreSQL
docker compose -f docker-compose.prod.yml exec db psql -U postgres automata_todo

# Просмотр таблиц в БД
docker compose -f docker-compose.prod.yml exec db psql -U postgres automata_todo -c "\dt"

# Пересборка без кеша
docker compose -f docker-compose.prod.yml build --no-cache

# Удаление всех данных (ОСТОРОЖНО!)
docker compose -f docker-compose.prod.yml down -v
```
