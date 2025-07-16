# PostgreSQL Setup for Koabiga on cPanel

## 🗄️ **PostgreSQL Configuration**

### **1. Environment Variables (.env)**

Update your `.env` file with PostgreSQL settings:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# PostgreSQL Configuration
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Cache and Session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# File Storage
FILESYSTEM_DISK=local
```

### **2. Test PostgreSQL Connection**

```bash
# Test direct PostgreSQL connection
psql -h localhost -U your_database_user -d your_database_name

# Or test via Laravel
php artisan tinker --execute="echo DB::connection()->getPdo() ? 'PostgreSQL Connected' : 'Connection Failed';"
```

### **3. Database Setup Commands**

```bash
# Run migrations
php artisan migrate --force

# Seed the database (if needed)
php artisan db:seed --force

# Check migration status
php artisan migrate:status
```

### **4. PostgreSQL-specific Optimizations**

```bash
# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Rebuild caches for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **5. Database Backup (PostgreSQL)**

```bash
# Create backup
pg_dump -h localhost -U your_database_user -d your_database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U your_database_user -d your_database_name < backup_file.sql
```

### **6. PostgreSQL Performance Tuning**

Add these to your `.env` file for better performance:

```env
# PostgreSQL Performance Settings
DB_OPTIONS="--client_encoding=UTF8"
```

### **7. Common PostgreSQL Commands**

```bash
# Connect to database
psql -h localhost -U your_database_user -d your_database_name

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Exit PostgreSQL
\q
```

### **8. Troubleshooting PostgreSQL**

#### **Connection Issues:**
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

#### **Permission Issues:**
```bash
# Check user permissions
psql -h localhost -U your_database_user -d your_database_name -c "\du"
```

#### **Database Size:**
```bash
# Check database size
psql -h localhost -U your_database_user -d your_database_name -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

## 🚀 **Quick Deployment with PostgreSQL**

```bash
# 1. Update .env with PostgreSQL settings
# 2. Run deployment script
./deploy-cpanel.sh

# 3. Verify database connection
php artisan tinker --execute="echo 'Tables: ' . count(DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\''));"
```

## 📋 **PostgreSQL vs MySQL Differences**

| Feature | PostgreSQL | MySQL |
|---------|------------|-------|
| Connection | `pgsql` | `mysql` |
| Port | `5432` | `3306` |
| Backup | `pg_dump` | `mysqldump` |
| Restore | `psql` | `mysql` |
| Case Sensitivity | Case-sensitive | Case-insensitive |
| JSON Support | Native | Limited |

## ✅ **Verification Checklist**

- [ ] PostgreSQL connection working
- [ ] Database migrations completed
- [ ] All tables created successfully
- [ ] Application key generated
- [ ] Frontend assets built
- [ ] File permissions set correctly
- [ ] Storage link created
- [ ] Application accessible via web 