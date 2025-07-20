# ✅ Koabiga Deployment Checklist

## 🚀 Pre-Deployment

- [ ] **Server Requirements Met**
  - [ ] PHP 8.2+ installed
  - [ ] Composer installed
  - [ ] Node.js 18+ installed
  - [ ] PostgreSQL/MySQL installed
  - [ ] Web server (Nginx/Apache) configured

- [ ] **Application Ready**
  - [ ] Code committed and tested
  - [ ] Environment variables configured
  - [ ] Database credentials ready
  - [ ] SSL certificate obtained

## 🔧 Deployment Steps

### VPS/Dedicated Server

1. **Server Setup**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y nginx postgresql php8.4-fpm php8.4-cli php8.4-pgsql
   ```

2. **Database Setup**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE koabiga;
   CREATE USER koabiga_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE koabiga TO koabiga_user;
   ```

3. **Application Deployment**
   ```bash
   cd /var/www/
   sudo git clone your-repo koabiga
   cd koabiga
   sudo chown -R www-data:www-data /var/www/koabiga
   ```

4. **Dependencies & Build**
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci --production=false
   npm run build
   ```

5. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with production settings
   php artisan key:generate
   ```

6. **Database & Optimization**
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan optimize
   php artisan storage:link
   ```

7. **Permissions**
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```

8. **Web Server Configuration**
   - Configure Nginx/Apache
   - Set up SSL certificate
   - Test configuration

### cPanel Shared Hosting

1. **Upload Files**
   - Upload to `public_html/` or subdirectory
   - Include all files (including hidden)

2. **Run Deployment Script**
   ```bash
   chmod +x deploy-cpanel.sh
   ./deploy-cpanel.sh
   ```

3. **Configure Environment**
   - Update `.env` with cPanel database credentials
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`

4. **Set Permissions**
   ```bash
   chmod 755 storage -R
   chmod 755 bootstrap/cache -R
   chmod 644 .env
   ```

## 🔒 Post-Deployment Security

- [ ] **SSL Certificate**
  - [ ] HTTPS enabled
  - [ ] SSL redirect configured
  - [ ] Security headers set

- [ ] **Environment Security**
  - [ ] `APP_DEBUG=false`
  - [ ] `APP_ENV=production`
  - [ ] Strong database passwords
  - [ ] `.env` file protected

- [ ] **File Permissions**
  - [ ] `storage/` writable (755)
  - [ ] `bootstrap/cache/` writable (755)
  - [ ] `.env` readable only (644)
  - [ ] Sensitive files protected

## ⚡ Performance Optimization

- [ ] **Laravel Optimization**
  - [ ] Config cached
  - [ ] Routes cached
  - [ ] Views cached
  - [ ] OPcache enabled

- [ ] **Web Server**
  - [ ] Gzip compression enabled
  - [ ] Static file caching
  - [ ] Security headers configured

- [ ] **Database**
  - [ ] Indexes optimized
  - [ ] Connection pooling (if applicable)
  - [ ] Query optimization

## 🔄 Background Services

- [ ] **Queue Worker** (VPS/Dedicated)
  ```bash
  sudo systemctl enable koabiga-queue
  sudo systemctl start koabiga-queue
  sudo systemctl status koabiga-queue
  ```

- [ ] **Cron Jobs**
  ```bash
  crontab -e
  # Add: * * * * * cd /path/to/koabiga && php artisan schedule:run >> /dev/null 2>&1
  ```

- [ ] **Log Rotation**
  - [ ] Laravel logs configured
  - [ ] Web server logs configured
  - [ ] Database logs configured

## 📊 Monitoring & Maintenance

- [ ] **Backup Strategy**
  - [ ] Database backups automated
  - [ ] File backups configured
  - [ ] Backup testing scheduled

- [ ] **Monitoring**
  - [ ] Server monitoring enabled
  - [ ] Application monitoring set up
  - [ ] Error alerting configured

- [ ] **Updates**
  - [ ] Security updates automated
  - [ ] Laravel updates planned
  - [ ] Dependency updates scheduled

## 🧪 Testing

- [ ] **Functionality Tests**
  - [ ] User registration/login
  - [ ] Form submissions
  - [ ] File uploads
  - [ ] Database operations

- [ ] **Performance Tests**
  - [ ] Page load times
  - [ ] Database query performance
  - [ ] Asset loading speed

- [ ] **Security Tests**
  - [ ] SSL certificate valid
  - [ ] Security headers present
  - [ ] Sensitive files protected

## 📋 Quick Commands

```bash
# Check application status
php artisan about

# Clear all caches
php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear

# Rebuild caches
php artisan config:cache && php artisan route:cache && php artisan view:cache

# Check permissions
ls -la storage/ bootstrap/cache/

# Monitor logs
tail -f storage/logs/laravel.log

# Test database
php artisan tinker --execute="echo 'DB: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');"

# Queue status
php artisan queue:work --once
```

## 🚨 Emergency Contacts

- **Server Issues**: Contact your hosting provider
- **Laravel Issues**: Check Laravel documentation
- **Database Issues**: Check database logs
- **SSL Issues**: Contact certificate provider

---

**✅ Deployment Complete!** Your Koabiga application is now live and ready for users. 