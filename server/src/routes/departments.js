const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateCreateDepartment, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all departments
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, search, active } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, 
             m.name as manager_name,
             COUNT(DISTINCT u.id) as employee_count
      FROM departments d
      LEFT JOIN users m ON d.manager_id = m.id
      LEFT JOIN users u ON d.id = u.department_id AND u.is_active = 1
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(DISTINCT d.id) as total 
      FROM departments d
      WHERE 1=1
    `;
    const params = [];

    if (active !== undefined) {
      const isActive = active === 'true' ? 1 : 0;
      query += ' AND d.is_active = ?';
      countQuery += ' AND d.is_active = ?';
      params.push(isActive);
    }

    if (search) {
      query += ' AND (d.name LIKE ? OR d.description LIKE ?)';
      countQuery += ' AND (d.name LIKE ? OR d.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY d.id ORDER BY d.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [departments, totalResult] = await Promise.all([
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
      departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      error: 'Failed to get departments',
      code: 'GET_DEPARTMENTS_ERROR'
    });
  }
});

// Get department by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const department = await new Promise((resolve, reject) => {
      db.get(`
        SELECT d.*, 
               m.name as manager_name, m.email as manager_email,
               COUNT(DISTINCT u.id) as employee_count
        FROM departments d
        LEFT JOIN users m ON d.manager_id = m.id
        LEFT JOIN users u ON d.id = u.department_id AND u.is_active = 1
        WHERE d.id = ?
        GROUP BY d.id
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!department) {
      return res.status(404).json({
        error: 'Department not found',
        code: 'DEPARTMENT_NOT_FOUND'
      });
    }

    // Get department employees
    const employees = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.email, u.role, u.last_login
        FROM users u
        WHERE u.department_id = ? AND u.is_active = 1
        ORDER BY u.name
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    department.employees = employees;

    res.json({ department });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      error: 'Failed to get department',
      code: 'GET_DEPARTMENT_ERROR'
    });
  }
});

// Create new department
router.post('/', authenticateToken, requirePermission('system_configuration'), validateCreateDepartment, async (req, res) => {
  try {
    const db = getDatabase();
    const { name, description, managerId } = req.body;

    // Check if manager exists (if provided)
    if (managerId) {
      const manager = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE id = ? AND is_active = 1', [managerId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!manager) {
        return res.status(404).json({
          error: 'Manager not found',
          code: 'MANAGER_NOT_FOUND'
        });
      }
    }

    const departmentId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO departments (id, name, description, manager_id) VALUES (?, ?, ?, ?)',
        [departmentId, name, description || null, managerId || null],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const department = await new Promise((resolve, reject) => {
      db.get(`
        SELECT d.*, m.name as manager_name
        FROM departments d
        LEFT JOIN users m ON d.manager_id = m.id
        WHERE d.id = ?
      `, [departmentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      error: 'Failed to create department',
      code: 'CREATE_DEPARTMENT_ERROR'
    });
  }
});

// Update department
router.put('/:id', authenticateToken, requirePermission('system_configuration'), validateUUID('id'), validateCreateDepartment, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { name, description, managerId, isActive } = req.body;

    // Check if department exists
    const existingDepartment = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM departments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingDepartment) {
      return res.status(404).json({
        error: 'Department not found',
        code: 'DEPARTMENT_NOT_FOUND'
      });
    }

    // Check if manager exists (if provided)
    if (managerId) {
      const manager = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE id = ? AND is_active = 1', [managerId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!manager) {
        return res.status(404).json({
          error: 'Manager not found',
          code: 'MANAGER_NOT_FOUND'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (managerId !== undefined) {
      updates.push('manager_id = ?');
      values.push(managerId);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated department
    const updatedDepartment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT d.*, m.name as manager_name
        FROM departments d
        LEFT JOIN users m ON d.manager_id = m.id
        WHERE d.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'Department updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      error: 'Failed to update department',
      code: 'UPDATE_DEPARTMENT_ERROR'
    });
  }
});

// Delete department
router.delete('/:id', authenticateToken, requirePermission('system_configuration'), validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if department exists
    const existingDepartment = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM departments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingDepartment) {
      return res.status(404).json({
        error: 'Department not found',
        code: 'DEPARTMENT_NOT_FOUND'
      });
    }

    // Check if department has employees
    const employeeCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE department_id = ? AND is_active = 1', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (employeeCount.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete department with active employees',
        code: 'DEPARTMENT_HAS_EMPLOYEES'
      });
    }

    // Soft delete by setting is_active to false
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE departments SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      error: 'Failed to delete department',
      code: 'DELETE_DEPARTMENT_ERROR'
    });
  }
});

// Get department statistics
router.get('/:id/stats', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if department exists
    const department = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM departments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!department) {
      return res.status(404).json({
        error: 'Department not found',
        code: 'DEPARTMENT_NOT_FOUND'
      });
    }

    // Get department statistics
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(DISTINCT u.id) as employee_count,
          COUNT(DISTINCT es.skill_id) as unique_skills,
          AVG(es.current_level) as avg_skill_level,
          COUNT(DISTINCT c.id) as total_certifications,
          COUNT(DISTINCT CASE WHEN a.assessment_date >= date('now', '-30 days') THEN a.id END) as recent_assessments
        FROM users u
        LEFT JOIN employee_skills es ON u.id = es.user_id
        LEFT JOIN certifications c ON u.id = c.user_id
        LEFT JOIN assessments a ON u.id = a.employee_id
        WHERE u.department_id = ? AND u.is_active = 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      department: department.name,
      statistics: {
        employeeCount: stats.employee_count || 0,
        uniqueSkills: stats.unique_skills || 0,
        avgSkillLevel: parseFloat((stats.avg_skill_level || 0).toFixed(2)),
        totalCertifications: stats.total_certifications || 0,
        recentAssessments: stats.recent_assessments || 0
      }
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      error: 'Failed to get department statistics',
      code: 'GET_DEPARTMENT_STATS_ERROR'
    });
  }
});

module.exports = router;