# 🔐 RBAC Frontend Integration Guide

This guide shows you how to integrate the new RBAC system with your React/TypeScript frontend.

## 📋 Quick Implementation Checklist

### 1. **Update AuthContext for RBAC**
```typescript
// src/contexts/AuthContext.tsx
interface Permission {
  resource: string;
  action: string;
  granted: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  hasPermission: (resource: string, action: string) => boolean;
  currentTenant: Tenant | null;
  // ... existing auth methods
}
```

### 2. **Create Permission Hooks**
```typescript
// src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { permissions, hasPermission } = useAuth();
  
  return {
    canCreateInventory: hasPermission('inventory', 'create'),
    canViewOrders: hasPermission('orders', 'read'),
    canManageUsers: hasPermission('users', 'manage'),
    canViewAnalytics: hasPermission('analytics', 'read'),
    // Add more specific permissions as needed
  };
};
```

### 3. **Protected Route Components**
```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: { resource: string; action: string };
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = <AccessDenied />
}) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && user.role !== requiredRole) {
    return fallback;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return fallback;
  }
  
  return <>{children}</>;
};
```

### 4. **Permission-Based UI Components**
```typescript
// src/components/PermissionGate.tsx
interface PermissionGateProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

## 🎯 Role-Based Dashboard Implementation

### Super Admin Dashboard
```typescript
// src/pages/SuperAdminDashboard.tsx
export const SuperAdminDashboard = () => {
  return (
    <div>
      <h1>Platform Administration</h1>
      
      <PermissionGate resource="system" action="manage">
        <TenantManagement />
      </PermissionGate>
      
      <PermissionGate resource="users" action="manage">
        <GlobalUserManagement />
      </PermissionGate>
      
      <PermissionGate resource="analytics" action="read">
        <PlatformAnalytics />
      </PermissionGate>
    </div>
  );
};
```

### Admin Dashboard
```typescript
// src/pages/AdminDashboard.tsx
export const AdminDashboard = () => {
  return (
    <div>
      <h1>Organization Management</h1>
      
      <PermissionGate resource="inventory" action="manage">
        <InventoryOverview />
      </PermissionGate>
      
      <PermissionGate resource="orders" action="manage">
        <OrdersOverview />
      </PermissionGate>
      
      <PermissionGate resource="users" action="manage">
        <TeamManagement />
      </PermissionGate>
      
      <PermissionGate resource="analytics" action="read">
        <OrganizationAnalytics />
      </PermissionGate>
    </div>
  );
};
```

### Manager Dashboard
```typescript
// src/pages/ManagerDashboard.tsx
export const ManagerDashboard = () => {
  return (
    <div>
      <h1>Department Management</h1>
      
      <PermissionGate resource="inventory" action="update">
        <DepartmentInventory />
      </PermissionGate>
      
      <PermissionGate resource="orders" action="read">
        <DepartmentOrders />
      </PermissionGate>
      
      <PermissionGate resource="users" action="read">
        <TeamView />
      </PermissionGate>
    </div>
  );
};
```

### User Dashboard
```typescript
// src/pages/UserDashboard.tsx
export const UserDashboard = () => {
  return (
    <div>
      <h1>My Tasks</h1>
      
      <PermissionGate resource="inventory" action="read">
        <MyInventoryTasks />
      </PermissionGate>
      
      <PermissionGate resource="orders" action="create">
        <CreateOrderForm />
      </PermissionGate>
      
      <MyAssignedOrders />
    </div>
  );
};
```

## 🔍 Database Query Functions

### 1. **Supabase Client Setup**
```typescript
// src/lib/supabase.ts
// Add these RPC functions to your existing supabase client

export const getUserPermissions = async (userId?: string, tenantId?: string) => {
  const { data, error } = await supabase.rpc('get_user_permissions', {
    p_user_id: userId,
    p_tenant_id: tenantId
  });
  
  if (error) throw error;
  return data;
};

export const checkUserPermission = async (
  userId: string,
  resource: string,
  action: string,
  tenantId?: string
) => {
  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_tenant_id: tenantId
  });
  
  if (error) throw error;
  return data;
};

export const getUserTenants = async (userId?: string) => {
  const { data, error } = await supabase.rpc('get_user_tenants', {
    p_user_id: userId
  });
  
  if (error) throw error;
  return data;
};
```

### 2. **Updated AuthContext Implementation**
```typescript
// src/contexts/AuthContext.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
      loadUserTenants();
    }
  }, [user]);

  const loadUserPermissions = async () => {
    try {
      const userPermissions = await getUserPermissions(user?.id, currentTenant?.id);
      setPermissions(userPermissions || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const loadUserTenants = async () => {
    try {
      const tenants = await getUserTenants(user?.id);
      if (tenants && tenants.length > 0) {
        setCurrentTenant(tenants.find(t => t.is_primary) || tenants[0]);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    return permissions.some(p => 
      p.resource === resource && 
      p.action === action && 
      p.granted === true
    );
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isManager = (): boolean => {
    return user?.role === 'manager' || isAdmin();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        currentTenant,
        hasPermission,
        hasRole,
        isAdmin,
        isManager,
        loading,
        // ... existing auth methods
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

## 🛠️ Action Items for Implementation

### Immediate Tasks:
1. **Run the SQL scripts** in your Supabase database:
   - `enhanced_rbac_system.sql`
   - `setup_existing_users.sql` (update emails first)

2. **Update your existing components**:
   - AuthContext with RBAC support
   - ProtectedRoute component
   - Dashboard components

3. **Create new components**:
   - PermissionGate
   - Role-specific dashboards
   - Permission hooks

### Testing Checklist:
- [ ] Admin can access all features
- [ ] Manager can access department features
- [ ] User has limited access
- [ ] Unauthorized actions are blocked
- [ ] UI elements show/hide based on permissions
- [ ] Database RLS policies work correctly

## 🔧 Example Usage in Your Components

### Products Page
```typescript
// src/pages/Products.tsx
export const ProductsPage = () => {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      <h1>Products</h1>
      
      {hasPermission('products', 'create') && (
        <button onClick={() => setShowCreateForm(true)}>
          Add Product
        </button>
      )}
      
      <ProductsList 
        canEdit={hasPermission('products', 'update')}
        canDelete={hasPermission('products', 'delete')}
      />
    </div>
  );
};
```

### Orders Page
```typescript
// src/pages/Orders.tsx
export const OrdersPage = () => {
  const { hasPermission, user } = useAuth();
  
  return (
    <div>
      <h1>Orders</h1>
      
      <PermissionGate resource="orders" action="create">
        <CreateOrderButton />
      </PermissionGate>
      
      <OrdersList 
        showAllOrders={hasPermission('orders', 'manage')}
        userOrders={user?.id}
      />
    </div>
  );
};
```

This RBAC system provides comprehensive role-based access control while maintaining flexibility for future enhancements. The permission system is granular and can be easily extended for new features.
