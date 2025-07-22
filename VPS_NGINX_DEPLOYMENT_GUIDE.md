# 🚀 Koabiga Platform - VPS Deployment Guide (Nginx)

A comprehensive guide for deploying the Koabiga Laravel application on a VPS with Nginx, PHP-FPM, and PostgreSQL.

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 22.04 LTS (recommended) or Debian 12
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2 cores minimum
- **Domain**: Pointed to your VPS IP address

### Software Requirements
- **PHP**: 8.2+ (8.4.8 recommended)
- **Composer**: 2.8.9+
- **Node.js**: 18+ (for building assets)
- **PostgreSQL**: 15+ (recommended)
- **Nginx**: 1.18+
- **Redis**: 7+ (optional, for caching)

## 🛠️ Step 1: Initial Server Setup

### 1.1 Update System
```bash
# Connect to your VPS
ssh root@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.2 Create Non-Root User
```bash
# Create a new user
sudo adduser koabiga
sudo usermod -aG sudo koabiga

# Switch to the new user
su - koabiga
```

### 1.3 Configure Firewall
```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 🐘 Step 2: Install PHP and Extensions

### 2.1 Add PHP Repository
```bash
# Add Ondřej Surý's PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
```

### 2.2 Install PHP 8.4 and Extensions
```bash
# Install PHP 8.4 and required extensions
sudo apt install -y php8.4-fpm php8.4-cli php8.4-common php8.4-mysql php8.4-pgsql php8.4-sqlite3 php8.4-bcmath php8.4-bz2 php8.4-curl php8.4-gd php8.4-gmp php8.4-intl php8.4-mbstring php8.4-xml php8.4-zip php8.4-opcache php8.4-redis php8.4-fileinfo php8.4-tokenizer php8.4-ctype php8.4-json php8.4-xmlreader php8.4-xmlwriter php8.4-simplexml php8.4-dom php8.4-phar php8.4-posix php8.4-session php8.4-pdo php8.4-pdo-pgsql php8.4-pdo-mysql php8.4-pdo-sqlite
```

### 2.3 Configure PHP-FPM
```bash
# Edit PHP-FPM configuration
sudo nano /etc/php/8.4/fpm/php.ini
```

Add/modify these settings:
```ini
; Memory and execution
memory_limit = 512M
max_execution_time = 300
max_input_time = 300
post_max_size = 100M
upload_max_filesize = 100M

; Error reporting (production)
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php8.4-fpm.log

; Session
session.gc_maxlifetime = 7200
session.cookie_lifetime = 7200

; OPcache
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.revalidate_freq = 2
opcache.fast_shutdown = 1
opcache.enable_cli = 1
```

### 2.4 Configure PHP-FPM Pool
```bash
# Edit the www pool configuration
sudo nano /etc/php/8.4/fpm/pool.d/www.conf
```

Modify these settings:
```ini
[www]
user = www-data
group = www-data
listen = /run/php/php8.4-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

### 2.5 Restart PHP-FPM
```bash
sudo systemctl restart php8.4-fpm
sudo systemctl enable php8.4-fpm
```

## 🗄️ Step 3: Install and Configure PostgreSQL

### 3.1 Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE koabiga;
CREATE USER koabiga_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE koabiga TO koabiga_user;
ALTER USER koabiga_user CREATEDB;
ALTER USER koabiga_user WITH SUPERUSER;

# Exit PostgreSQL
\q
```

### 3.3 Configure PostgreSQL for Remote Access (Optional)
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Uncomment and modify:
```conf
listen_addresses = 'localhost'
```

```bash
# Edit client authentication
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add this line for local connections:
```conf
local   all             koabiga_user                    md5
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 🌐 Step 4: Install and Configure Nginx

### 4.1 Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.2 Create Nginx Configuration
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/koabiga
```

Add this configuration:
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Document root
    root /var/www/koabiga/public;
    index index.php index.html index.htm;
    
    # Handle Laravel routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # PHP-FPM Configuration
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Security
        fastcgi_hide_header X-Powered-By;
        fastcgi_param HTTP_PROXY "";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    # Deny access to sensitive Laravel files
    location ~ ^/(\.env|composer\.json|composer\.lock|package\.json|package-lock\.json|artisan|README\.md|\.git) {
        deny all;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location /login {
        limit_req zone=login burst=5 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # Logging
    access_log /var/log/nginx/koabiga_access.log;
    error_log /var/log/nginx/koabiga_error.log;
}
```

### 4.3 Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/koabiga /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔧 Step 5: Install Composer and Node.js

### 5.1 Install Composer
```bash
# Download and install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

### 5.2 Install Node.js
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## 📦 Step 6: Deploy Application

### 6.1 Clone Application
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
sudo git clone https://github.com/yourusername/koabiga.git
cd koabiga

# Set ownership
sudo chown -R www-data:www-data /var/www/koabiga
sudo chmod -R 755 /var/www/koabiga
```

### 6.2 Install Dependencies
```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
npm ci --production=false
```

### 6.3 Build Assets
```bash
# Build frontend assets
npm run build

# Remove node_modules to save space
rm -rf node_modules
```

### 6.4 Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment file
nano .env
```

Update the `.env` file with your production settings:
```env
APP_NAME=Koabiga
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=koabiga
DB_USERNAME=koabiga_user
DB_PASSWORD=your_secure_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 6.5 Setup Laravel
```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## 🔒 Step 7: SSL Certificate Setup

### 7.1 Install Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7.2 Setup Auto-Renewal
```bash
# Add to crontab
sudo crontab -e

