# 🚀 Koabiga cPanel Quick Start Guide

## ⚡ 5-Minute cPanel Deployment

### Step 1: Prepare Files Locally (2 minutes)

```bash
# 1. Build your application
npm run build

# 2. Create a deployment package
zip -r koabiga-cpanel.zip . -x "node_modules/*" ".git/*" "tests/*" "*.log" "storage/logs/*" "storage/framework/cache/*" "storage/framework/sessions/*" "storage/framework/views/*"
```

### Step 2: Create Database in cPanel (1 minute)

1. **Login to cPanel**
2. **Click "MySQL Databases"**
3. **Create Database:**
   - Name: `yourusername_koabiga`
4. **Create User:**
   - Username: `yourusername_koabiga_user`
   - Password: `StrongPassword123!`
5. **Add User to Database:**
   - Select both → Grant "ALL PRIVILEGES"

### Step 3: Upload Files (1 minute)

1. **Open cPanel File Manager**
2. **Go to `public_html/`**
3. **Upload `koabiga-cpanel.zip`**
4. **Extract the ZIP file**
5. **Move contents to desired folder** (e.g., `koabiga/`)

### Step 4: Configure Environment (1 minute)

1. **Find `.env` file in File Manager**
2. **Edit with your settings:**

```env
APP_NAME=Koabiga
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=yourusername_koabiga
DB_USERNAME=yourusername_koabiga_user
DB_PASSWORD=StrongPassword123!

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database
```

### Step 5: Run Deployment Script (1 minute)

1. **Upload `cpanel-deploy.php` to your application root**
2. **Visit:** `https://yourdomain.com/cpanel-deploy.php?run=deploy`
3. **Wait for deployment to complete**
4. **Delete `cpanel-deploy.php` for security**

## 🔧 File Permissions (cPanel File Manager)

Right-click each item → **Change Permissions**:

| Item | Permission |
|------|------------|
| `storage/` | **755** (recursive) |
| `bootstrap/cache/` | **755** (recursive) |
| `.env` | **644** |
| `public/` | **755** |
| All other files | **644** |

## 🌐 Domain Configuration

1. **Go to cPanel → "Domains"**
2. **Add your domain** or use subdomain
3. **Point to:** `public_html/koabiga/public`
4. **Enable SSL** (Let's Encrypt)

## ✅ Post-Deployment Checklist

- [ ] **Application accessible** at your domain
- [ ] **SSL certificate** working (https://)
- [ ] **User registration/login** working
- [ ] **Forms submitting** correctly
- [ ] **File uploads** working
- [ ] **Database operations** successful
- [ ] **No errors** in browser console
- [ ] **Deployment script deleted**

## 🚨 Troubleshooting

### **500 Internal Server Error**
- Check file permissions (755 for folders, 644 for files)
- Verify `.env` file exists and is configured
- Check cPanel → "Error Logs"

### **Database Connection Failed**
- Verify database credentials in `.env`
- Check if database exists in cPanel → "MySQL Databases"
- Ensure user has proper permissions

### **Assets Not Loading**
- Verify `public/build/` directory exists
- Check if `storage` link is created
- Ensure proper file permissions

### **Migration Errors**
- Check database connection
- Verify database user permissions
- Run migrations manually via deployment script

## 📞 Quick Commands (if Terminal available)

```bash
# Check PHP version
php -v

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

## 🔒 Security Checklist

- [ ] **SSL certificate** installed
- [ ] **APP_DEBUG=false** in .env
- [ ] **Strong database password**
- [ ] **File permissions** set correctly
- [ ] **Deployment script deleted**
- [ ] **Error logs** checked
- [ ] **Backup strategy** in place

## 🎯 Your Application URL

After deployment, your Koabiga application will be available at:

**https://yourdomain.com**

---

**🎉 That's it! Your Koabiga application is now live on cPanel!** 