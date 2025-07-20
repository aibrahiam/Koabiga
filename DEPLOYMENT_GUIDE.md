# 🚀 Koabiga Platform - Server Deployment Guide

This guide provides step-by-step instructions for deploying the Koabiga Laravel application to different server environments.

## 📋 Prerequisites

### Server Requirements
- **PHP**: 8.2+ (8.4.8 recommended)
- **Composer**: 2.8.9+
- **Node.js**: 18+ (for building assets)
- **npm**: Latest version
- **PostgreSQL**: 12+ (recommended) or MySQL 8.0+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **SSL Certificate**: Required for production

### Laravel Requirements
- **Laravel**: 12.19.3
- **Extensions**: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, cURL, GD, ZIP

## 🏗️ Deployment Options

### Option 1: VPS/Dedicated Server (Recommended)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx postgresql postgresql-contrib php8.4-fpm php8.4-cli php8.4-pgsql php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip php8.4-gd php8.4-bcmath php8.4-json php8.4-tokenizer php8.4-fileinfo php8.4-opcache php8.4-redis

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 2: Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE koabiga;
CREATE USER koabiga_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE koabiga TO koabiga_user;
ALTER USER koabiga_user CREATEDB;
\q
```

#### Step 3: Application Deployment

```bash
# Clone or upload your application
cd /var/www/
sudo git clone your-repo-url koabiga
cd koabiga

# Set ownership
sudo chown -R www-data:www-data /var/www/koabiga
sudo chmod -R 755 /var/www/koabiga

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci --production=false

# Build assets
npm run build

# Copy environment file
cp .env.example .env
```

#### Step 4: Environment Configuration

Edit `.env` file:

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
DB_PASSWORD=your_secure_password

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
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

#### Step 5: Laravel Setup

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (if needed)
php artisan db:seed --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Create storage link
php artisan storage:link

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/koabiga`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    root /var/www/koabiga/public;
    index index.php index.html index.htm;
    
    # Handle Laravel routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # PHP-FPM Configuration
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/koabiga /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 7: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: cPanel Shared Hosting

#### Step 1: Upload Files
1. Upload your application files to `public_html/` or a subdirectory
2. Ensure all files are uploaded (including hidden files)

#### Step 2: Run Deployment Script
```bash
# Make script executable
chmod +x deploy-cpanel.sh

# Run deployment
./deploy-cpanel.sh
```

#### Step 3: Configure .env
Update your `.env` file with cPanel database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=cpanel_username_dbname
DB_USERNAME=cpanel_username_dbuser
DB_PASSWORD=your_database_password
```

#### Step 4: Set Permissions
```bash
chmod 755 storage -R
chmod 755 bootstrap/cache -R
chmod 644 .env
```

### Option 3: Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader
RUN npm ci --production=false
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 storage bootstrap/cache

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: koabiga-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./storage:/var/www/storage
    networks:
      - koabiga-network

  nginx:
    image: nginx:alpine
    container_name: koabiga-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./public:/var/www/public
    networks:
      - koabiga-network

  db:
    image: postgres:15
    container_name: koabiga-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: koabiga
      POSTGRES_USER: koabiga_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - koabiga-network

  redis:
    image: redis:alpine
    container_name: koabiga-redis
    restart: unless-stopped
    networks:
      - koabiga-network

networks:
  koabiga-network:
    driver: bridge

volumes:
  db_data:
```

#### Step 3: Deploy with Docker

```bash
# Build and start containers
docker-compose up -d --build

# Run migrations
docker-compose exec app php artisan migrate --force

# Optimize Laravel
docker-compose exec app php artisan optimize
```

## 🔧 Post-Deployment Configuration

### 1. Queue Worker Setup (VPS/Dedicated)

```bash
# Create systemd service
sudo nano /etc/systemd/system/koabiga-queue.service
```

Add content:

```ini
[Unit]
Description=Koabiga Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/koabiga/artisan queue:work --sleep=3 --tries=3 --max-time=3600
StandardOutput=append:/var/log/koabiga-queue.log
StandardError=append:/var/log/koabiga-queue.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable koabiga-queue
sudo systemctl start koabiga-queue
```

### 2. Cron Jobs Setup

```bash
# Edit crontab
crontab -e

# Add Laravel scheduler
* * * * * cd /var/www/koabiga && php artisan schedule:run >> /dev/null 2>&1
```

### 3. Monitoring Setup

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up log rotation
sudo nano /etc/logrotate.d/koabiga
```

Add content:

```
/var/www/koabiga/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## 🔒 Security Checklist

- [ ] SSL certificate installed and configured
- [ ] APP_DEBUG=false in .env
- [ ] Strong database passwords
- [ ] File permissions set correctly
- [ ] Sensitive files protected (.env, .git)
- [ ] Firewall configured (UFW/iptables)
- [ ] Regular security updates enabled
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Rate limiting enabled

## 📊 Performance Optimization

### 1. OPcache Configuration

Edit `/etc/php/8.4/fpm/conf.d/10-opcache.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.enable_cli=1
```

### 2. Redis Configuration (Optional)

```bash
# Install Redis
sudo apt install redis-server

# Configure Laravel to use Redis
# Update .env:
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### 3. Database Optimization

```sql
-- PostgreSQL optimization
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

## 🚨 Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check file permissions
   - Verify .env configuration
   - Check Laravel logs: `tail -f storage/logs/laravel.log`

2. **Database Connection Issues**
   - Verify database credentials
   - Check database server status
   - Test connection: `php artisan tinker`

3. **Asset Loading Issues**
   - Verify build completed successfully
   - Check storage link: `php artisan storage:link`
   - Clear cache: `php artisan cache:clear`

4. **Queue Worker Issues**
   - Check queue worker status: `sudo systemctl status koabiga-queue`
   - Restart queue worker: `sudo systemctl restart koabiga-queue`

### Useful Commands

```bash
# Check Laravel status
php artisan about

# Clear all caches
php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear

# Rebuild caches
php artisan config:cache && php artisan route:cache && php artisan view:cache

# Check file permissions
ls -la storage/ bootstrap/cache/

# Monitor logs
tail -f storage/logs/laravel.log

# Test database connection
php artisan tinker --execute="echo 'DB: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');"
```

## 📞 Support

For deployment issues:
1. Check the Laravel logs in `storage/logs/`
2. Verify all prerequisites are met
3. Ensure proper file permissions
4. Test database connectivity
5. Review web server error logs

---

**🎉 Congratulations!** Your Koabiga application is now deployed and ready for production use. 