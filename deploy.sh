#!/bin/bash

# Backend deployment script for VPS
# Usage: ./deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions for output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.prod file exists
if [ ! -f .env.prod ]; then
    log_error ".env.prod file not found!"
    log_info "Create .env.prod file with the following variables:"
    echo "DB_PASSWORD=your_secure_password"
    echo "JWT_SECRET=your_jwt_secret_min_32_chars"
    exit 1
fi

# Load environment variables from .env.prod
set -a
source .env.prod
set +a

# Check required variables
if [ -z "$DB_PASSWORD" ]; then
    log_error "DB_PASSWORD is not set in .env.prod"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    log_error "JWT_SECRET is not set in .env.prod"
    exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    log_error "JWT_SECRET must be at least 32 characters"
    exit 1
fi

log_info "Starting backend deployment..."

# Stop old containers
log_info "Stopping old containers..."
docker compose -f docker-compose.prod.yml down

# Build and start new containers
log_info "Building images..."
docker compose -f docker-compose.prod.yml build --no-cache

log_info "Starting containers..."
docker compose -f docker-compose.prod.yml up -d

# Wait for containers to start
log_info "Waiting for services to start..."
sleep 10

# Check container status
if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log_info "Containers started successfully!"
else
    log_error "Error starting containers!"
    docker compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Run database migrations
log_info "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api pnpm run db:migrate || {
    log_warn "Failed to run migrations. Try manually: docker compose -f docker-compose.prod.yml exec api pnpm run db:migrate"
}

# Output information
log_info "========================================"
log_info "Deployment completed successfully!"
log_info "API available on port 4000"
log_info "========================================"
log_info "Useful commands:"
echo "  View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          docker compose -f docker-compose.prod.yml down"
echo "  Restart:       docker compose -f docker-compose.prod.yml restart"
echo "  Status:        docker compose -f docker-compose.prod.yml ps"
