# 🚀 Koabiga cPanel Deployment Guide

## 📋 cPanel Shared Hosting Requirements

### Hosting Requirements
- **PHP**: 8.2+ (8.4 recommended)
- **Apache**: 2.4+ with mod_rewrite enabled
- **MySQL**: 5.7+ or PostgreSQL 12+
- **SSL Certificate**: Free Let's Encrypt (usually included)
- **File Manager**: Access to upload and edit files
- **Database Manager**: Access to create databases

### PHP Extensions Required
- BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- cURL, GD, ZIP, Fileinfo
- MySQL/PostgreSQL drivers

## 🔧 Step-by-Step cPanel Deployment

### Step 1: Prepare Your Local Files

Before uploading, prepare your application locally:

```bash
# 1. Build production assets
npm run build

# 2. Remove development files
rm -rf node_modules
rm -rf .git
rm -rf tests
rm package-lock.json
rm composer.lock

# 3. Create .env file
cp .env.example .env
```

### Step 2: Create Database in cPanel

1. **Login to cPanel**
2. **Go to "MySQL Databases"**
3. **Create Database:**
   - Database name: `yourusername_koabiga`
   - Note down the full database name
4. **Create Database User:**
   - Username: `yourusername_koabiga_user`
   - Strong password (save it!)
5. **Add User to Database:**
   - Select your database and user
   - Grant "ALL PRIVILEGES"
6. **Note down credentials:**
   - Database name: `yourusername_koabiga`
   - Username: `yourusername_koabiga_user`
   - Password: `your_secure_password`
   - Host: `localhost` (usually)

### Step 3: Upload Files via File Manager

1. **Open cPanel File Manager**
2. **Navigate to `public_html/`**
3. **Create a folder** (optional): `koabiga`
4. **Upload all files** to your chosen directory
5. **Extract ZIP** if you uploaded as archive
6. **Ensure all files are uploaded** (including hidden files)

### Step 4: Configure Environment File

1. **In File Manager, find `.env`**
2. **Edit the file** with your cPanel settings:

```env
APP_NAME=Koabiga
APP_ENV=production
APP_KEY=base64:your_generated_key_here
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Database Configuration (MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=yourusername_koabiga
DB_USERNAME=yourusername_koabiga_user
DB_PASSWORD=your_secure_password
DB_PORT=3306

# OR PostgreSQL (if available)
# DB_CONNECTION=pgsql
# DB_HOST=localhost
# DB_DATABASE=yourusername_koabiga
# DB_USERNAME=yourusername_koabiga_user
# DB_PASSWORD=your_secure_password
# DB_PORT=5432

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

### Step 5: Set File Permissions

In File Manager, set permissions:

1. **Right-click on folders/files → Change Permissions**
2. **Set permissions:**
   - `storage/` → **755** (recursive)
   - `bootstrap/cache/` → **755** (recursive)
   - `.env` → **644**
   - `public/` → **755**
   - All other files → **644**

### Step 6: Run Laravel Commands via cPanel Terminal

If your cPanel has **Terminal** access:

```bash
# Navigate to your application directory
cd public_html/koabiga

# Install Composer dependencies
composer install --no-dev --optimize-autoloader

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Create storage link
php artisan storage:link
```

### Step 7: Alternative - Use cPanel Cron Jobs

If no Terminal access, use **Cron Jobs** in cPanel:

1. **Go to "Cron Jobs" in cPanel**
2. **Add new cron job:**

```bash
# Command to run
cd /home/yourusername/public_html/koabiga && php artisan migrate --force

# Schedule: Once (Common Settings → Once)
```

3. **Add another cron job for seeding:**

```bash
# Command to run
cd /home/yourusername/public_html/koabiga && php artisan db:seed --force

# Schedule: Once
```

4. **Add optimization cron job:**

```bash
# Command to run
cd /home/yourusername/public_html/koabiga && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize

# Schedule: Once
```

### Step 8: Configure Apache (.htaccess)

Create/update `.htaccess` in your `public/` directory:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### Step 9: Point Domain to Application

1. **Go to "Domains" in cPanel**
2. **Add your domain** or use subdomain
3. **Point to your application directory** (e.g., `public_html/koabiga/public`)
4. **Enable SSL** (Let's Encrypt)

### Step 10: Test Your Application

1. **Visit your domain**
2. **Check for errors** in browser console
3. **Test key functionality:**
   - User registration/login
   - Form submissions
   - File uploads
   - Database operations

## 🔧 Troubleshooting cPanel Issues

### Common Problems & Solutions

#### 1. **500 Internal Server Error**
- Check file permissions (755 for folders, 644 for files)
- Verify `.env` file exists and is configured
- Check error logs in cPanel → "Error Logs"

#### 2. **Database Connection Failed**
- Verify database credentials in `.env`
- Check if database exists in cPanel → "MySQL Databases"
- Ensure user has proper permissions

#### 3. **Assets Not Loading**
- Verify `public/build/` directory exists
- Check if `storage` link is created
- Ensure proper file permissions

#### 4. **Composer Dependencies Missing**
- Upload `vendor/` folder if not present
- Or use cPanel Terminal to run `composer install`

#### 5. **Migration Errors**
- Check database connection
- Verify database user permissions
- Run migrations via Cron Jobs or Terminal

### cPanel-Specific Commands

If you have Terminal access:

```bash
# Check PHP version
php -v

# Check available extensions
php -m

# Check current directory
pwd

# List files
ls -la

# Check Laravel status
php artisan about

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📊 Post-Deployment Checklist

- [ ] **Domain configured** and pointing to correct directory
- [ ] **SSL certificate** installed and working
- [ ] **Database created** and connected
- [ ] **Environment file** configured correctly
- [ ] **File permissions** set properly
- [ ] **Laravel commands** executed successfully
- [ ] **Application accessible** via domain
- [ ] **All functionality** working correctly
- [ ] **Error logs** checked and clean
- [ ] **Backup strategy** implemented

## 🔒 Security for cPanel

1. **Protect sensitive files:**
   - `.env` → 644 permissions
   - `storage/` → 755 permissions
   - `bootstrap/cache/` → 755 permissions

2. **Enable SSL:**
   - Use Let's Encrypt (free in cPanel)
   - Force HTTPS redirect

3. **Regular backups:**
   - Use cPanel → "Backup Wizard"
   - Backup both files and database

4. **Monitor logs:**
   - Check "Error Logs" regularly
   - Monitor "Raw Access Logs"

## 🚀 Performance Tips for cPanel

1. **Enable caching:**
   - Laravel caches (config, routes, views)
   - Browser caching via `.htaccess`

2. **Optimize images:**
   - Compress images before upload
   - Use appropriate formats (WebP, JPEG, PNG)

3. **Minimize HTTP requests:**
   - Combine CSS/JS files
   - Use CDN for external resources

4. **Database optimization:**
   - Regular database maintenance
   - Optimize queries

## 📞 cPanel Support

If you encounter issues:

1. **Check cPanel documentation**
2. **Contact your hosting provider**
3. **Check error logs** in cPanel
4. **Verify PHP version** and extensions
5. **Test with a simple PHP file**

---

**🎉 Your Koabiga application is now deployed on cPanel!**

The application should be accessible at `https://yourdomain.com` and ready for production use. 