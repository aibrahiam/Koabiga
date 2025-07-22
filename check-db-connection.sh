#!/bin/bash

# Koabiga Database Connection Checker
# This script checks database connectivity and configuration

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

# Function to check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found in current directory"
        print_error "Please run this script from the Koabiga application root directory"
        exit 1
    fi
    print_success ".env file found"
}

# Function to extract database configuration from .env
get_db_config() {
    print_status "Reading database configuration from .env..."
    
    # Extract database settings
    DB_CONNECTION=$(grep "^DB_CONNECTION=" .env | cut -d '=' -f2)
    DB_HOST=$(grep "^DB_HOST=" .env | cut -d '=' -f2)
    DB_PORT=$(grep "^DB_PORT=" .env | cut -d '=' -f2)
    DB_DATABASE=$(grep "^DB_DATABASE=" .env | cut -d '=' -f2)
    DB_USERNAME=$(grep "^DB_USERNAME=" .env | cut -d '=' -f2)
    DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2)
    
    # Set defaults if not found
    DB_CONNECTION=${DB_CONNECTION:-mysql}
    DB_HOST=${DB_HOST:-127.0.0.1}
    DB_PORT=${DB_PORT:-3306}
    DB_DATABASE=${DB_DATABASE:-koabiga}
    DB_USERNAME=${DB_USERNAME:-root}
    DB_PASSWORD=${DB_PASSWORD:-}
    
    print_success "Database configuration loaded"
}

# Function to display database configuration
show_db_config() {
    echo ""
    echo "=========================================="
    echo "        DATABASE CONFIGURATION"
    echo "=========================================="
    echo "Connection: $DB_CONNECTION"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_DATABASE"
    echo "Username: $DB_USERNAME"
    echo "Password: ${DB_PASSWORD:0:3}***"
    echo "=========================================="
    echo ""
}

# Function to check if database tools are available
check_database_tools() {
    print_status "Checking database tools availability..."
    
    case $DB_CONNECTION in
        "pgsql"|"postgresql")
            if command -v psql >/dev/null 2>&1; then
                print_success "PostgreSQL client (psql) is available"
            else
                print_error "PostgreSQL client (psql) is not installed"
                print_error "Install with: sudo apt install postgresql-client"
                return 1
            fi
            ;;
        "mysql")
            if command -v mysql >/dev/null 2>&1; then
                print_success "MySQL client is available"
            else
                print_error "MySQL client is not installed"
                print_error "Install with: sudo apt install mysql-client"
                return 1
            fi
            ;;
        "sqlite")
            if command -v sqlite3 >/dev/null 2>&1; then
                print_success "SQLite client is available"
            else
                print_error "SQLite client is not installed"
                print_error "Install with: sudo apt install sqlite3"
                return 1
            fi
            ;;
        *)
            print_warning "Unknown database connection type: $DB_CONNECTION"
            ;;
    esac
}

# Function to test direct database connection
test_direct_connection() {
    print_status "Testing direct database connection..."
    
    case $DB_CONNECTION in
        "pgsql"|"postgresql")
            if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -c "SELECT version();" >/dev/null 2>&1; then
                print_success "Direct PostgreSQL connection successful"
                
                # Get database info
                echo ""
                print_status "Database information:"
                PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -c "SELECT version();" | head -2
                
                # Check table count
                TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
                echo "Tables in database: $TABLE_COUNT"
                
            else
                print_error "Direct PostgreSQL connection failed"
                return 1
            fi
            ;;
        "mysql")
            if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SELECT VERSION();" >/dev/null 2>&1; then
                print_success "Direct MySQL connection successful"
                
                # Get database info
                echo ""
                print_status "Database information:"
                mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SELECT VERSION();" | head -2
                
                # Check table count
                TABLE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SHOW TABLES;" | wc -l)
                echo "Tables in database: $((TABLE_COUNT - 1))"
                
            else
                print_error "Direct MySQL connection failed"
                return 1
            fi
            ;;
        "sqlite")
            if [ -f "$DB_DATABASE" ]; then
                print_success "SQLite database file exists"
                
                # Get database info
                echo ""
                print_status "Database information:"
                sqlite3 "$DB_DATABASE" "SELECT sqlite_version();"
                
                # Check table count
                TABLE_COUNT=$(sqlite3 "$DB_DATABASE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
                echo "Tables in database: $TABLE_COUNT"
                
            else
                print_error "SQLite database file not found: $DB_DATABASE"
                return 1
            fi
            ;;
        *)
            print_warning "Skipping direct connection test for $DB_CONNECTION"
            ;;
    esac
}

