const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateCreateAssessment, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get assessments
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, employeeId, skillId, assessorId } = req.query;
    const offset = (page - 1) * limit;

    // Check user permissions
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      SELECT a.*, 
             emp.name as employee_name, emp.email as employee_email,
             assessor.name as assessor_name,
             s.name as skill_name, s.category as skill_category
      FROM assessments a
      JOIN users emp ON a.employee_id = emp.id
      JOIN users assessor ON a.assessor_id = assessor.id
      JOIN skills s ON a.skill_id = s.id
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM assessments a
      JOIN users emp ON a.employee_id = emp.id
      WHERE 1=1
    `;
    
    const params = [];

    // Apply role-based filtering
    if (!['admin', 'hr_manager'].includes(userRole)) {
      // Non-admin users can only see assessments they conducted or received
      query += ' AND (a.employee_id = ? OR a.assessor_id = ?)';
      countQuery += ' AND (a.employee_id = ? OR a.assessor_id = ?)';
      params.push(userId, userId);
    }

    if (employeeId) {
      query += ' AND a.employee_id = ?';
      countQuery += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (skillId) {
      query += ' AND a.skill_id = ?';
      countQuery += ' AND a.skill_id = ?';
      params.push(skillId);
    }

    if (assessorId) {
      query += ' AND a.assessor_id = ?';
      countQuery += ' AND a.assessor_id = ?';
      params.push(assessorId);
    }

    query += ' ORDER BY a.assessment_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [assessments, totalResult] = await Promise.all([
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
      assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      error: 'Failed to get assessments',
      code: 'GET_ASSESSMENTS_ERROR'
    });
  }
});

// Get assessment by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const assessment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT a.*, 
               emp.name as employee_name, emp.email as employee_email,
               assessor.name as assessor_name,
               s.name as skill_name, s.category as skill_category, s.description as skill_description
        FROM assessments a
        JOIN users emp ON a.employee_id = emp.id
        JOIN users assessor ON a.assessor_id = assessor.id
        JOIN skills s ON a.skill_id = s.id
        WHERE a.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
        code: 'ASSESSMENT_NOT_FOUND'
      });
    }

    // Check access permissions
    const canAccess = 
      req.user.id === assessment.employee_id || // Employee being assessed
      req.user.id === assessment.assessor_id || // Assessor
      ['admin', 'hr_manager'].includes(req.user.role); // Admin/HR

    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      error: 'Failed to get assessment',
      code: 'GET_ASSESSMENT_ERROR'
    });
  }
});

// Create new assessment
router.post('/', authenticateToken, validateCreateAssessment, async (req, res) => {
  try {
    const db = getDatabase();
    const { employeeId, skillId, newLevel, notes, evidence, nextReviewDate } = req.body;

    // Check if user can conduct assessments
    const canAssess = 
      req.user.id === employeeId || // Self-assessment
      req.user.permissions?.includes('conduct_assessments') ||
      ['admin', 'hr_manager'].includes(req.user.role);

    if (!canAssess) {
      return res.status(403).json({
        error: 'Access denied - insufficient permissions to conduct assessments',
        code: 'ASSESSMENT_PERMISSION_DENIED'
      });
    }

    // Verify employee exists
    const employee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ? AND is_active = 1', [employeeId], (err, row) => {
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

    // Verify skill exists
    const skill = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM skills WHERE id = ?', [skillId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!skill) {
      return res.status(404).json({
        error: 'Skill not found',
        code: 'SKILL_NOT_FOUND'
      });
    }

    // Get current skill level
    const currentSkill = await new Promise((resolve, reject) => {
      db.get(
        'SELECT current_level FROM employee_skills WHERE user_id = ? AND skill_id = ?',
        [employeeId, skillId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const previousLevel = currentSkill?.current_level || 1;

    // Create assessment
    const assessmentId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO assessments 
         (id, employee_id, assessor_id, skill_id, previous_level, new_level, notes, evidence, next_review_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assessmentId, 
          employeeId, 
          req.user.id, 
          skillId, 
          previousLevel, 
          newLevel, 
          notes || null, 
          evidence ? JSON.stringify(evidence) : null,
          nextReviewDate || null
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update employee skill level
    if (currentSkill) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE employee_skills SET current_level = ?, last_assessed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND skill_id = ?',
          [newLevel, employeeId, skillId],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    } else {
      // Create new employee skill record if it doesn't exist
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO employee_skills (id, user_id, skill_id, current_level, target_level, priority, last_assessed) 
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [uuidv4(), employeeId, skillId, newLevel, Math.max(newLevel, 3), 'medium'],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Get the created assessment with related data
    const assessment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT a.*, 
               emp.name as employee_name,
               assessor.name as assessor_name,
               s.name as skill_name
        FROM assessments a
        JOIN users emp ON a.employee_id = emp.id
        JOIN users assessor ON a.assessor_id = assessor.id
        JOIN skills s ON a.skill_id = s.id
        WHERE a.id = ?
      `, [assessmentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      error: 'Failed to create assessment',
      code: 'CREATE_ASSESSMENT_ERROR'
    });
  }
});

// Update assessment
router.put('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { newLevel, notes, evidence, nextReviewDate } = req.body;

    // Get existing assessment
    const existingAssessment = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM assessments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingAssessment) {
      return res.status(404).json({
        error: 'Assessment not found',
        code: 'ASSESSMENT_NOT_FOUND'
      });
    }

    // Check permissions - only assessor or admin can update
    const canUpdate = 
      req.user.id === existingAssessment.assessor_id ||
      ['admin', 'hr_manager'].includes(req.user.role);

    if (!canUpdate) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Update assessment
    const updates = [];
    const values = [];

    if (newLevel !== undefined) {
      updates.push('new_level = ?');
      values.push(newLevel);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (evidence !== undefined) {
      updates.push('evidence = ?');
      values.push(evidence ? JSON.stringify(evidence) : null);
    }

    if (nextReviewDate !== undefined) {
      updates.push('next_review_date = ?');
      values.push(nextReviewDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    values.push(id);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE assessments SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update employee skill level if new level was provided
    if (newLevel !== undefined) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE employee_skills SET current_level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND skill_id = ?',
          [newLevel, existingAssessment.employee_id, existingAssessment.skill_id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Get updated assessment
    const updatedAssessment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT a.*, 
               emp.name as employee_name,
               assessor.name as assessor_name,
               s.name as skill_name
        FROM assessments a
        JOIN users emp ON a.employee_id = emp.id
        JOIN users assessor ON a.assessor_id = assessor.id
        JOIN skills s ON a.skill_id = s.id
        WHERE a.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'Assessment updated successfully',
      assessment: updatedAssessment
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      error: 'Failed to update assessment',
      code: 'UPDATE_ASSESSMENT_ERROR'
    });
  }
});

// Delete assessment
router.delete('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Get existing assessment
    const existingAssessment = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM assessments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingAssessment) {
      return res.status(404).json({
        error: 'Assessment not found',
        code: 'ASSESSMENT_NOT_FOUND'
      });
    }

    // Check permissions - only assessor or admin can delete
    const canDelete = 
      req.user.id === existingAssessment.assessor_id ||
      ['admin'].includes(req.user.role); // Only admin can delete assessments

    if (!canDelete) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM assessments WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      error: 'Failed to delete assessment',
      code: 'DELETE_ASSESSMENT_ERROR'
    });
  }
});

module.exports = router;