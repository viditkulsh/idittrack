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

## 🚀 What is IditTrack?

**IditTrack** is a cutting-edge, full-stack inventory and order management system designed for modern businesses. Built with the latest web technologies, it provides real-time tracking, seamless user experience, and powerful administrative controls.

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

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- 🔑 Secure user authentication
- 👥 Role-based access control (Admin/Manager/User)
- 🛡️ Row Level Security (RLS)
- 📧 Email verification
- 🔒 Protected routes

### 📦 **Inventory Management** 
- 📊 Real-time stock tracking
- 🏷️ Product categorization
- 📈 Stock level monitoring
- ⚠️ Low stock alerts
- 🔄 Multi-location support

</td>
<td width="50%">

### 🛒 **Order Management**
- 📝 Order creation & tracking
- 📋 Order status management
- 💰 Pricing & billing
- 📦 Shipping management
- 📊 Order analytics

### 👑 **Admin Features**
- 👥 User management
- 📊 Analytics dashboard
- ⚙️ System configuration
- 🔧 Database management
- 📈 Performance monitoring

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Tools |
|:--------:|:-------:|:--------:|:-----:|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=white) | ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) | ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | ![Supabase](https://img.shields.io/badge/-Supabase%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | ![API](https://img.shields.io/badge/-REST%20API-FF6B6B?style=flat-square&logo=api&logoColor=white) | ![RLS](https://img.shields.io/badge/-Row%20Level%20Security-336791?style=flat-square&logo=postgresql&logoColor=white) | ![PWA](https://img.shields.io/badge/-PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white) |
| ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?style=flat-square&logo=react-router&logoColor=white) | ![Serverless](https://img.shields.io/badge/-Serverless-FD5750?style=flat-square&logo=serverless&logoColor=white) | ![Real-time](https://img.shields.io/badge/-Real--time%20DB-FF4154?style=flat-square&logo=firebase&logoColor=white) | ![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white) |

</div>

---

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
   -- Copy & paste entire contents of database-complete.sql
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
├── 🗄️ database-complete.sql          # Single comprehensive DB setup
├── 📱 src/
│   ├── 🧩 components/               # Reusable UI components
│   │   ├── Navbar.tsx              # Navigation component
│   │   └── ProtectedRoute.tsx      # Route protection
│   ├── 🎭 contexts/                # React contexts
│   │   └── AuthContext.tsx         # Authentication context
│   ├── 🪝 hooks/                   # Custom React hooks
│   │   ├── useDatabase.ts          # Database operations
│   │   ├── useOrders.ts           # Order management
│   │   └── useProducts.ts         # Product operations
│   ├── 🔧 lib/                     # Utility libraries
│   │   └── supabase.ts            # Supabase client
│   └── 📄 pages/                   # Application pages
│       ├── 🏠 Home.tsx             # Landing page
│       ├── 📊 Dashboard.tsx        # Main dashboard
│       ├── 📦 Products.tsx         # Product management
│       ├── 🛒 Orders.tsx           # Order management
│       ├── 👑 AdminPanel.tsx       # Admin controls
│       ├── 👤 Profile.tsx          # User profile
│       ├── ✏️ EditProfile.tsx      # Profile editing
│       ├── 📤 Upload.tsx           # File uploads
│       ├── 🔐 Login.tsx            # Authentication
│       ├── 📝 Register.tsx         # User registration
│       └── ✉️ EmailConfirmation.tsx # Email verification
├── 🎨 public/                      # Static assets
└── ⚙️ Configuration files          # Vite, TypeScript, etc.
```

---

## 🎮 Usage Examples

### 🔐 Authentication Flow
```typescript
// Login example
const { login } = useAuth();
await login(email, password);
```

### 📦 Product Management
```typescript
// Add new product
const { addProduct } = useProducts();
await addProduct({
  sku: 'PROD-001',
  name: 'Sample Product',
  price: 99.99
});
```

### 🛒 Order Processing
```typescript
// Create new order
const { createOrder } = useOrders();
await createOrder({
  items: productItems,
  shipping: shippingInfo
});
```

---

## 🎯 Roadmap

<div align="center">

```mermaid
gantt
    title IditTrack Development Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    Core Features    :done, phase1, 2024-01-01, 2024-03-31
    Authentication   :done, auth, 2024-01-01, 2024-02-15
    section Phase 2
    Advanced Analytics :active, phase2, 2024-04-01, 2024-06-30
    Mobile App        :phase3, 2024-07-01, 2024-09-30
    section Phase 3
    AI Integration    :phase4, 2024-10-01, 2024-12-31
    API Marketplace   :phase5, 2025-01-01, 2025-03-31
```

</div>

### 🎯 Current Status: ✅ **Production Ready**

- [x] 🔐 **Authentication System**
- [x] 📦 **Inventory Management** 
- [x] 🛒 **Order Processing**
- [x] 👑 **Admin Panel**
- [x] 📱 **PWA Support**
- [x] 🛡️ **Security Features**

### 🚀 Coming Soon

- [ ] 📊 **Advanced Analytics Dashboard**
- [ ] 📱 **Mobile Application**
- [ ] 🤖 **AI-Powered Insights**
- [ ] 🔗 **Third-party Integrations**
- [ ] 📧 **Email Notifications**
- [ ] 📈 **Reporting System**

---

## 🤝 Contributing

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="100">
</div>

We love contributions! Here's how you can help:

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
