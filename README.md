# Koabiga Agriculture Platform

A comprehensive web application for managing agricultural operations with role-based access control and modern UI/UX.

## 🚀 Features

### Authentication & Authorization
- **Multi-role System**: Admin, Unit Leader, and Member roles
- **Secure Login/Registration**: Role-based authentication
- **Session Management**: Persistent user sessions
- **Role-based Access Control**: Different dashboards and permissions per role

### Admin Features
- **Dashboard**: Overview of platform statistics and activities
- **Members Management**: Manage all platform users
- **Reports Management**: Review and approve submitted reports
- **System Settings**: Configure platform settings
- **Forms Management**: Create and manage system forms

### Unit Leader Features
- **Dashboard**: Unit-specific overview and statistics
- **Members Management**: Manage unit members
- **Land Management**: Track unit land allocation
- **Crop Management**: Monitor crop progress
- **Produce Tracking**: Track harvest and production
- **Reports**: Submit and view unit reports

### Member Features
- **Dashboard**: Personal activity overview
- **My Land**: Manage assigned land plots
- **My Crops**: Track crop progress and health
- **My Produce**: Monitor personal production
- **My Reports**: Submit activity reports
- **My Forms**: Access and submit forms

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React
- **Backend**: Laravel 11 + Inertia.js
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **Build Tool**: Vite

## 📁 Project Structure

```
koabiga_skc/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/          # Authentication controllers
│   │   │   └── Settings/      # Settings controllers
│   │   ├── Middleware/        # Custom middleware
│   │   └── Requests/          # Form requests
│   ├── Models/                # Eloquent models
│   └── Providers/             # Service providers
├── resources/
│   └── js/
│       ├── components/        # Reusable UI components
│       │   └── ui/           # Base UI components
│       ├── contexts/         # React contexts
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layouts
│       ├── pages/            # Application pages
│       │   ├── auth/         # Authentication pages
│       │   ├── koabiga/      # Koabiga-specific pages
│       │   │   ├── admin/    # Admin pages
│       │   │   ├── unit-leader/ # Unit Leader pages
│       │   │   └── member/   # Member pages
│       │   └── settings/     # Settings pages
│       └── types/            # TypeScript type definitions
├── routes/                   # Laravel routes
├── database/                 # Database migrations and seeders
└── tests/                    # Application tests
```

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- MySQL/PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koabiga_skc
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build assets**
   ```bash
   npm run build
   ```

7. **Start development server**
   ```bash
   php artisan serve
   npm run dev
   ```

## 🔐 Authentication

The platform uses a role-based authentication system:

### Roles
- **Admin**: Full platform access and management
- **Unit Leader**: Unit-specific management and oversight
- **Member**: Individual user with assigned tasks and land

### Login Flow
1. User enters email, password, and selects role
2. System validates credentials and role
3. User is redirected to role-specific dashboard
4. Session is maintained with localStorage

## 📱 Pages Overview

### Authentication Pages
- `/login` - User login with role selection
- `/register` - User registration with role selection
- `/forgot-password` - Password reset
- `/reset-password` - Password reset confirmation

### Admin Pages
- `/koabiga/admin/dashboard` - Admin overview
- `/koabiga/admin/admin-members` - Member management
- `/koabiga/admin/reports` - Report management
- `/koabiga/admin/settings` - System settings
- `/koabiga/admin/forms` - Form management

### Unit Leader Pages
- `/koabiga/unit-leader/dashboard` - Unit overview
- `/koabiga/unit-leader/members` - Unit member management
- `/koabiga/unit-leader/land` - Land management
- `/koabiga/unit-leader/crops` - Crop management
- `/koabiga/unit-leader/produce` - Produce tracking
- `/koabiga/unit-leader/reports` - Report submission

### Member Pages
- `/koabiga/member/dashboard` - Personal overview
- `/koabiga/member/land` - Assigned land management
- `/koabiga/member/crops` - Personal crop tracking
- `/koabiga/member/produce` - Personal produce tracking
- `/koabiga/member/reports` - Report submission
- `/koabiga/member/forms` - Form access

## 🎨 UI Components

The platform uses a custom design system built with:
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Custom Components**: Platform-specific components

### Key Components
- **Cards**: Information display containers
- **Buttons**: Action triggers with variants
- **Forms**: Input fields and validation
- **Tables**: Data display with sorting/filtering
- **Badges**: Status indicators
- **Progress Bars**: Progress visualization
- **Modals**: Overlay dialogs
- **Navigation**: Breadcrumbs and menus

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:ssr    # Build for SSR
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run types        # Type checking
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Conventional Commits**: Git commit message format

## 🧪 Testing

```bash
php artisan test     # Run PHP tests
npm run test         # Run JavaScript tests
```

## 🔒 Security Features

- **Role-based Access Control**: Different permissions per role
- **Form Validation**: Client and server-side validation
- **CSRF Protection**: Laravel CSRF tokens
- **Session Management**: Secure session handling
- **Input Sanitization**: XSS protection

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Koabiga Agriculture Platform** - Streamlining agricultural operations through technology. 