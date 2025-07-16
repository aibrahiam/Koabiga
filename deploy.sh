#!/bin/bash

# Koabiga Platform Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Koabiga"
APP_ENV="production"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    local missing_deps=()
    
    # Check PHP
    if ! command_exists php; then
        missing_deps+=("PHP")
    else
        PHP_VERSION=$(php -r "echo PHP_VERSION;")
        print_status "PHP version: $PHP_VERSION"
    fi
    
    # Check Composer
    if ! command_exists composer; then
        missing_deps+=("Composer")
    else
        print_status "Composer found"
    fi
    
    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("Node.js")
    else
        NODE_VERSION=$(node --version)
        print_status "Node.js version: $NODE_VERSION"
    fi
    
    # Check npm
    if ! command_exists npm; then
        missing_deps+=("npm")
    else
        print_status "npm found"
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please create it from .env.example"
        exit 1
    fi
    
    # Check if .env is configured for production
    if grep -q "APP_ENV=local" .env; then
        print_warning "APP_ENV is set to 'local' in .env. Consider setting it to 'production'"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies before running this script"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Backup database (if possible)
    if [ -f ".env" ]; then
        DB_CONNECTION=$(grep "DB_CONNECTION=" .env | cut -d '=' -f2)
        if [ "$DB_CONNECTION" = "pgsql" ]; then
            DB_HOST=$(grep "DB_HOST=" .env | cut -d '=' -f2)
            DB_PORT=$(grep "DB_PORT=" .env | cut -d '=' -f2)
            DB_DATABASE=$(grep "DB_DATABASE=" .env | cut -d '=' -f2)
            DB_USERNAME=$(grep "DB_USERNAME=" .env | cut -d '=' -f2)
            
            if [ -n "$DB_HOST" ] && [ -n "$DB_DATABASE" ] && [ -n "$DB_USERNAME" ]; then
                BACKUP_FILE="$BACKUP_DIR/database_backup_${TIMESTAMP}.sql"
                print_status "Creating database backup: $BACKUP_FILE"
                
                if command_exists pg_dump; then
                    PGPASSWORD=$(grep "DB_PASSWORD=" .env | cut -d '=' -f2) pg_dump -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USERNAME" "$DB_DATABASE" > "$BACKUP_FILE" 2>/dev/null || print_warning "Database backup failed (this is normal if database doesn't exist yet)"
                else
                    print_warning "pg_dump not found, skipping database backup"
                fi
            fi
        fi
    fi
    
    # Backup current build
    if [ -d "public/build" ]; then
        BACKUP_BUILD="$BACKUP_DIR/build_backup_${TIMESTAMP}.tar.gz"
        print_status "Creating build backup: $BACKUP_BUILD"
        tar -czf "$BACKUP_BUILD" public/build/ 2>/dev/null || print_warning "Build backup failed"
    fi
    
    print_success "Backup completed"
}

# Function to install/update dependencies
install_dependencies() {
    print_status "Installing/updating dependencies..."
    
    # Install PHP dependencies
    print_status "Installing PHP dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm ci --production=false
    
    print_success "Dependencies installed"
}

# Function to build frontend assets
build_assets() {
    print_status "Building frontend assets for production..."
    
    # Clean previous build
    if [ -d "public/build" ]; then
        rm -rf public/build
    fi
    
    # Build assets
    npm run build
    
    # Verify build
    if [ ! -f "public/build/manifest.json" ]; then
        print_error "Build failed - manifest.json not found"
        exit 1
    fi
    
    print_success "Frontend assets built successfully"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Run migrations
    print_status "Running database migrations..."
    php artisan migrate --force
    
    # Check if we need to seed
    if [ ! -f "database/seeded" ]; then
        print_status "Seeding database with initial data..."
        
        # Seed in order
        php artisan db:seed --class=ZoneSeeder --force
        php artisan db:seed --class=UnitSeeder --force
        php artisan db:seed --class=AdminUserSeeder --force
        php artisan db:seed --class=FeeRuleSeeder --force
        php artisan db:seed --class=FormSeeder --force
        php artisan db:seed --class=AgricultureSeeder --force
        
        # Mark as seeded
        touch database/seeded
        print_success "Database seeded successfully"
    else
        print_status "Database already seeded, skipping"
    fi
    
    print_success "Database setup completed"
}

# Function to optimize Laravel
optimize_laravel() {
    print_status "Optimizing Laravel for production..."
    
    # Clear all caches first
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
    
    # Cache configurations
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    print_success "Laravel optimized for production"
}

