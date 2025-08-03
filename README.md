# IditTrack

Modern inventory and order management system built with React, TypeScript, and Supabase.

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

## About

IditTrack is a web-based inventory and order management application designed for small to medium businesses. It provides real-time inventory tracking, order processing, and user management capabilities.

## Features

- **User Authentication**: Secure login/registration with email verification
- **Role-Based Access**: Admin, Manager, and User roles with different permissions
- **Inventory Management**: Track products, categories, and stock levels
- **Order Processing**: Create and manage orders with status tracking
- **Location Management**: Multi-location inventory support
- **Admin Panel**: User management and system administration
- **Enhanced Dashboard**: Analytics and reporting for business insights
- **CSV Import**: Bulk import products and data
- **Print Reports**: Generate printable analytics reports
- **PWA Support**: Installable web application

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Build Tools**: Vite, ESLint, PostCSS
- **UI/UX**: Responsive design, PWA support

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/viditkulsh/idittrack.git
   cd idittrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   - Create a new project in [Supabase Dashboard](https://supabase.com/dashboard)
   - Go to SQL Editor and run the script from `database/complete_database.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

```
idittrack/
├── database/                    # SQL database scripts
│   ├── complete_database.sql    # Main database setup
│   ├── enhanced_rbac_system.sql # Role-based access control
│   └── ...                     # Additional SQL scripts
├── public/                     # Static assets
│   ├── logo.jpg               # Application logo
│   ├── manifest.webmanifest   # PWA manifest
│   └── ...                    # PWA icons
├── src/
│   ├── components/            # Reusable React components
│   │   ├── CSVImportResults.tsx
│   │   ├── Navbar.tsx
│   │   ├── PermissionGate.tsx
│   │   ├── PrintableAnalyticsReport.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── SessionMonitor.tsx
│   ├── contexts/              # React context providers
│   │   └── AuthContext.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCSVImport.ts
│   │   ├── useDashboardAnalytics.ts
│   │   ├── useDatabase.ts
│   │   ├── useInventoryManagement.ts
│   │   ├── useOrders.ts
│   │   ├── usePermissions.ts
│   │   ├── useProducts.ts
│   │   └── useUploads.ts
│   ├── lib/                   # Utility libraries
│   │   └── supabase.ts        # Supabase client configuration
│   ├── pages/                 # Application pages/routes
│   │   ├── AdminPanel.tsx
│   │   ├── CategoryManagement.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EditProfile.tsx
│   │   ├── EmailConfirmation.tsx
│   │   ├── EnhancedDashboard.tsx
│   │   ├── Home.tsx
│   │   ├── InventoryManagement.tsx
│   │   ├── LocationManagement.tsx
│   │   ├── Login.tsx
│   │   ├── Orders.tsx
│   │   ├── Products.tsx
│   │   ├── Profile.tsx
│   │   ├── Register.tsx
│   │   └── Upload.tsx
│   ├── styles/                # CSS styles
│   │   └── print.css          # Print-specific styles
│   ├── utils/                 # Utility functions
│   │   └── csvProcessor.ts    # CSV processing utilities
│   ├── App.tsx                # Main application component
│   ├── index.css              # Global styles
│   └── main.tsx               # Application entry point
├── test/                      # Test files and data
│   └── csv files/             # Sample CSV files for testing
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features in Detail

### Authentication & Authorization
- Email/password authentication via Supabase Auth
- Role-based access control (Admin, Manager, User)
- Protected routes and permission gates
- Session monitoring and management

### Inventory Management
- Product catalog with SKU, categories, and pricing
- Multi-location inventory tracking
- Stock level monitoring and alerts
- Bulk import via CSV files

### Order Management
- Order creation and status tracking
- Customer information management
- Order analytics and reporting

### Admin Features
- User management and role assignment
- System configuration and settings
- Enhanced dashboard with analytics
- Printable reports generation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Vidit Kulsh** - [@viditkulsh](https://github.com/viditkulsh)

Project Link: [https://github.com/viditkulsh/idittrack](https://github.com/viditkulsh/idittrack)
