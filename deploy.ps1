# PowerShell script for deployment on Windows
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

# Functions for colored output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env.prod file exists
if (-not (Test-Path ".env.prod")) {
    Write-Error-Custom ".env.prod file not found!"
    Write-Info "Create .env.prod file with the following variables:"
    Write-Host "DB_PASSWORD=your_secure_password"
    Write-Host "JWT_SECRET=your_jwt_secret_min_32_chars"
    exit 1
}

# Load environment variables from .env.prod
Get-Content .env.prod | ForEach-Object {
    if ($_ -and $_ -notmatch '^\s*#' -and $_ -match '=') {
        $parts = $_ -split '=', 2
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        Set-Item -Path "env:$name" -Value $value
        Write-Info "Loaded variable: $name"
    }
}

# Check required variables
if (-not $env:DB_PASSWORD) {
    Write-Error-Custom "DB_PASSWORD is not set in .env.prod"
    exit 1
}

if (-not $env:JWT_SECRET) {
    Write-Error-Custom "JWT_SECRET is not set in .env.prod"
    exit 1
}

if ($env:JWT_SECRET.Length -lt 32) {
    Write-Error-Custom "JWT_SECRET must be at least 32 characters (current length: $($env:JWT_SECRET.Length))"
    exit 1
}

Write-Info "Starting backend deployment..."

# Stop old containers
Write-Info "Stopping old containers..."
docker compose -f docker-compose.prod.yml down

# Build and start new containers
Write-Info "Building images (this may take a few minutes)..."
docker compose -f docker-compose.prod.yml build

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Error building images!"
    exit 1
}

Write-Info "Starting containers..."
docker compose -f docker-compose.prod.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Error starting containers!"
    docker compose -f docker-compose.prod.yml logs --tail=50
    exit 1
}

# Wait for containers to start
Write-Info "Waiting for services to start..."
Start-Sleep -Seconds 15

# Check container status
Write-Info "Checking container status..."
docker compose -f docker-compose.prod.yml ps

# Check API logs
Write-Info "Recent API logs:"
docker compose -f docker-compose.prod.yml logs --tail=20 api

# Output information
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Info "Deployment completed!"
Write-Host "========================================" -ForegroundColor Cyan
Write-Info "API available at: http://localhost:4000"
Write-Host ""
Write-Info "Useful commands:"
Write-Host "  View logs:     docker compose -f docker-compose.prod.yml logs -f"
Write-Host "  Stop:          docker compose -f docker-compose.prod.yml down"
Write-Host "  Restart:       docker compose -f docker-compose.prod.yml restart"
Write-Host "  Status:        docker compose -f docker-compose.prod.yml ps"
Write-Host ""
Write-Info "Check API health:"
Write-Host "  curl http://localhost:4000/health"