# Function to setup storage
setup_storage() {
    print_status "Setting up storage..."
    
    # Create storage link
    if [ ! -L "public/storage" ]; then
        php artisan storage:link
    fi
    
    # Set proper permissions
    chmod -R 755 storage/
    chmod -R 755 bootstrap/cache/
    
    # Create necessary directories
    mkdir -p storage/app/public
    mkdir -p storage/logs
    mkdir -p storage/framework/cache
    mkdir -p storage/framework/sessions
    mkdir -p storage/framework/views
    
    print_success "Storage setup completed"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up deployment artifacts..."
    
    # Remove development files
    rm -rf node_modules/
    rm -rf .vite/
    rm -f *.tsbuildinfo
    
    # Remove debug routes (if they exist)
    if [ -f "routes/api.php" ]; then
        # Create backup of original file
        cp routes/api.php routes/api.php.backup
        
        # Remove debug routes (this is a simple approach - you might want to do this manually)
        print_warning "Please manually remove debug routes from routes/api.php:"
        print_warning "  - /api/test-leaders-login"
        print_warning "  - /api/debug/auth"
        print_warning "  - /api/debug/session"
        print_warning "  - /api/test-login"
    fi
    
    print_success "Cleanup completed"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if key files exist
    local missing_files=()
    
    if [ ! -f "public/build/manifest.json" ]; then
        missing_files+=("public/build/manifest.json")
    fi
    
    if [ ! -f ".env" ]; then
        missing_files+=(".env")
    fi
    
    if [ ! -d "storage" ]; then
        missing_files+=("storage directory")
    fi
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        print_error "Missing critical files: ${missing_files[*]}"
        return 1
    fi
    
    # Test Laravel application
    if php artisan --version >/dev/null 2>&1; then
        print_success "Laravel application is working"
    else
        print_error "Laravel application test failed"
        return 1
    fi
    
    # Check if we can connect to database
    if php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');" 2>/dev/null | grep -q "OK"; then
        print_success "Database connection verified"
    else
        print_warning "Database connection test failed (this might be normal if database is not configured yet)"
    fi
    
    print_success "Deployment verification completed"
}

# Function to display deployment summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "Application: $APP_NAME"
    echo "Environment: $APP_ENV"
    echo "Timestamp: $TIMESTAMP"
    echo "Log file: $LOG_FILE"
    echo ""
    echo "✅ Dependencies installed"
    echo "✅ Frontend assets built"
    echo "✅ Database migrated and seeded"
    echo "✅ Laravel optimized"
    echo "✅ Storage configured"
    echo "✅ Permissions set"
    echo ""
    echo "🚀 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your web server (Nginx/Apache)"
    echo "2. Set up SSL certificate"
    echo "3. Configure queue worker: php artisan queue:work"
    echo "4. Set up monitoring and logging"
    echo "5. Test all user roles and functionality"
    echo ""
    echo "Default admin credentials:"
    echo "Email: admin@koabiga.com"
    echo "Password: password"
    echo ""
    echo "Log file: $LOG_FILE"
    echo "=========================================="
}

# Main deployment function
main() {
    echo "=========================================="
    echo "    Koabiga Platform Deployment Script"
    echo "=========================================="
    echo "Timestamp: $TIMESTAMP"
    echo "Log file: $LOG_FILE"
    echo ""
    
    # Start logging
    log_message "Starting deployment process"
    
    # Check prerequisites
    check_prerequisites
    log_message "Prerequisites check completed"
    
    # Create backup
    create_backup
    log_message "Backup created"
    
    # Install dependencies
    install_dependencies
    log_message "Dependencies installed"
    
    # Build assets
    build_assets
    log_message "Assets built"
    
    # Setup database
    setup_database
    log_message "Database setup completed"
    
    # Optimize Laravel
    optimize_laravel
    log_message "Laravel optimized"
    
    # Setup storage
    setup_storage
    log_message "Storage setup completed"
    
    # Cleanup
    cleanup
    log_message "Cleanup completed"
    
    # Verify deployment
    verify_deployment
    log_message "Deployment verification completed"
    
    # Show summary
    show_summary
    log_message "Deployment completed successfully"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --backup-only  Only create backup"
        echo "  --build-only   Only build frontend assets"
        echo "  --db-only      Only setup database"
        echo ""
        echo "Examples:"
        echo "  $0              # Full deployment"
        echo "  $0 --backup-only # Only create backup"
        echo "  $0 --build-only  # Only build assets"
        exit 0
        ;;
    --backup-only)
        check_prerequisites
        create_backup
        print_success "Backup completed"
        exit 0
        ;;
    --build-only)
        check_prerequisites
        install_dependencies
        build_assets
        print_success "Build completed"
        exit 0
        ;;
    --db-only)
        check_prerequisites
        setup_database
        print_success "Database setup completed"
        exit 0
        ;;
    "")
        # No arguments, run full deployment
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 