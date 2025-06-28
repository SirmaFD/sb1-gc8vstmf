export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export enum UserRole {
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  DEPARTMENT_MANAGER = 'department_manager',
  TEAM_LEAD = 'team_lead',
  EMPLOYEE = 'employee',
  ASSESSOR = 'assessor'
}

export enum Permission {
  // Employee permissions
  VIEW_OWN_PROFILE = 'view_own_profile',
  EDIT_OWN_SKILLS = 'edit_own_skills',
  VIEW_OWN_ASSESSMENTS = 'view_own_assessments',
  
  // Team/Department permissions
  VIEW_TEAM_PROFILES = 'view_team_profiles',
  VIEW_DEPARTMENT_PROFILES = 'view_department_profiles',
  CONDUCT_ASSESSMENTS = 'conduct_assessments',
  
  // Management permissions
  VIEW_ALL_EMPLOYEES = 'view_all_employees',
  EDIT_EMPLOYEE_PROFILES = 'edit_employee_profiles',
  MANAGE_JOB_PROFILES = 'manage_job_profiles',
  VIEW_ORGANIZATION_DASHBOARD = 'view_organization_dashboard',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_PERMISSIONS = 'manage_permissions',
  SYSTEM_CONFIGURATION = 'system_configuration',
  VIEW_AUDIT_LOGS = 'view_audit_logs'
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export interface AccessControlRule {
  resource: string;
  action: string;
  requiredPermissions: Permission[];
  condition?: (user: User, context?: any) => boolean;
}