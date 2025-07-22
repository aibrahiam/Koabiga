#!/bin/bash

# Koabiga Deployment Verification Script
# This script verifies that all components are working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check service status
check_service() {
    local service_name=$1
    local display_name=$2
    
    if systemctl is-active --quiet "$service_name"; then
        print_success "$display_name is running"
    else
        print_error "$display_name is not running"
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file_path=$1
    local description=$2
    
    if [ -f "$file_path" ]; then
        print_success "$description exists"
    else
        print_error "$description does not exist"
        return 1
    fi
}

# Function to check directory exists
check_directory() {
    local dir_path=$1
    local description=$2
    
    if [ -d "$dir_path" ]; then
        print_success "$description exists"
    else
        print_error "$description does not exist"
        return 1
    fi
}

# Function to test database connection
test_database() {
    print_status "Testing database connection..."
    
    if cd /var/www/koabiga && php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');" 2>/dev/null | grep -q "OK"; then
        print_success "Database connection is working"
    else
        print_error "Database connection failed"
        return 1
    fi
}

# Function to test Laravel application
test_laravel() {
    print_status "Testing Laravel application..."
    
    if cd /var/www/koabiga && php artisan --version >/dev/null 2>&1; then
        print_success "Laravel application is working"
    else
        print_error "Laravel application test failed"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    print_status "Checking SSL certificate..."
    
    if sudo certbot certificates | grep -q "VALID"; then
        print_success "SSL certificate is valid"
    else
        print_warning "SSL certificate may not be valid"
    fi
}

# Function to check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$usage" -lt 80 ]; then
        print_success "Disk space is adequate ($usage% used)"
    else
        print_warning "Disk space is running low ($usage% used)"
    fi
}

# Function to check memory usage
check_memory() {
    print_status "Checking memory usage..."
    
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$usage" -lt 80 ]; then
        print_success "Memory usage is normal ($usage% used)"
    else
        print_warning "Memory usage is high ($usage% used)"
    fi
}

# Function to check application files
check_application_files() {
    print_status "Checking application files..."
    
    check_file "/var/www/koabiga/public/build/manifest.json" "Frontend build manifest"
    check_file "/var/www/koabiga/.env" "Environment configuration"
    check_directory "/var/www/koabiga/storage" "Storage directory"
    check_directory "/var/www/koabiga/bootstrap/cache" "Bootstrap cache directory"
    
    # Check storage link
    if [ -L "/var/www/koabiga/public/storage" ]; then
        print_success "Storage symbolic link exists"
    else
        print_error "Storage symbolic link is missing"
        return 1
    fi
}

# Function to check logs
check_logs() {
    print_status "Checking application logs..."
    
    if [ -f "/var/www/koabiga/storage/logs/laravel.log" ]; then
        local log_size=$(stat -c%s "/var/www/koabiga/storage/logs/laravel.log")
        if [ "$log_size" -lt 10485760 ]; then  # 10MB
            print_success "Laravel log file exists and is reasonable size"
        else
            print_warning "Laravel log file is large ($(($log_size / 1024 / 1024))MB)"
        fi
    else
        print_warning "Laravel log file does not exist"
    fi
    
    if [ -f "/var/log/koabiga-queue.log" ]; then
        print_success "Queue worker log exists"
    else
        print_warning "Queue worker log does not exist"
    fi
}

# Function to test web server
test_web_server() {
    print_status "Testing web server..."
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        print_success "Web server is responding"
    else
        print_error "Web server is not responding properly"
        return 1
    fi
}

# Function to check cron jobs
check_cron_jobs() {
    print_status "Checking cron jobs..."
    
    if crontab -l 2>/dev/null | grep -q "artisan schedule:run"; then
        print_success "Laravel scheduler cron job is configured"
    else
        print_error "Laravel scheduler cron job is missing"
        return 1
    fi
    
    if crontab -l 2>/dev/null | grep -q "certbot renew"; then
        print_success "SSL renewal cron job is configured"
    else
        print_warning "SSL renewal cron job is missing"
    fi
}

