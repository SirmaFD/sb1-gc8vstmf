import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole, Permission } from '../types/auth';
import { mockUsers } from '../data/authData';

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
    const savedUser = localStorage.getItem('skillharbor_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        
        // Convert date strings back to Date objects
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
        localStorage.removeItem('skillharbor_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.email === email);
      
      if (user && user.isActive) {
        const updatedUser = { ...user, lastLogin: new Date() };
        localStorage.setItem('skillharbor_user', JSON.stringify(updatedUser));
        
        setAuthState({
          user: updatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid credentials or inactive account'
        }));
        return false;
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please try again.'
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('skillharbor_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const hasPermission = (permission: Permission): boolean => {
    return authState.user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const canAccessResource = (resource: string, action: string, context?: any): boolean => {
    if (!authState.user) return false;

    // Define access control rules - employees can access their own data
    const rules: Record<string, Permission[]> = {
      'dashboard': [
        Permission.VIEW_OWN_PROFILE // All authenticated users can access dashboard
      ],
      'organization': [
        Permission.VIEW_ORGANIZATION_DASHBOARD,
        Permission.VIEW_ALL_EMPLOYEES,
        Permission.VIEW_TEAM_PROFILES,
        Permission.VIEW_DEPARTMENT_PROFILES
      ],
      'employees': [
        Permission.VIEW_ALL_EMPLOYEES, 
        Permission.VIEW_TEAM_PROFILES, 
        Permission.VIEW_DEPARTMENT_PROFILES
      ],
      'assessments': [
        Permission.CONDUCT_ASSESSMENTS, 
        Permission.VIEW_OWN_ASSESSMENTS,
        Permission.VIEW_OWN_PROFILE // Allow self-assessment and viewing own assessments
      ],
      'job-profiles': [
        Permission.MANAGE_JOB_PROFILES, 
        Permission.VIEW_ORGANIZATION_DASHBOARD,
        Permission.VIEW_OWN_PROFILE // Allow employees to view job profiles for career planning
      ],
      'skills': [
        Permission.VIEW_OWN_PROFILE, // All authenticated users can access skills
        Permission.EDIT_OWN_SKILLS
      ]
    };

    const requiredPermissions = rules[resource] || [];
    
    // If no specific permissions required, allow access for authenticated users
    if (requiredPermissions.length === 0) {
      return true;
    }
    
    return hasAnyPermission(requiredPermissions);
  };

  const canEditResource = (resource: string, context?: any): boolean => {
    if (!authState.user) return false;

    // Define edit permissions
    const editRules: Record<string, Permission[]> = {
      'skills': [
        Permission.EDIT_OWN_SKILLS, // Employees can edit their own skills
        Permission.EDIT_EMPLOYEE_PROFILES // Managers can edit others
      ],
      'assessments': [
        Permission.CONDUCT_ASSESSMENTS, // Assessors can conduct assessments
        Permission.VIEW_OWN_ASSESSMENTS // Users can self-assess
      ],
      'profile': [
        Permission.VIEW_OWN_PROFILE, // Users can edit their own profile
        Permission.EDIT_EMPLOYEE_PROFILES // Managers can edit others
      ]
    };

    const requiredPermissions = editRules[resource] || [];
    return hasAnyPermission(requiredPermissions);
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