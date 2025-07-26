import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccessDenied } from './PermissionGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'manager' | 'user';
  allowedRoles?: ('admin' | 'manager' | 'user')[];
  requiredPermission?: { resource: string; action: string };
  requiredPermissions?: { resource: string; action: string }[];
  requireAll?: boolean; // For multiple permissions, require all or any
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requiredRole,
  allowedRoles,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback
}) => {
  const { user, profile, loading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // For public routes (login/register), don't wait for loading if user is already null
  if (!requireAuth) {
    // If we already know there's a user, redirect immediately
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    // If loading but no user detected yet, show the page immediately for better UX
    // The AuthContext will handle redirects if a user is found
    return <>{children}</>;
  }

  // For protected routes, show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if user is authenticated
  if (requireAuth && user && profile) {
    // If specific role is required
    if (requiredRole && !hasRole(requiredRole)) {
      return fallback || <AccessDenied message={`This page requires ${requiredRole} role.`} />;
    }

    // If allowed roles are specified
    if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
      return fallback || <AccessDenied message={`This page requires one of: ${allowedRoles.join(', ')} roles.`} />;
    }

    // Check single permission
    if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
      return fallback || <AccessDenied message="You don't have the required permissions to access this page." />;
    }

    // Check multiple permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermissions = requireAll
        ? requiredPermissions.every(perm => hasPermission(perm.resource, perm.action))
        : requiredPermissions.some(perm => hasPermission(perm.resource, perm.action));

      if (!hasRequiredPermissions) {
        const permissionText = requireAll ? 'all of the following' : 'at least one of the following';
        const permsList = requiredPermissions.map(p => `${p.action} ${p.resource}`).join(', ');
        return fallback || <AccessDenied message={`You need ${permissionText} permissions: ${permsList}`} />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
