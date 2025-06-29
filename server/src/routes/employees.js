const express = require('express');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, department, search } = req.query;
    const offset = (page - 1) * limit;

    // Check user permissions to determine what employees they can see
    const userRole = req.user.role;
    const userDepartment = req.user.departmentId;

    let query = `
      SELECT u.id, u.email, u.name, u.role, u.department_id, u.last_login, u.created_at,
             d.name as department_name,
             COUNT(DISTINCT es.id) as skills_count,
             COUNT(DISTINCT c.id) as certifications_count,
             MAX(a.assessment_date) as last_assessment
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      LEFT JOIN employee_skills es ON u.id = es.user_id
      LEFT JOIN certifications c ON u.id = c.user_id
      LEFT JOIN assessments a ON u.id = a.employee_id
      WHERE u.is_active = 1 AND u.role != 'admin'
    `;
    
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.is_active = 1 AND u.role != 'admin'
    `;
    
    const params = [];

    // Apply role-based filtering
    if (userRole === 'department_manager') {
      query += ' AND u.department_id = ?';
      countQuery += ' AND u.department_id = ?';
      params.push(userDepartment);
    } else if (userRole === 'team_lead') {
      // Team leads can see their department members
      query += ' AND u.department_id = ?';
      countQuery += ' AND u.department_id = ?';
      params.push(userDepartment);
    } else if (!['admin', 'hr_manager'].includes(userRole)) {
      // Regular employees can only see themselves
      query += ' AND u.id = ?';
      countQuery += ' AND u.id = ?';
      params.push(req.user.id);
    }

    if (department) {
      query += ' AND u.department_id = ?';
      countQuery += ' AND u.department_id = ?';
      params.push(department);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.role LIKE ?)';
      countQuery += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.role LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY u.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [employees, totalResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.get(countQuery, params.slice(0, -2), (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      })
    ]);

    res.json({
      employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      error: 'Failed to get employees',
      code: 'GET_EMPLOYEES_ERROR'
    });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if user can access this employee's data
    const userRole = req.user.role;
    const userDepartment = req.user.departmentId;

    const employee = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.email, u.name, u.role, u.department_id, u.last_login, u.created_at,
               d.name as department_name
        FROM users u 
        LEFT JOIN departments d ON u.department_id = d.id 
        WHERE u.id = ? AND u.is_active = 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Check access permissions
    const canAccess = 
      req.user.id === id || // Own profile
      ['admin', 'hr_manager'].includes(userRole) || // Admin/HR can see all
      (userRole === 'department_manager' && employee.department_id === userDepartment) || // Dept manager can see dept employees
      (userRole === 'team_lead' && employee.department_id === userDepartment); // Team lead can see team members

    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Get employee's skills
    const skills = await new Promise((resolve, reject) => {
      db.all(`
        SELECT es.*, s.name, s.description, s.category
        FROM employee_skills es
        JOIN skills s ON es.skill_id = s.id
        WHERE es.user_id = ?
        ORDER BY s.name
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get employee's certifications
    const certifications = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM certifications 
        WHERE user_id = ? 
        ORDER BY date_obtained DESC
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get employee's qualifications
    const qualifications = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM qualifications 
        WHERE user_id = ? 
        ORDER BY date_obtained DESC
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      employee: {
        ...employee,
        skills,
        certifications,
        qualifications
      }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      error: 'Failed to get employee',
      code: 'GET_EMPLOYEE_ERROR'
    });
  }
});

// Get employee performance summary
router.get('/:id/performance', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check access permissions
    const canAccess = 
      req.user.id === id || 
      ['admin', 'hr_manager'].includes(req.user.role) ||
      req.user.permissions?.includes('conduct_assessments');

    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Get performance metrics
    const [skillsStats, assessmentStats, learningStats] = await Promise.all([
      // Skills statistics
      new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total_skills,
            AVG(current_level) as avg_current_level,
            AVG(target_level) as avg_target_level,
            COUNT(CASE WHEN current_level >= target_level THEN 1 END) as goals_met
          FROM employee_skills 
          WHERE user_id = ?
        `, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }),
      
      // Assessment statistics
      new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total_assessments,
            COUNT(CASE WHEN assessment_date >= date('now', '-30 days') THEN 1 END) as recent_assessments,
            AVG(new_level - previous_level) as avg_improvement
          FROM assessments 
          WHERE employee_id = ?
        `, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }),
      
      // Learning engagement (mock data for now)
      Promise.resolve({
        learning_paths_enrolled: 2,
        learning_paths_completed: 1,
        time_spent_learning: 120 // minutes
      })
    ]);

    // Calculate overall performance score
    const skillsScore = Math.min(100, (skillsStats.avg_current_level || 0) * 20);
    const assessmentScore = Math.min(100, (assessmentStats.recent_assessments || 0) * 25);
    const learningScore = Math.min(100, (learningStats.learning_paths_completed || 0) * 50);
    const overallScore = Math.round((skillsScore + assessmentScore + learningScore) / 3);

    res.json({
      performance: {
        overallScore,
        skillsScore,
        assessmentScore,
        learningScore,
        skillsStats,
        assessmentStats,
        learningStats
      }
    });
  } catch (error) {
    console.error('Get employee performance error:', error);
    res.status(500).json({
      error: 'Failed to get employee performance',
      code: 'GET_PERFORMANCE_ERROR'
    });
  }
});

module.exports = router;