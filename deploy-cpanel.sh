#!/bin/bash

# Koabiga Platform Deployment Script for cPanel Shared Hosting
# This script handles deployment on cPanel environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="Koabiga"
APP_ENV="production"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="deploy_${TIMESTAMP}.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Start deployment
echo "=========================================="
echo "  Koabiga Platform - cPanel Deployment"
echo "=========================================="
log_message "Starting deployment..."

# Check prerequisites
print_status "Checking prerequisites..."

# Check PHP
if ! command -v php &> /dev/null; then
    print_error "PHP is not installed or not in PATH"
    exit 1
fi
print_success "PHP found: $(php -v | head -n1)"

# Check Composer
if ! command -v composer &> /dev/null; then
    print_error "Composer is not installed"
    exit 1
fi
print_success "Composer found: $(composer --version | head -n1)"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing via nvm..."
    
    # Install nvm if not exists
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    else
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install Node.js
    nvm install 18
    nvm use 18
    nvm alias default 18
fi

print_success "Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not available"
    exit 1
fi
print_success "npm found: $(npm --version)"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
    else
        print_error ".env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
print_success "PHP dependencies installed"

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install --production
print_success "Node.js dependencies installed"

# Build frontend assets
print_status "Building frontend assets..."
npm run build
print_success "Frontend assets built"

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    print_status "Generating application key..."
    php artisan key:generate --force
    print_success "Application key generated"
fi

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force
print_success "Database migrations completed"

# Clear and cache config
print_status "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
print_success "Laravel optimized"

# Set proper permissions
print_status "Setting file permissions..."
chmod 755 storage -R
chmod 755 bootstrap/cache -R
chmod 644 .env
print_success "File permissions set"

# Create storage link if needed
if [ ! -L "public/storage" ]; then
    print_status "Creating storage link..."
    php artisan storage:link
    print_success "Storage link created"
fi

# Final checks
print_status "Performing final checks..."

# Check if app is accessible
if [ -f "public/index.php" ]; then
    print_success "Application files are in place"
else
    print_error "public/index.php not found"
    exit 1
fi

# Check database connection
if php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');" 2>/dev/null; then
    print_success "Database connection verified"
else
    print_warning "Database connection test failed - check your .env configuration"
fi

# Check PostgreSQL connection specifically
print_status "Testing PostgreSQL connection..."
if command -v psql &> /dev/null; then
    print_success "PostgreSQL client found: $(psql --version)"
else
    print_warning "PostgreSQL client not found in PATH"
fi

print_success "Deployment completed successfully!"
log_message "Deployment completed successfully"

echo ""
echo "=========================================="
echo "  Deployment Summary"
echo "=========================================="
echo "✅ PHP dependencies installed"
echo "✅ Node.js dependencies installed"
echo "✅ Frontend assets built"
echo "✅ Database migrated"
echo "✅ Laravel optimized"
echo "✅ File permissions set"
echo ""
echo "📝 Next steps:"
echo "1. Configure your .env file with database credentials"
echo "2. Set up your domain in cPanel"
echo "3. Point your domain to the public/ directory"
echo "4. Test your application"
echo ""
echo "📋 Log file: $LOG_FILE" 