# Add this line
0 12 * * * /usr/bin/certbot renew --quiet
```

## ⚙️ Step 8: Queue Worker Setup

### 8.1 Create Systemd Service
```bash
# Create service file
sudo nano /etc/systemd/system/koabiga-queue.service
```

Add this content:
```ini
[Unit]
Description=Koabiga Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
RestartSec=3
ExecStart=/usr/bin/php /var/www/koabiga/artisan queue:work --sleep=3 --tries=3 --max-time=3600
StandardOutput=append:/var/log/koabiga-queue.log
StandardError=append:/var/log/koabiga-queue.log

[Install]
WantedBy=multi-user.target
```

### 8.2 Enable Queue Worker
```bash
# Enable and start service
sudo systemctl enable koabiga-queue
sudo systemctl start koabiga-queue

# Check status
sudo systemctl status koabiga-queue
```

## ⏰ Step 9: Cron Jobs Setup

### 9.1 Setup Laravel Scheduler
```bash
# Edit crontab
sudo crontab -e

# Add Laravel scheduler
* * * * * cd /var/www/koabiga && php artisan schedule:run >> /dev/null 2>&1
```

## 📊 Step 10: Monitoring and Logging

### 10.1 Install Monitoring Tools
```bash
# Install system monitoring tools
sudo apt install -y htop iotop nethogs

# Install log monitoring
sudo apt install -y logwatch
```

### 10.2 Setup Log Rotation
```bash
# Create log rotation configuration
sudo nano /etc/logrotate.d/koabiga
```

Add this content:
```
/var/www/koabiga/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload php8.4-fpm
    endscript
}

/var/log/koabiga-queue.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## 🔧 Step 11: Performance Optimization

### 11.1 Redis Setup (Optional)
```bash
# Install Redis
sudo apt install -y redis-server

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Update .env to use Redis
# CACHE_DRIVER=redis
# SESSION_DRIVER=redis
# QUEUE_CONNECTION=redis
```

### 11.2 Database Optimization
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Optimize PostgreSQL settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

# Reload configuration
SELECT pg_reload_conf();

# Exit
\q
```

## 🚨 Step 12: Security Hardening

### 12.1 Secure SSH
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

Add/modify these settings:
```conf
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers koabiga
```

```bash
# Restart SSH
sudo systemctl restart ssh
```

### 12.2 Fail2ban Setup
```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Create configuration
sudo nano /etc/fail2ban/jail.local
```

Add this content:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[koabiga-login]
enabled = true
filter = koabiga-login
logpath = /var/www/koabiga/storage/logs/laravel.log
maxretry = 5
bantime = 3600
```

```bash
# Start Fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## ✅ Step 13: Final Verification

### 13.1 Test Application
```bash
# Test Laravel
cd /var/www/koabiga
php artisan about

# Test database connection
php artisan tinker --execute="echo 'DB: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');"

# Check queue worker
sudo systemctl status koabiga-queue

# Test Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

### 13.2 Performance Test
```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test performance
ab -n 1000 -c 10 https://yourdomain.com/
```

## 📋 Deployment Checklist

- [ ] Server updated and secured
- [ ] PHP 8.4 with all extensions installed
- [ ] PostgreSQL configured and running
- [ ] Nginx configured and optimized
- [ ] SSL certificate installed
- [ ] Application deployed and configured
- [ ] Database migrated and seeded
- [ ] Queue worker running
- [ ] Cron jobs configured
- [ ] Monitoring tools installed
- [ ] Log rotation configured
- [ ] Security measures implemented
- [ ] Performance optimized
- [ ] Application tested and working

## 🚨 Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   ```bash
   # Check Laravel logs
   tail -f /var/www/koabiga/storage/logs/laravel.log
   
   # Check Nginx logs
   tail -f /var/log/nginx/koabiga_error.log
   
   # Check PHP-FPM logs
   tail -f /var/log/php8.4-fpm.log
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   sudo -u postgres psql -d koabiga -U koabiga_user
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Permission Issues**
   ```bash
   # Fix permissions
   sudo chown -R www-data:www-data /var/www/koabiga
   sudo chmod -R 755 /var/www/koabiga
   sudo chmod -R 775 /var/www/koabiga/storage
   sudo chmod -R 775 /var/www/koabiga/bootstrap/cache
   ```

4. **Queue Worker Issues**
   ```bash
   # Check queue worker status
   sudo systemctl status koabiga-queue
   
   # Restart queue worker
   sudo systemctl restart koabiga-queue
   
   # Check queue logs
   tail -f /var/log/koabiga-queue.log
   ```

### Useful Commands

```bash
# Laravel commands
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize

# Service management
sudo systemctl status nginx php8.4-fpm postgresql redis-server koabiga-queue

# Log monitoring
tail -f /var/log/nginx/koabiga_access.log
tail -f /var/www/koabiga/storage/logs/laravel.log

# Performance monitoring
htop
df -h
free -h
```

## 📞 Support

If you encounter issues:

1. Check the logs in `/var/www/koabiga/storage/logs/`
2. Verify all services are running: `sudo systemctl status`
3. Test database connectivity
4. Check file permissions
5. Review Nginx error logs

---

**🎉 Congratulations!** Your Koabiga application is now deployed and ready for production use.

**Default Admin Credentials:**
- Email: admin@koabiga.com
- Password: password

**Remember to:**
- Change default admin password
- Set up regular backups
- Monitor server resources
- Keep system updated
- Test all functionality thoroughly 