# Function to test Laravel database connection
test_laravel_connection() {
    print_status "Testing Laravel database connection..."
    
    if php artisan tinker --execute="echo 'Laravel DB Connection: ' . (DB::connection()->getPdo() ? 'SUCCESS' : 'FAILED');" 2>/dev/null | grep -q "SUCCESS"; then
        print_success "Laravel database connection successful"
        
        # Test basic Laravel database operations
        echo ""
        print_status "Testing Laravel database operations..."
        
        # Test connection info
        php artisan tinker --execute="echo 'Database name: ' . DB::connection()->getDatabaseName();" 2>/dev/null || true
        
        # Test table count
        php artisan tinker --execute="echo 'Tables count: ' . count(DB::select('SHOW TABLES'));" 2>/dev/null || true
        
        # Test user count (if users table exists)
        php artisan tinker --execute="echo 'Users count: ' . (class_exists('App\Models\User') ? App\Models\User::count() : 'User model not found');" 2>/dev/null || true
        
    else
        print_error "Laravel database connection failed"
        return 1
    fi
}

# Function to check database migrations
check_migrations() {
    print_status "Checking database migrations..."
    
    if php artisan migrate:status >/dev/null 2>&1; then
        print_success "Migrations system is working"
        
        echo ""
        print_status "Migration status:"
        php artisan migrate:status | head -20
        
        # Count pending migrations
        PENDING=$(php artisan migrate:status | grep -c "| No" || echo "0")
        if [ "$PENDING" -gt 0 ]; then
            print_warning "Found $PENDING pending migrations"
        else
            print_success "All migrations are up to date"
        fi
        
    else
        print_error "Migration system is not working"
        return 1
    fi
}

# Function to check database performance
check_database_performance() {
    print_status "Checking database performance..."
    
    case $DB_CONNECTION in
        "pgsql"|"postgresql")
            if command -v psql >/dev/null 2>&1; then
                echo ""
                print_status "PostgreSQL performance metrics:"
                
                # Connection count
                CONN_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -c "SELECT COUNT(*) FROM pg_stat_activity;" | tr -d ' ')
                echo "Active connections: $CONN_COUNT"
                
                # Database size
                DB_SIZE=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_DATABASE'));" | tr -d ' ')
                echo "Database size: $DB_SIZE"
                
            fi
            ;;
        "mysql")
            if command -v mysql >/dev/null 2>&1; then
                echo ""
                print_status "MySQL performance metrics:"
                
                # Connection count
                CONN_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SHOW STATUS LIKE 'Threads_connected';" | tail -1 | awk '{print $2}')
                echo "Active connections: $CONN_COUNT"
                
                # Database size
                DB_SIZE=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = '$DB_DATABASE';" | tail -1)
                echo "Database size: ${DB_SIZE}MB"
                
            fi
            ;;
        "sqlite")
            if [ -f "$DB_DATABASE" ]; then
                echo ""
                print_status "SQLite performance metrics:"
                
                # Database size
                DB_SIZE=$(stat -c%s "$DB_DATABASE")
                echo "Database size: $((DB_SIZE / 1024))KB"
                
            fi
            ;;
    esac
}

