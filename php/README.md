# DutyRoster - PHP CodeIgniter Version

## Requirements
- PHP 8.1 or higher
- MySQL 8.0 or higher
- Apache/Nginx web server
- Composer (for dependencies)

## Installation

### 1. Install Dependencies
```bash
cd src/php
composer install
```

### 2. Configure Database
Copy `env` to `.env` and configure your database:
```bash
cp env .env
```

Edit `.env`:
```
database.default.hostname = localhost
database.default.database = dutyroster
database.default.username = root
database.default.password = your_password
database.default.DBDriver = MySQLi
```

### 3. Run Migrations
```bash
php spark migrate
php spark db:seed DatabaseSeeder
```

### 4. Start Development Server
```bash
php spark serve
```

Visit: http://localhost:8080

## Default Login Credentials

- **Admin**: `admin` / `Admin@9999`
- **Supervisor**: `supervisor` / `Admin@9999`
- **Staff**: `staff` / `Admin@9999`

## Project Structure

```
src/php/
├── app/
│   ├── Config/          # Configuration files
│   ├── Controllers/     # Request handlers
│   │   ├── Api/        # API controllers
│   │   └── Web/        # Web page controllers
│   ├── Models/          # Database models
│   ├── Views/           # View templates
│   ├── Filters/         # Middleware (Auth, RBAC)
│   ├── Helpers/         # Helper functions
│   ├── Libraries/       # Business logic services
│   ├── Language/        # Translations (EN/TH)
│   └── Database/
│       ├── Migrations/  # Database migrations
│       └── Seeds/       # Seed data
├── public/              # Web root
│   ├── assets/         # CSS, JS, images
│   └── index.php
└── writable/            # Logs, cache, uploads
```

## Features

- ✅ User Authentication & Authorization (RBAC)
-  ✅ Employee Management
- ✅ Team Management
- ✅ Roster/Shift Scheduling
- ✅ Leave Request Management
- ✅ Holiday Credit Tracking
- ✅ Calendar View (Month/Week/Day)
- ✅ Reports (Daily/Monthly)
- ✅ Bilingual Support (EN/TH)

## API Endpoints

See [API Documentation](docs/API.md) for complete endpoint list.

## License

Proprietary - All rights reserved
