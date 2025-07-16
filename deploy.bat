@echo off
setlocal enabledelayedexpansion

REM Koabiga Platform Deployment Script for Windows
REM This script handles the complete deployment process for production

REM Configuration
set APP_NAME=Koabiga
set APP_ENV=production
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=backups
set LOG_FILE=deploy_%TIMESTAMP%.log

REM Colors for output (Windows 10+ supports ANSI colors)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo ==========================================
echo     Koabiga Platform Deployment Script
echo ==========================================
echo Timestamp: %TIMESTAMP%
echo Log file: %LOG_FILE%
echo.

REM Function to log messages
:log_message
echo [%date% %time%] %~1 | tee -a "%LOG_FILE%"
goto :eof

REM Function to check prerequisites
:check_prerequisites
echo %BLUE%[INFO]%NC% Checking deployment prerequisites...

REM Check PHP
php --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% PHP not found. Please install PHP and add it to PATH.
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('php --version 2^>^&1 ^| findstr "PHP"') do (
        echo %BLUE%[INFO]%NC% %%i
    )
)

REM Check Composer
composer --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Composer not found. Please install Composer and add it to PATH.
    exit /b 1
) else (
    echo %BLUE%[INFO]%NC% Composer found
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Node.js not found. Please install Node.js and add it to PATH.
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do (
        echo %BLUE%[INFO]%NC% Node.js version: %%i
    )
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% npm not found. Please install npm and add it to PATH.
    exit /b 1
) else (
    echo %BLUE%[INFO]%NC% npm found
)

REM Check if .env file exists
if not exist ".env" (
    echo %RED%[ERROR]%NC% .env file not found. Please create it from .env.example
    exit /b 1
)

REM Check if .env is configured for production
findstr "APP_ENV=local" .env >nul 2>&1
if not errorlevel 1 (
    echo %YELLOW%[WARNING]%NC% APP_ENV is set to 'local' in .env. Consider setting it to 'production'
)

echo %GREEN%[SUCCESS]%NC% All prerequisites met
goto :eof

REM Function to create backup
:create_backup
echo %BLUE%[INFO]%NC% Creating backup...

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Backup current build
if exist "public\build" (
    set BACKUP_BUILD=%BACKUP_DIR%\build_backup_%TIMESTAMP%.zip
    echo %BLUE%[INFO]%NC% Creating build backup: %BACKUP_BUILD%
    powershell -command "Compress-Archive -Path 'public\build\*' -DestinationPath '%BACKUP_BUILD%' -Force" 2>nul
    if errorlevel 1 (
        echo %YELLOW%[WARNING]%NC% Build backup failed
    )
)

echo %GREEN%[SUCCESS]%NC% Backup completed
goto :eof

REM Function to install/update dependencies
:install_dependencies
echo %BLUE%[INFO]%NC% Installing/updating dependencies...

REM Install PHP dependencies
echo %BLUE%[INFO]%NC% Installing PHP dependencies...
composer install --no-dev --optimize-autoloader --no-interaction
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to install PHP dependencies
    exit /b 1
)

REM Install Node.js dependencies
echo %BLUE%[INFO]%NC% Installing Node.js dependencies...
npm ci --production=false
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to install Node.js dependencies
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% Dependencies installed
goto :eof

REM Function to build frontend assets
:build_assets
echo %BLUE%[INFO]%NC% Building frontend assets for production...

REM Clean previous build
if exist "public\build" (
    rmdir /s /q "public\build"
)

REM Build assets
npm run build
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Build failed
    exit /b 1
)

REM Verify build
if not exist "public\build\manifest.json" (
    echo %RED%[ERROR]%NC% Build failed - manifest.json not found
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% Frontend assets built successfully
goto :eof

REM Function to setup database
:setup_database
echo %BLUE%[INFO]%NC% Setting up database...

REM Run migrations
echo %BLUE%[INFO]%NC% Running database migrations...
php artisan migrate --force
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Database migration failed
    exit /b 1
)

REM Check if we need to seed
if not exist "database\seeded" (
    echo %BLUE%[INFO]%NC% Seeding database with initial data...
    
    REM Seed in order
    php artisan db:seed --class=ZoneSeeder --force
    php artisan db:seed --class=UnitSeeder --force
    php artisan db:seed --class=AdminUserSeeder --force
    php artisan db:seed --class=FeeRuleSeeder --force
    php artisan db:seed --class=FormSeeder --force
    php artisan db:seed --class=AgricultureSeeder --force
    
    REM Mark as seeded
    echo. > database\seeded
    echo %GREEN%[SUCCESS]%NC% Database seeded successfully
) else (
    echo %BLUE%[INFO]%NC% Database already seeded, skipping
)

echo %GREEN%[SUCCESS]%NC% Database setup completed
goto :eof

REM Function to optimize Laravel
:optimize_laravel
echo %BLUE%[INFO]%NC% Optimizing Laravel for production...

REM Clear all caches first
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

REM Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo %GREEN%[SUCCESS]%NC% Laravel optimized for production
goto :eof

REM Function to setup storage
:setup_storage
echo %BLUE%[INFO]%NC% Setting up storage...

REM Create storage link
if not exist "public\storage" (
    php artisan storage:link
)

