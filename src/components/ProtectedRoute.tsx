import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'manager' | 'user';
  allowedRoles?: ('admin' | 'manager' | 'user')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requiredRole,
  allowedRoles
}) => {
  const { user, profile, loading } = useAuth();
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
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
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
    if (requiredRole && profile.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">Required role: {requiredRole}</p>
          </div>
        </div>
      );
    }

    // If allowed roles are specified
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">Allowed roles: {allowedRoles.join(', ')}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
