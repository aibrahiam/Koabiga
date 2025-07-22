#!/bin/bash

# Koabiga VPS Deployment Script
# This script automates the deployment process for VPS with Nginx

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Koabiga"
DOMAIN=""
DB_PASSWORD=""
ADMIN_EMAIL=""
REPO_URL=""

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

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to get user input
get_user_input() {
    echo ""
    echo "=========================================="
    echo "    Koabiga VPS Deployment Setup"
    echo "=========================================="
    echo ""
    
    read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
    read -s -p "Enter database password: " DB_PASSWORD
    echo ""
    read -p "Enter admin email: " ADMIN_EMAIL
    read -p "Enter Git repository URL: " REPO_URL
    
    echo ""
    echo "Configuration Summary:"
    echo "Domain: $DOMAIN"
    echo "Admin Email: $ADMIN_EMAIL"
    echo "Repository: $REPO_URL"
    echo ""
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    print_success "System updated"
}

# Function to install PHP
install_php() {
    print_status "Installing PHP 8.4 and extensions..."
    
    # Add PHP repository
    sudo add-apt-repository ppa:ondrej/php -y
    sudo apt update
    
    # Install PHP and extensions
    sudo apt install -y php8.4-fpm php8.4-cli php8.4-common php8.4-pgsql php8.4-bcmath php8.4-curl php8.4-gd php8.4-intl php8.4-mbstring php8.4-xml php8.4-zip php8.4-opcache php8.4-redis php8.4-fileinfo php8.4-tokenizer php8.4-ctype php8.4-json php8.4-xmlreader php8.4-xmlwriter php8.4-simplexml php8.4-dom php8.4-phar php8.4-posix php8.4-session php8.4-pdo php8.4-pdo-pgsql
    
    # Configure PHP
    sudo sed -i 's/memory_limit = .*/memory_limit = 512M/' /etc/php/8.4/fpm/php.ini
    sudo sed -i 's/upload_max_filesize = .*/upload_max_filesize = 100M/' /etc/php/8.4/fpm/php.ini
    sudo sed -i 's/post_max_size = .*/post_max_size = 100M/' /etc/php/8.4/fpm/php.ini
    sudo sed -i 's/display_errors = .*/display_errors = Off/' /etc/php/8.4/fpm/php.ini
    
    # Restart PHP-FPM
    sudo systemctl restart php8.4-fpm
    sudo systemctl enable php8.4-fpm
    
    print_success "PHP installed and configured"
}

# Function to install PostgreSQL
install_postgresql() {
    print_status "Installing and configuring PostgreSQL..."
    
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE koabiga;"
    sudo -u postgres psql -c "CREATE USER koabiga_user WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE koabiga TO koabiga_user;"
    sudo -u postgres psql -c "ALTER USER koabiga_user CREATEDB;"
    
    print_success "PostgreSQL installed and configured"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing and configuring Nginx..."
    
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/koabiga > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
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
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    # PHP-FPM Configuration
    location ~ \.php\$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
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
    
    location ~ ^/(\.env|composer\.json|composer\.lock|package\.json|package-lock\.json|artisan|README\.md|\.git) {
        deny all;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json application/xml;
    
    # Logging
    access_log /var/log/nginx/koabiga_access.log;
    error_log /var/log/nginx/koabiga_error.log;
}
EOF
    
    # Enable site
    sudo ln -s /etc/nginx/sites-available/koabiga /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_success "Nginx installed and configured"
}

# Function to install Composer and Node.js
install_dependencies() {
    print_status "Installing Composer and Node.js..."
    
    # Install Composer
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Composer and Node.js installed"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Clone application
    cd /var/www
    sudo git clone "$REPO_URL" koabiga
    cd koabiga
    
    # Set ownership
    sudo chown -R www-data:www-data /var/www/koabiga
    sudo chmod -R 755 /var/www/koabiga
    
    # Install dependencies
    composer install --no-dev --optimize-autoloader
    npm ci --production=false
    
    # Build assets
    npm run build
    rm -rf node_modules
    
    # Configure environment
    cp .env.example .env
    sudo sed -i "s/APP_URL=.*/APP_URL=https:\/\/$DOMAIN/" .env
    sudo sed -i "s/DB_DATABASE=.*/DB_DATABASE=koabiga/" .env
    sudo sed -i "s/DB_USERNAME=.*/DB_USERNAME=koabiga_user/" .env
    sudo sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    sudo sed -i "s/MAIL_FROM_ADDRESS=.*/MAIL_FROM_ADDRESS=\"noreply@$DOMAIN\"/" .env
    
    # Setup Laravel
    php artisan key:generate
    php artisan migrate --force
    php artisan db:seed --force
    php artisan storage:link
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan optimize
    
    # Set permissions
    sudo chown -R www-data:www-data storage bootstrap/cache
    sudo chmod -R 775 storage bootstrap/cache
    
    print_success "Application deployed"
}

# Function to setup SSL
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL"
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL certificate configured"
}

# Function to setup queue worker
setup_queue_worker() {
    print_status "Setting up queue worker..."
    
    # Create service file
    sudo tee /etc/systemd/system/koabiga-queue.service > /dev/null <<EOF
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
EOF
    
    # Enable and start service
    sudo systemctl enable koabiga-queue
    sudo systemctl start koabiga-queue
    
    print_success "Queue worker configured"
}

# Function to setup cron jobs
setup_cron() {
    print_status "Setting up cron jobs..."
    
    # Add Laravel scheduler to crontab
    (crontab -l 2>/dev/null; echo "* * * * * cd /var/www/koabiga && php artisan schedule:run >> /dev/null 2>&1") | crontab -
    
    print_success "Cron jobs configured"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    sudo apt install -y ufw
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Function to show final summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           DEPLOYMENT COMPLETE"
    echo "=========================================="
    echo "Application: $APP_NAME"
    echo "Domain: https://$DOMAIN"
    echo "Admin Email: $ADMIN_EMAIL"
    echo ""
    echo "✅ System updated and secured"
    echo "✅ PHP 8.4 installed and configured"
    echo "✅ PostgreSQL installed and configured"
    echo "✅ Nginx installed and configured"
    echo "✅ SSL certificate installed"
    echo "✅ Application deployed"
    echo "✅ Queue worker running"
    echo "✅ Cron jobs configured"
    echo "✅ Firewall configured"
    echo ""
    echo "🚀 Your Koabiga application is now live!"
    echo ""
    echo "Default admin credentials:"
    echo "Email: admin@koabiga.com"
    echo "Password: password"
    echo ""
    echo "Important URLs:"
    echo "- Application: https://$DOMAIN"
    echo "- Admin Login: https://$DOMAIN/admin/login"
    echo ""
    echo "Next steps:"
    echo "1. Change default admin password"
    echo "2. Configure email settings"
    echo "3. Set up regular backups"
    echo "4. Monitor server resources"
    echo "5. Test all functionality"
    echo ""
    echo "=========================================="
}

# Main deployment function
main() {
    check_root
    get_user_input
    update_system
    install_php
    install_postgresql
    install_nginx
    install_dependencies
    deploy_application
    setup_ssl
    setup_queue_worker
    setup_cron
    setup_firewall
    show_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "This script automates the deployment of Koabiga on a VPS with Nginx."
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "The script will prompt for:"
        echo "- Domain name"
        echo "- Database password"
        echo "- Admin email"
        echo "- Git repository URL"
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