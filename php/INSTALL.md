# Installation Guide

## Quick Start

### 1. Install Dependencies
```bash
cd src/php
composer install
```

### 2. Configure Database
```bash
cp env .env
# Edit .env - update database settings
```

### 3. Create Database
```sql
CREATE DATABASE dutyroster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations & Seed
```bash
php spark migrate
php spark db:seed DatabaseSeeder
```

### 5. Start Server
```bash
php spark serve
```

### 6. Login
- URL: http://localhost:8080
- Username: `admin`
- Password: `Admin@9999`

## Production Setup

### Apache
```apache
<VirtualHost *:80>
    DocumentRoot /var/www/duty-roster/src/php/public
    <Directory /var/www/duty-roster/src/php/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx
```nginx
server {
    root /var/www/duty-roster/src/php/public;
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        include fastcgi_params;
    }
}
```

### Permissions
```bash
chmod -R 775 writable/
chown -R www-data:www-data .
```

## Troubleshooting

- **Permission errors**: `chmod -R 775 writable/`
- **Database errors**: Check credentials in `.env`
- **404 errors**: Enable Apache mod_rewrite
- **500 errors**: Check `writable/logs/`
