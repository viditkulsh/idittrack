<div align="center">

# 📦 IditTrack
### *Your Intelligent Inventory & Order Management Solution*

<img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&size=40&pause=1000&color=F97316&center=true&vCenter=true&width=600&height=100&lines=Welcome+to+IditTrack!;Inventory+Made+Simple;Track.+Manage.+Succeed." alt="Typing SVG" />

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://web.dev/progressive-web-apps/)

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

</div>

---

## 🚀 About IditTrack

**IditTrack** is a modern, full-stack inventory and order management system designed for businesses. Built with React, TypeScript, and Supabase, it provides real-time tracking, seamless user experience, and powerful administrative controls.

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="500">
</div>

### 🎯 Perfect For
- 🏪 **Small to Medium Businesses**
- 📦 **E-commerce Stores** 
- 🏭 **Warehouse Management**
- 📊 **Inventory Optimization**
- 🛒 **Order Processing**

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- 🔑 Secure user authentication with Supabase Auth
- 👥 Role-based access control (Admin/Manager/User)
- 🛡️ Row Level Security (RLS)
- 📧 Email verification
- 🔒 Protected routes with PermissionGate

### 📦 **Inventory Management** 
- 📊 Real-time stock tracking
- 🏷️ Product categorization
- 📈 Multi-location inventory support
- 📤 CSV import functionality
- 🔄 Inventory movement tracking

</td>
<td width="50%">

### 🛒 **Order Management**
- 📝 Order creation & tracking
- 📋 Order status management
- 💰 Pricing & billing
- 📊 Order analytics

