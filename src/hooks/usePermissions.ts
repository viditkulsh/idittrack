import { useAuth } from '../contexts/AuthContext'

export const usePermissions = () => {
  const { permissions, hasPermission, hasRole, isAdmin, isManager, isSuperAdmin } = useAuth()
  
  return {
    // Raw permission checking
    hasPermission,
    hasRole,
    permissions,
    
    // Role checks
    isAdmin,
    isManager,
    isSuperAdmin,
    isManagerOrAdmin: isManager() || isAdmin(),
    
    // Inventory permissions
    canCreateInventory: hasPermission('inventory', 'create'),
    canReadInventory: hasPermission('inventory', 'read'),
    canUpdateInventory: hasPermission('inventory', 'update'),
    canDeleteInventory: hasPermission('inventory', 'delete'),
    canManageInventory: hasPermission('inventory', 'manage'),
    
    // Order permissions
    canCreateOrders: hasPermission('orders', 'create'),
    canReadOrders: hasPermission('orders', 'read'),
    canUpdateOrders: hasPermission('orders', 'update'),
    canDeleteOrders: hasPermission('orders', 'delete'),
    canManageOrders: hasPermission('orders', 'manage'),
    canApproveOrders: hasPermission('orders', 'approve'),
    canAssignOrders: hasPermission('orders', 'assign'),
    
    // User management permissions
    canCreateUsers: hasPermission('users', 'create'),
    canReadUsers: hasPermission('users', 'read'),
    canUpdateUsers: hasPermission('users', 'update'),
    canDeleteUsers: hasPermission('users', 'delete'),
    canManageUsers: hasPermission('users', 'manage'),
    
    // Product permissions
    canCreateProducts: hasPermission('products', 'create'),
    canReadProducts: hasPermission('products', 'read'),
    canUpdateProducts: hasPermission('products', 'update'),
    canDeleteProducts: hasPermission('products', 'delete'),
    canManageProducts: hasPermission('products', 'manage'),
    
    // Analytics permissions
    canViewAnalytics: hasPermission('analytics', 'read'),
    canExportAnalytics: hasPermission('analytics', 'export'),
    
    // System permissions
    canManageSystem: hasPermission('system', 'manage'),
    canViewAuditLogs: hasPermission('audit_logs', 'read'),
    
    // Categories permissions
    canCreateCategories: hasPermission('categories', 'create'),
    canReadCategories: hasPermission('categories', 'read'),
    canUpdateCategories: hasPermission('categories', 'update'),
    canDeleteCategories: hasPermission('categories', 'delete'),
    
    // Location permissions
    canCreateLocations: hasPermission('locations', 'create'),
    canReadLocations: hasPermission('locations', 'read'),
    canUpdateLocations: hasPermission('locations', 'update'),
    canDeleteLocations: hasPermission('locations', 'delete')
  }
}

export const useRoleAccess = () => {
  const { profile, currentTenant, hasRole } = useAuth()
  
  return {
    // Role-specific access patterns
    canAccessAdminPanel: hasRole('admin') || hasRole('manager'),
    canAccessUserManagement: hasRole('admin') || hasRole('manager'),
    canAccessSystemSettings: hasRole('admin'),
    canAccessTenantSettings: hasRole('admin') && currentTenant,
    canViewAllOrders: hasRole('admin') || hasRole('manager'),
    canViewAllInventory: hasRole('admin') || hasRole('manager'),
    canViewReports: hasRole('admin') || hasRole('manager'),
    
    // Department-level access
    canManageDepartment: hasRole('manager') && profile?.department,
    canViewDepartmentOnly: hasRole('user') && !hasRole('manager') && !hasRole('admin'),
    
    // Personal access
    canOnlyViewAssigned: hasRole('user') && !hasRole('manager') && !hasRole('admin')
  }
}

export const useTenantAccess = () => {
  const { currentTenant, availableTenants, switchTenant, isSuperAdmin } = useAuth()
  
  return {
    currentTenant,
    availableTenants,
    switchTenant,
    canSwitchTenants: isSuperAdmin() || availableTenants.length > 1,
    isMultiTenant: availableTenants.length > 1,
    hasMultipleAccess: isSuperAdmin()
  }
}