# Function to check database logs
check_database_logs() {
    print_status "Checking database logs..."
    
    case $DB_CONNECTION in
        "pgsql"|"postgresql")
            if [ -f "/var/log/postgresql/postgresql-*.log" ]; then
                echo ""
                print_status "Recent PostgreSQL log entries:"
                tail -5 /var/log/postgresql/postgresql-*.log 2>/dev/null | sed 's/^/  /' || print_warning "No PostgreSQL logs found"
            fi
            ;;
        "mysql")
            if [ -f "/var/log/mysql/error.log" ]; then
                echo ""
                print_status "Recent MySQL log entries:"
                tail -5 /var/log/mysql/error.log 2>/dev/null | sed 's/^/  /' || print_warning "No MySQL logs found"
            fi
            ;;
    esac
}

# Function to test database backup
test_database_backup() {
    print_status "Testing database backup capability..."
    
    BACKUP_DIR="db_backups"
    mkdir -p "$BACKUP_DIR"
    
    case $DB_CONNECTION in
        "pgsql"|"postgresql")
            if command -v pg_dump >/dev/null 2>&1; then
                BACKUP_FILE="$BACKUP_DIR/backup_test_$(date +%Y%m%d_%H%M%S).sql"
                if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" "$DB_DATABASE" > "$BACKUP_FILE" 2>/dev/null; then
                    print_success "Database backup test successful: $BACKUP_FILE"
                    BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE")
                    echo "Backup size: $((BACKUP_SIZE / 1024))KB"
                    rm "$BACKUP_FILE"
                else
                    print_error "Database backup test failed"
                fi
            else
                print_warning "pg_dump not available for backup testing"
            fi
            ;;
        "mysql")
            if command -v mysqldump >/dev/null 2>&1; then
                BACKUP_FILE="$BACKUP_DIR/backup_test_$(date +%Y%m%d_%H%M%S).sql"
                if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" > "$BACKUP_FILE" 2>/dev/null; then
                    print_success "Database backup test successful: $BACKUP_FILE"
                    BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE")
                    echo "Backup size: $((BACKUP_SIZE / 1024))KB"
                    rm "$BACKUP_FILE"
                else
                    print_error "Database backup test failed"
                fi
            else
                print_warning "mysqldump not available for backup testing"
            fi
            ;;
        "sqlite")
            if [ -f "$DB_DATABASE" ]; then
                BACKUP_FILE="$BACKUP_DIR/backup_test_$(date +%Y%m%d_%H%M%S).sqlite"
                if cp "$DB_DATABASE" "$BACKUP_FILE" 2>/dev/null; then
                    print_success "Database backup test successful: $BACKUP_FILE"
                    BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE")
                    echo "Backup size: $((BACKUP_SIZE / 1024))KB"
                    rm "$BACKUP_FILE"
                else
                    print_error "Database backup test failed"
                fi
            fi
            ;;
    esac
    
    rmdir "$BACKUP_DIR" 2>/dev/null || true
}

# Function to show troubleshooting tips
show_troubleshooting_tips() {
    echo ""
    echo "=========================================="
    echo "        TROUBLESHOOTING TIPS"
    echo "=========================================="
    
    case $DB_CONNECTION in
        "pgsql"|"postgresql")
            echo "PostgreSQL Issues:"
            echo "1. Check if PostgreSQL is running: sudo systemctl status postgresql"
            echo "2. Check PostgreSQL logs: sudo tail -f /var/log/postgresql/postgresql-*.log"
            echo "3. Test connection: sudo -u postgres psql -d $DB_DATABASE"
            echo "4. Check user permissions: sudo -u postgres psql -c '\du'"
            echo "5. Restart PostgreSQL: sudo systemctl restart postgresql"
            ;;
        "mysql")
            echo "MySQL Issues:"
            echo "1. Check if MySQL is running: sudo systemctl status mysql"
            echo "2. Check MySQL logs: sudo tail -f /var/log/mysql/error.log"
            echo "3. Test connection: mysql -u $DB_USERNAME -p $DB_DATABASE"
            echo "4. Check user permissions: mysql -u root -p -e 'SHOW GRANTS FOR $DB_USERNAME@localhost;'"
            echo "5. Restart MySQL: sudo systemctl restart mysql"
            ;;
        "sqlite")
            echo "SQLite Issues:"
            echo "1. Check file permissions: ls -la $DB_DATABASE"
            echo "2. Check disk space: df -h"
            echo "3. Test SQLite: sqlite3 $DB_DATABASE '.tables'"
            echo "4. Fix permissions: sudo chown www-data:www-data $DB_DATABASE"
            ;;
    esac
    
    echo ""
    echo "Laravel Issues:"
    echo "1. Clear config cache: php artisan config:clear"
    echo "2. Check Laravel logs: tail -f storage/logs/laravel.log"
    echo "3. Test Laravel connection: php artisan tinker"
    echo "4. Check .env file: cat .env | grep DB_"
    echo "5. Run migrations: php artisan migrate:status"
    echo "=========================================="
}

