const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateUpdateUser, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all users (admin/HR only)
router.get('/', authenticateToken, requirePermission('manage_users'), validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, department, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.email, u.name, u.role, u.department_id, u.is_active, 
             u.last_login, u.created_at, d.name as department_name
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      query += ' AND u.department_id = ?';
      countQuery += ' AND u.department_id = ?';
      params.push(department);
    }

    if (role) {
      query += ' AND u.role = ?';
      countQuery += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      countQuery += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users, totalResult] = await Promise.all([
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
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      code: 'GET_USERS_ERROR'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if user can access this user's data
    if (req.user.id !== id && !req.user.permissions?.includes('view_all_employees')) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.email, u.name, u.role, u.department_id, u.is_active, 
               u.last_login, u.created_at, d.name as department_name
        FROM users u 
        LEFT JOIN departments d ON u.department_id = d.id 
        WHERE u.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      code: 'GET_USER_ERROR'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, validateUUID('id'), validateUpdateUser, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { name, role, departmentId, isActive } = req.body;

    // Check permissions
    const canEditOthers = req.user.permissions?.includes('edit_employee_profiles');
    if (req.user.id !== id && !canEditOthers) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if user exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (role !== undefined && canEditOthers) {
      updates.push('role = ?');
      values.push(role);
    }

    if (departmentId !== undefined && canEditOthers) {
      updates.push('department_id = ?');
      values.push(departmentId);
    }

    if (isActive !== undefined && canEditOthers) {
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
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated user
    const updatedUser = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.email, u.name, u.role, u.department_id, u.is_active, 
               u.last_login, u.created_at, u.updated_at, d.name as department_name
        FROM users u 
        LEFT JOIN departments d ON u.department_id = d.id 
        WHERE u.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      code: 'UPDATE_USER_ERROR'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requirePermission('manage_users'), validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        error: 'Cannot delete your own account',
        code: 'SELF_DELETE_FORBIDDEN'
      });
    }

    // Check if user exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Soft delete by setting is_active to false
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      code: 'DELETE_USER_ERROR'
    });
  }
});

module.exports = router;