# Function to check firewall
check_firewall() {
    print_status "Checking firewall status..."
    
    if sudo ufw status | grep -q "Status: active"; then
        print_success "Firewall is active"
    else
        print_warning "Firewall is not active"
    fi
}

# Function to show system information
show_system_info() {
    echo ""
    echo "=========================================="
    echo "           SYSTEM INFORMATION"
    echo "=========================================="
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "PHP Version: $(php -r "echo PHP_VERSION;")"
    echo "Node Version: $(node --version)"
    echo "Nginx Version: $(nginx -v 2>&1)"
    echo "PostgreSQL Version: $(sudo -u postgres psql -c "SELECT version();" | head -2 | tail -1)"
    echo "=========================================="
}

# Function to show service status
show_service_status() {
    echo ""
    echo "=========================================="
    echo "           SERVICE STATUS"
    echo "=========================================="
    
    local services=(
        "nginx:Web Server (Nginx)"
        "php8.4-fpm:PHP-FPM"
        "postgresql:PostgreSQL"
        "koabiga-queue:Queue Worker"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r service_name display_name <<< "$service"
        if systemctl is-active --quiet "$service_name"; then
            echo "✅ $display_name: Running"
        else
            echo "❌ $display_name: Not Running"
        fi
    done
    
    echo "=========================================="
}

# Function to show recent logs
show_recent_logs() {
    echo ""
    echo "=========================================="
    echo "           RECENT LOGS"
    echo "=========================================="
    
    if [ -f "/var/www/koabiga/storage/logs/laravel.log" ]; then
        echo "Last 5 Laravel log entries:"
        tail -5 "/var/www/koabiga/storage/logs/laravel.log" | sed 's/^/  /'
    fi
    
    if [ -f "/var/log/koabiga-queue.log" ]; then
        echo ""
        echo "Last 5 Queue worker log entries:"
        tail -5 "/var/log/koabiga-queue.log" | sed 's/^/  /'
    fi
    
    echo "=========================================="
}

# Main verification function
main() {
    echo "=========================================="
    echo "    Koabiga Deployment Verification"
    echo "=========================================="
    echo ""
    
    local errors=0
    
    # Check services
    print_status "Checking system services..."
    check_service "nginx" "Nginx" || ((errors++))
    check_service "php8.4-fpm" "PHP-FPM" || ((errors++))
    check_service "postgresql" "PostgreSQL" || ((errors++))
    check_service "koabiga-queue" "Queue Worker" || ((errors++))
    
    # Check application
    print_status "Checking application components..."
    check_application_files || ((errors++))
    test_laravel || ((errors++))
    test_database || ((errors++))
    
    # Check web server
    test_web_server || ((errors++))
    
    # Check SSL
    check_ssl
    
    # Check system resources
    check_disk_space
    check_memory
    
    # Check logs
    check_logs
    
    # Check cron jobs
    check_cron_jobs || ((errors++))
    
    # Check firewall
    check_firewall
    
    # Show information
    show_system_info
    show_service_status
    show_recent_logs
    
    # Summary
    echo ""
    echo "=========================================="
    echo "           VERIFICATION SUMMARY"
    echo "=========================================="
    
    if [ $errors -eq 0 ]; then
        print_success "All critical components are working correctly!"
        echo ""
        echo "🎉 Your Koabiga deployment is healthy and ready for use!"
    else
        print_error "Found $errors critical issue(s) that need attention."
        echo ""
        echo "Please review the errors above and fix them."
    fi
    
    echo ""
    echo "Useful commands:"
    echo "- Check Laravel logs: tail -f /var/www/koabiga/storage/logs/laravel.log"
    echo "- Check queue logs: tail -f /var/log/koabiga-queue.log"
    echo "- Check Nginx logs: tail -f /var/log/nginx/koabiga_error.log"
    echo "- Restart queue worker: sudo systemctl restart koabiga-queue"
    echo "- Clear Laravel cache: cd /var/www/koabiga && php artisan cache:clear"
    echo "=========================================="
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "This script verifies the Koabiga deployment."
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --logs         Show recent logs only"
        echo "  --services     Show service status only"
        echo ""
        exit 0
        ;;
    --logs)
        show_recent_logs
        exit 0
        ;;
    --services)
        show_service_status
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 