# Function to show summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           DATABASE CHECK SUMMARY"
    echo "=========================================="
    
    local errors=0
    
    # Count errors from previous tests
    if [ $DIRECT_CONNECTION_ERROR -eq 1 ]; then
        ((errors++))
    fi
    
    if [ $LARAVEL_CONNECTION_ERROR -eq 1 ]; then
        ((errors++))
    fi
    
    if [ $MIGRATION_ERROR -eq 1 ]; then
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "All database checks passed!"
        echo ""
        echo "✅ Database configuration is correct"
        echo "✅ Direct database connection works"
        echo "✅ Laravel database connection works"
        echo "✅ Migrations are properly configured"
        echo ""
        echo "🎉 Your database is ready for use!"
    else
        print_error "Found $errors issue(s) with database connectivity"
        echo ""
        echo "Please review the errors above and use the troubleshooting tips below."
        show_troubleshooting_tips
    fi
    
    echo ""
    echo "Useful commands:"
    echo "- Check database status: php artisan tinker --execute='echo DB::connection()->getPdo() ? \"OK\" : \"FAILED\";'"
    echo "- View migrations: php artisan migrate:status"
    echo "- Clear cache: php artisan config:clear"
    echo "- Check logs: tail -f storage/logs/laravel.log"
    echo "=========================================="
}

# Main function
main() {
    echo "=========================================="
    echo "    Koabiga Database Connection Checker"
    echo "=========================================="
    echo ""
    
    # Initialize error flags
    DIRECT_CONNECTION_ERROR=0
    LARAVEL_CONNECTION_ERROR=0
    MIGRATION_ERROR=0
    
    # Check if we're in the right directory
    check_env_file
    
    # Get database configuration
    get_db_config
    
    # Show configuration
    show_db_config
    
    # Check database tools
    check_database_tools
    
    # Test direct connection
    if ! test_direct_connection; then
        DIRECT_CONNECTION_ERROR=1
    fi
    
    # Test Laravel connection
    if ! test_laravel_connection; then
        LARAVEL_CONNECTION_ERROR=1
    fi
    
    # Check migrations
    if ! check_migrations; then
        MIGRATION_ERROR=1
    fi
    
    # Check performance
    check_database_performance
    
    # Check logs
    check_database_logs
    
    # Test backup
    test_database_backup
    
    # Show summary
    show_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "This script checks database connectivity and configuration."
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --config       Show only database configuration"
        echo "  --direct       Test only direct database connection"
        echo "  --laravel      Test only Laravel database connection"
        echo "  --migrations   Check only migrations status"
        echo "  --performance  Show only performance metrics"
        echo "  --backup       Test only database backup"
        echo ""
        echo "Examples:"
        echo "  $0              # Full database check"
        echo "  $0 --config     # Show configuration only"
        echo "  $0 --direct     # Test direct connection only"
        exit 0
        ;;
    --config)
        check_env_file
        get_db_config
        show_db_config
        exit 0
        ;;
    --direct)
        check_env_file
        get_db_config
        check_database_tools
        test_direct_connection
        exit 0
        ;;
    --laravel)
        check_env_file
        get_db_config
        test_laravel_connection
        exit 0
        ;;
    --migrations)
        check_env_file
        check_migrations
        exit 0
        ;;
    --performance)
        check_env_file
        get_db_config
        check_database_performance
        exit 0
        ;;
    --backup)
        check_env_file
        get_db_config
        test_database_backup
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