import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'

interface PermissionGateProps {
  resource: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAll?: boolean // If true, requires all permissions in arrays
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission, profile, user } = useAuth()
  
  // Debug logging (remove this after testing)
  console.log('PermissionGate Debug:', {
    resource,
    action,
    userRole: profile?.role,
    hasPermission: hasPermission(resource, action),
    profileExists: !!profile,
    userExists: !!user
  })

  // Always allow admin and manager users for basic operations
  const isAdmin = profile?.role === 'admin'
  const isManager = profile?.role === 'manager'
  const isBasicOperation = ['create', 'read', 'update', 'delete'].includes(action)
  
  // First check: explicit permission
  if (hasPermission(resource, action)) {
    return <>{children}</>
  }
  
  // Second check: admin gets everything
  if (isAdmin) {
    return <>{children}</>
  }

  // Third check: manager gets basic CRUD operations
  if (isManager && isBasicOperation) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

interface RoleGateProps {
  roles: ('admin' | 'manager' | 'user')[]
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAll?: boolean // If true, requires all roles
}

export const RoleGate: React.FC<RoleGateProps> = ({
  roles,
  children,
  fallback = null,
  requireAll = false
}) => {
  const { hasRole } = useAuth()
  
  const hasAccess = requireAll 
    ? roles.every(role => hasRole(role))
    : roles.some(role => hasRole(role))
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { isAdmin } = usePermissions()
  
  if (!isAdmin()) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface ManagerOrAdminProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ManagerOrAdmin: React.FC<ManagerOrAdminProps> = ({ children, fallback = null }) => {
  const { isManagerOrAdmin } = usePermissions()
  
  if (!isManagerOrAdmin) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface SuperAdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const SuperAdminOnly: React.FC<SuperAdminOnlyProps> = ({ children, fallback = null }) => {
  const { isSuperAdmin } = usePermissions()
  
  if (!isSuperAdmin()) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Access denied component
export const AccessDenied: React.FC<{ message?: string }> = ({ 
  message = "You don't have permission to access this resource." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 8.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Permission-based loading state
export const PermissionLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }
  
  return <>{children}</>
}