### 👑 **Admin Features**
- 👥 User management and role assignment
- 📊 Enhanced analytics dashboard
- ⚙️ System configuration
- 📈 Printable analytics reports
- 🔧 Session monitoring

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Tools |
|:--------:|:-------:|:--------:|:-----:|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=white) | ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) | ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | ![Serverless](https://img.shields.io/badge/-Serverless-FD5750?style=flat-square&logo=serverless&logoColor=white) | ![Supabase](https://img.shields.io/badge/-Supabase%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | ![Real-time](https://img.shields.io/badge/-Real--time%20DB-FF4154?style=flat-square&logo=firebase&logoColor=white) | ![RLS](https://img.shields.io/badge/-Row%20Level%20Security-336791?style=flat-square&logo=postgresql&logoColor=white) | ![PWA](https://img.shields.io/badge/-PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white) |
| ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?style=flat-square&logo=react-router&logoColor=white) | ![PostgREST](https://img.shields.io/badge/-PostgREST-FF6B6B?style=flat-square&logo=api&logoColor=white) | ![Storage](https://img.shields.io/badge/-File%20Storage-FF9500?style=flat-square&logo=supabase&logoColor=white) | ![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white) |

</div>

---
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Build Tools**: Vite, ESLint, PostCSS
- **UI/UX**: Responsive design, PWA support

## 🚀 Quick Start Guide

### 📋 Prerequisites

```bash
# Node.js (v18 or higher)
node --version

# npm or yarn
npm --version
```

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212257454-16e3712e-945a-4ca2-b238-408ad0bf87e6.gif" width="100">
</div>

### 🗄️ Database Setup

<details>
<summary>🔽 Click to expand database setup instructions</summary>

1. **Create a Supabase Project**
   ```bash
   # Visit: https://supabase.com/dashboard
   # Create new project
   ```

2. **Run the Database Script**
   ```sql
   -- Open Supabase SQL Editor
   -- Copy & paste entire contents of database/complete_database.sql
   -- Execute the script ✨
   ```

3. **Verify Setup**
   ```sql
   -- Check if tables are created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

</details>

### 🎯 Application Setup

```bash
# 1️⃣ Clone the repository
git clone https://github.com/viditkulsh/idittrack.git
cd idittrack

# 2️⃣ Install dependencies
npm install

# 3️⃣ Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4️⃣ Start development server
npm run dev
```

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212257467-871d32b7-e401-42e8-a166-fcfd7baa4c6b.gif" width="100">
</div>

### 🌍 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📱 Application Structure

```
📦 IditTrack/
├── 🗄️ database/                    # SQL database scripts
│   ├── complete_database.sql        # Main database setup
│   ├── enhanced_rbac_system.sql     # Role-based access control
│   ├── inventory_movement_types.sql # Inventory tracking
│   ├── quick_permission_fix.sql     # Permission fixes
│   ├── safe_permission_assignment.sql
│   └── setup_existing_users.sql    # User setup
├── 📱 src/
│   ├── 🧩 components/               # Reusable UI components
│   │   ├── CSVImportResults.tsx     # CSV import results
│   │   ├── Navbar.tsx              # Navigation component
│   │   ├── PermissionGate.tsx      # Permission control
│   │   ├── PrintableAnalyticsReport.tsx # Report printing
│   │   ├── ProtectedRoute.tsx      # Route protection
│   │   └── SessionMonitor.tsx      # Session management
│   ├── 🎭 contexts/                # React contexts
│   │   └── AuthContext.tsx         # Authentication context
│   ├── 🪝 hooks/                   # Custom React hooks
│   │   ├── useCSVImport.ts         # CSV import functionality
│   │   ├── useDashboardAnalytics.ts # Dashboard analytics
│   │   ├── useDatabase.ts          # Database operations
│   │   ├── useInventoryManagement.ts # Inventory operations
│   │   ├── useOrders.ts            # Order management
│   │   ├── usePermissions.ts       # Permission handling
│   │   ├── useProducts.ts          # Product operations
│   │   └── useUploads.ts           # File upload handling
│   ├── 🔧 lib/                     # Utility libraries
│   │   └── supabase.ts             # Supabase client
│   ├── 📄 pages/                   # Application pages
│   │   ├── AdminPanel.tsx          # Admin controls
│   │   ├── CategoryManagement.tsx  # Category management
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── EditProfile.tsx         # Profile editing
│   │   ├── EmailConfirmation.tsx   # Email verification
│   │   ├── EnhancedDashboard.tsx   # Enhanced analytics
│   │   ├── Home.tsx                # Landing page
│   │   ├── InventoryManagement.tsx # Inventory management
│   │   ├── LocationManagement.tsx  # Location management
│   │   ├── Login.tsx               # Authentication
│   │   ├── Orders.tsx              # Order management
│   │   ├── Products.tsx            # Product management
│   │   ├── Profile.tsx             # User profile
│   │   ├── Register.tsx            # User registration
│   │   └── Upload.tsx              # File uploads
│   ├── 🎨 styles/                  # CSS styles
│   │   └── print.css               # Print-specific styles
│   ├── 🔧 utils/                   # Utility functions
│   │   └── csvProcessor.ts         # CSV processing
│   └── ⚙️ Configuration files      # App config
├── 🎨 public/                      # Static assets
│   ├── logo.jpg                    # App logo
│   ├── manifest.webmanifest        # PWA manifest
│   └── pwa-*.svg                   # PWA icons
├── 📋 test/                        # Test files
│   └── csv files/                  # Sample CSV files
└── ⚙️ Config files                 # Vite, TypeScript, etc.
```

---

## 🎮 Usage Examples

### 🔐 Authentication Flow
```typescript
// Login example using the auth context
const { login } = useAuth();
await login(email, password);
```

### 📦 Product Management
```typescript
// Add new product using the products hook
const { addProduct } = useProducts();
await addProduct({
  sku: 'PROD-001',
  name: 'Sample Product',
  price: 99.99,
  category_id: 1
});
```

### 🛒 Order Processing
```typescript
// Create new order using the orders hook
const { createOrder } = useOrders();
await createOrder({
  items: productItems,
  customer_info: customerData,
  status: 'pending'
});
```

### 📊 Dashboard Analytics
```typescript
// Get analytics data for dashboard
const { analytics, loading } = useDashboardAnalytics();
// Displays real-time business metrics
```

---

## 🎯 Current Features Status

### ✅ **Implemented & Working**

- [x] 🔐 **Authentication System** - Complete with Supabase Auth
- [x] 📦 **Inventory Management** - Full CRUD operations
- [x] 🛒 **Order Processing** - Order creation and tracking
- [x] 👑 **Admin Panel** - User and role management
- [x] 📱 **PWA Support** - Installable web app
- [x] 🛡️ **Security Features** - RLS and permission gates
- [x] 📊 **Enhanced Dashboard** - Analytics and reporting
- [x] 📤 **CSV Import** - Bulk data import functionality
- [x] 🖨️ **Print Reports** - Printable analytics reports
- [x] 📍 **Location Management** - Multi-location support
- [x] 🏷️ **Category Management** - Product categorization

---

## 🤝 Contributing

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="100">
</div>

We welcome contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **💫 Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **🚀 Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **🎯 Open a Pull Request**

### 🐛 Bug Reports & 💡 Feature Requests
- Create an [Issue](https://github.com/viditkulsh/idittrack/issues)
- Use our templates for better communication

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

<div align="center">

---

### 🌟 Show Some Love!

<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="200">

**If IditTrack helped your business, give it a ⭐ star!**

Made with ❤️ by [Vidit Kulsh](https://github.com/viditkulsh)

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="300">

---

[![GitHub followers](https://img.shields.io/github/followers/viditkulsh?style=social)](https://github.com/viditkulsh)
[![GitHub stars](https://img.shields.io/github/stars/viditkulsh/idittrack?style=social)](https://github.com/viditkulsh/idittrack/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/viditkulsh/idittrack?style=social)](https://github.com/viditkulsh/idittrack/network/members)

</div>
