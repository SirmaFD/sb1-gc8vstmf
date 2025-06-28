const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const db = getDatabase();
    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT u.*, d.name as department_name 
         FROM users u 
         LEFT JOIN departments d ON u.department_id = d.id 
         WHERE u.id = ? AND u.is_active = 1`,
        [decoded.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.department_id,
      departmentName: user.department_name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const permissions = getRolePermissions(userRole);

    if (!permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required: permission,
        userRole: userRole
      });
    }

    next();
  };
};

const getRolePermissions = (role) => {
  const rolePermissions = {
    admin: [
      'view_own_profile', 'edit_own_skills', 'view_own_assessments',
      'view_team_profiles', 'view_department_profiles', 'conduct_assessments',
      'view_all_employees', 'edit_employee_profiles', 'manage_job_profiles',
      'view_organization_dashboard', 'manage_users', 'manage_permissions',
      'system_configuration', 'view_audit_logs'
    ],
    hr_manager: [
      'view_own_profile', 'edit_own_skills', 'view_own_assessments',
      'view_all_employees', 'edit_employee_profiles', 'conduct_assessments',
      'manage_job_profiles', 'view_organization_dashboard'
    ],
    department_manager: [
      'view_own_profile', 'edit_own_skills', 'view_own_assessments',
      'view_department_profiles', 'conduct_assessments', 'view_organization_dashboard'
    ],
    team_lead: [
      'view_own_profile', 'edit_own_skills', 'view_own_assessments',
      'view_team_profiles', 'conduct_assessments'
    ],
    assessor: [
      'view_own_profile', 'edit_own_skills', 'view_own_assessments',
      'conduct_assessments', 'view_team_profiles'
    ],
    employee: [
      'view_own_profile', 'edit_own_skills', 'view_own_assessments'
    ]
  };

  return rolePermissions[role] || [];
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  getRolePermissions
};