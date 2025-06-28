import { User, UserRole, Permission, RolePermissions } from '../types/auth';

export const rolePermissions: RolePermissions[] = [
  {
    role: UserRole.ADMIN,
    description: 'Full system access and administration',
    permissions: [
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_SKILLS,
      Permission.VIEW_OWN_ASSESSMENTS,
      Permission.VIEW_TEAM_PROFILES,
      Permission.VIEW_DEPARTMENT_PROFILES,
      Permission.CONDUCT_ASSESSMENTS,
      Permission.VIEW_ALL_EMPLOYEES,
      Permission.EDIT_EMPLOYEE_PROFILES,
      Permission.MANAGE_JOB_PROFILES,
      Permission.VIEW_ORGANIZATION_DASHBOARD,
      Permission.MANAGE_USERS,
      Permission.MANAGE_PERMISSIONS,
      Permission.SYSTEM_CONFIGURATION,
      Permission.VIEW_AUDIT_LOGS
    ]
  },
  {
    role: UserRole.HR_MANAGER,
    description: 'Human resources management and oversight',
    permissions: [
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_SKILLS,
      Permission.VIEW_OWN_ASSESSMENTS,
      Permission.VIEW_ALL_EMPLOYEES,
      Permission.EDIT_EMPLOYEE_PROFILES,
      Permission.CONDUCT_ASSESSMENTS,
      Permission.MANAGE_JOB_PROFILES,
      Permission.VIEW_ORGANIZATION_DASHBOARD
    ]
  },
  {
    role: UserRole.DEPARTMENT_MANAGER,
    description: 'Department-level management and oversight',
    permissions: [
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_SKILLS,
      Permission.VIEW_OWN_ASSESSMENTS,
      Permission.VIEW_DEPARTMENT_PROFILES,
      Permission.CONDUCT_ASSESSMENTS,
      Permission.VIEW_ORGANIZATION_DASHBOARD
    ]
  },
  {
    role: UserRole.TEAM_LEAD,
    description: 'Team leadership and skill development',
    permissions: [
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_SKILLS,
      Permission.VIEW_OWN_ASSESSMENTS,
      Permission.VIEW_TEAM_PROFILES,
      Permission.CONDUCT_ASSESSMENTS
    ]
  },
  {
    role: UserRole.ASSESSOR,
    description: 'Skill assessment and evaluation',
    permissions: [
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_SKILLS,
      Permission.VIEW_OWN_ASSESSMENTS,
      Permission.CONDUCT_ASSESSMENTS,
      Permission.VIEW_TEAM_PROFILES
    ]
  },
  {
    role: UserRole.EMPLOYEE,
    description: 'Basic employee access to personal information',
    permissions: [
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_SKILLS,
      Permission.VIEW_OWN_ASSESSMENTS
    ]
  }
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'admin@skillharbor.com',
    name: 'System Administrator',
    role: UserRole.ADMIN,
    department: 'IT',
    permissions: rolePermissions.find(r => r.role === UserRole.ADMIN)?.permissions || [],
    isActive: true,
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'user2',
    email: 'hr.manager@skillharbor.com',
    name: 'HR Manager',
    role: UserRole.HR_MANAGER,
    department: 'Human Resources',
    permissions: rolePermissions.find(r => r.role === UserRole.HR_MANAGER)?.permissions || [],
    isActive: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'user3',
    email: 'john.smith@skillharbor.com',
    name: 'John Smith',
    role: UserRole.TEAM_LEAD,
    department: 'Engineering',
    permissions: rolePermissions.find(r => r.role === UserRole.TEAM_LEAD)?.permissions || [],
    isActive: true,
    createdAt: new Date('2022-03-15')
  },
  {
    id: 'user4',
    email: 'sarah.johnson@skillharbor.com',
    name: 'Sarah Johnson',
    role: UserRole.EMPLOYEE,
    department: 'Design',
    permissions: rolePermissions.find(r => r.role === UserRole.EMPLOYEE)?.permissions || [],
    isActive: true,
    createdAt: new Date('2023-01-10')
  }
];