import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole, Permission } from '../types/auth';
import { apiService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  canAccessResource: (resource: string, action: string, context?: any) => boolean;
  canEditResource: (resource: string, context?: any) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('skillharbor_user');
      const accessToken = localStorage.getItem('skillharbor_access_token');
      
      if (savedUser && accessToken) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiService.getCurrentUser();
          
          // Convert date strings back to Date objects
          const user = response.user;
          if (user.createdAt) {
            user.createdAt = new Date(user.createdAt);
          }
          if (user.lastLogin) {
            user.lastLogin = new Date(user.lastLogin);
          }
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('skillharbor_user');
          localStorage.removeItem('skillharbor_access_token');
          localStorage.removeItem('skillharbor_refresh_token');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.login(email, password);
      
      // Store user data
      localStorage.setItem('skillharbor_user', JSON.stringify(response.user));
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return authState.user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const canAccessResource = (resource: string, action: string, context?: any): boolean => {
    if (!authState.user) return false;

    // Define access control rules based on user role and permissions
    switch (resource) {
      case 'dashboard':
        // All authenticated users can access their dashboard
        return hasPermission(Permission.VIEW_OWN_PROFILE);
        
      case 'skills':
        // All authenticated users can view/edit their own skills
        return hasPermission(Permission.VIEW_OWN_PROFILE);
        
      case 'assessments':
        // Users can view their own assessments or conduct assessments if they have permission
        return hasPermission(Permission.VIEW_OWN_ASSESSMENTS) || 
               hasPermission(Permission.CONDUCT_ASSESSMENTS);
               
      case 'job-profiles':
        // Employees can view job profiles for career planning, managers can manage them
        return hasPermission(Permission.VIEW_OWN_PROFILE) || 
               hasPermission(Permission.MANAGE_JOB_PROFILES);
               
      case 'learning-paths':
        // All authenticated users can access learning paths
        return hasPermission(Permission.VIEW_OWN_PROFILE);
        
      case 'organization':
        // Only users with organization-level permissions
        return hasPermission(Permission.VIEW_ORGANIZATION_DASHBOARD) ||
               hasPermission(Permission.VIEW_ALL_EMPLOYEES) ||
               hasPermission(Permission.VIEW_TEAM_PROFILES) ||
               hasPermission(Permission.VIEW_DEPARTMENT_PROFILES);
               
      case 'employees':
        // Only users with employee management permissions
        return hasPermission(Permission.VIEW_ALL_EMPLOYEES) ||
               hasPermission(Permission.VIEW_TEAM_PROFILES) ||
               hasPermission(Permission.VIEW_DEPARTMENT_PROFILES);
               
      default:
        return false;
    }
  };

  const canEditResource = (resource: string, context?: any): boolean => {
    if (!authState.user) return false;

    // Define edit permissions
    switch (resource) {
      case 'skills':
        // Users can edit their own skills, managers can edit others
        return hasPermission(Permission.EDIT_OWN_SKILLS) ||
               hasPermission(Permission.EDIT_EMPLOYEE_PROFILES);
               
      case 'assessments':
        // Users can self-assess, assessors can assess others
        return hasPermission(Permission.VIEW_OWN_ASSESSMENTS) ||
               hasPermission(Permission.CONDUCT_ASSESSMENTS);
               
      case 'profile':
        // Users can edit their own profile, managers can edit others
        return hasPermission(Permission.VIEW_OWN_PROFILE) ||
               hasPermission(Permission.EDIT_EMPLOYEE_PROFILES);
               
      default:
        return false;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    canAccessResource,
    canEditResource
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};