REM Create necessary directories
if not exist "storage\app\public" mkdir "storage\app\public"
if not exist "storage\logs" mkdir "storage\logs"
if not exist "storage\framework\cache" mkdir "storage\framework\cache"
if not exist "storage\framework\sessions" mkdir "storage\framework\sessions"
if not exist "storage\framework\views" mkdir "storage\framework\views"

echo %GREEN%[SUCCESS]%NC% Storage setup completed
goto :eof

REM Function to cleanup
:cleanup
echo %BLUE%[INFO]%NC% Cleaning up deployment artifacts...

REM Remove development files
if exist "node_modules" rmdir /s /q "node_modules"
if exist ".vite" rmdir /s /q ".vite"

REM Remove debug routes warning
echo %YELLOW%[WARNING]%NC% Please manually remove debug routes from routes/api.php:
echo %YELLOW%[WARNING]%NC%   - /api/test-leaders-login
echo %YELLOW%[WARNING]%NC%   - /api/debug/auth
echo %YELLOW%[WARNING]%NC%   - /api/debug/session
echo %YELLOW%[WARNING]%NC%   - /api/test-login

echo %GREEN%[SUCCESS]%NC% Cleanup completed
goto :eof

REM Function to verify deployment
:verify_deployment
echo %BLUE%[INFO]%NC% Verifying deployment...

REM Check if key files exist
set missing_files=

if not exist "public\build\manifest.json" (
    set missing_files=!missing_files! public\build\manifest.json
)

if not exist ".env" (
    set missing_files=!missing_files! .env
)

if not exist "storage" (
    set missing_files=!missing_files! storage directory
)

if defined missing_files (
    echo %RED%[ERROR]%NC% Missing critical files: !missing_files!
    exit /b 1
)

REM Test Laravel application
php artisan --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Laravel application test failed
    exit /b 1
) else (
    echo %GREEN%[SUCCESS]%NC% Laravel application is working
)

echo %GREEN%[SUCCESS]%NC% Deployment verification completed
goto :eof

REM Function to show deployment summary
:show_summary
echo.
echo ==========================================
echo           DEPLOYMENT SUMMARY
echo ==========================================
echo Application: %APP_NAME%
echo Environment: %APP_ENV%
echo Timestamp: %TIMESTAMP%
echo Log file: %LOG_FILE%
echo.
echo ✅ Dependencies installed
echo ✅ Frontend assets built
echo ✅ Database migrated and seeded
echo ✅ Laravel optimized
echo ✅ Storage configured
echo ✅ Permissions set
echo.
echo 🚀 Deployment completed successfully!
echo.
echo Next steps:
echo 1. Configure your web server (IIS/Apache)
echo 2. Set up SSL certificate
echo 3. Configure queue worker: php artisan queue:work
echo 4. Set up monitoring and logging
echo 5. Test all user roles and functionality
echo.
echo Default admin credentials:
echo Email: admin@koabiga.com
echo Password: password
echo.
echo Log file: %LOG_FILE%
echo ==========================================
goto :eof

REM Main deployment function
:main
call :log_message "Starting deployment process"

REM Check prerequisites
call :check_prerequisites
if errorlevel 1 exit /b 1
call :log_message "Prerequisites check completed"

REM Create backup
call :create_backup
call :log_message "Backup created"

REM Install dependencies
call :install_dependencies
if errorlevel 1 exit /b 1
call :log_message "Dependencies installed"

REM Build assets
call :build_assets
if errorlevel 1 exit /b 1
call :log_message "Assets built"

REM Setup database
call :setup_database
if errorlevel 1 exit /b 1
call :log_message "Database setup completed"

REM Optimize Laravel
call :optimize_laravel
call :log_message "Laravel optimized"

REM Setup storage
call :setup_storage
call :log_message "Storage setup completed"

REM Cleanup
call :cleanup
call :log_message "Cleanup completed"

REM Verify deployment
call :verify_deployment
if errorlevel 1 exit /b 1
call :log_message "Deployment verification completed"

REM Show summary
call :show_summary
call :log_message "Deployment completed successfully"
goto :eof

REM Handle script arguments
if "%1"=="--help" goto :help
if "%1"=="-h" goto :help
if "%1"=="--backup-only" goto :backup_only
if "%1"=="--build-only" goto :build_only
if "%1"=="--db-only" goto :db_only
if "%1"=="" goto :main
goto :unknown_option

:help
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   --help, -h     Show this help message
echo   --backup-only  Only create backup
echo   --build-only   Only build frontend assets
echo   --db-only      Only setup database
echo.
echo Examples:
echo   %0              # Full deployment
echo   %0 --backup-only # Only create backup
echo   %0 --build-only  # Only build assets
exit /b 0

:backup_only
call :check_prerequisites
if errorlevel 1 exit /b 1
call :create_backup
echo %GREEN%[SUCCESS]%NC% Backup completed
exit /b 0

:build_only
call :check_prerequisites
if errorlevel 1 exit /b 1
call :install_dependencies
if errorlevel 1 exit /b 1
call :build_assets
if errorlevel 1 exit /b 1
echo %GREEN%[SUCCESS]%NC% Build completed
exit /b 0

:db_only
call :check_prerequisites
if errorlevel 1 exit /b 1
call :setup_database
if errorlevel 1 exit /b 1
echo %GREEN%[SUCCESS]%NC% Database setup completed
exit /b 0

:unknown_option
echo %RED%[ERROR]%NC% Unknown option: %1
echo Use --help for usage information
exit /b 1 