import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
  allowSelfAccess?: boolean; // New prop to allow self-access for employees
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  resource,
  action,
  fallback,
  allowSelfAccess = false
}) => {
  const { user, hasAnyPermission, canAccessResource } = useAuth();

  if (!user) {
    return null; // This should be handled by the main App component
  }

  // Check resource-based access
  if (resource && action) {
    if (!canAccessResource(resource, action)) {
      return fallback || <AccessDenied />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    // If allowSelfAccess is true and user has basic profile access, allow it
    if (allowSelfAccess && hasAnyPermission([Permission.VIEW_OWN_PROFILE])) {
      return <>{children}</>;
    }
    
    if (!hasAnyPermission(requiredPermissions)) {
      return fallback || <AccessDenied />;
    }
  }

  return <>{children}</>;
};

const AccessDenied: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">You don't have permission to access this resource.</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-md mx-auto">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800 text-sm">
            Contact your administrator if you believe this is an error.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default ProtectedRoute;