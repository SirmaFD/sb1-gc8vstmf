const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateCreateSkill, validateEmployeeSkill, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all skills
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, category, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM skills WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM skills WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [skills, totalResult] = await Promise.all([
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
      skills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      error: 'Failed to get skills',
      code: 'GET_SKILLS_ERROR'
    });
  }
});

// Get skill by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const skill = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM skills WHERE id = ?', [id], (err, row) => {
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

    res.json({ skill });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      error: 'Failed to get skill',
      code: 'GET_SKILL_ERROR'
    });
  }
});

// Create new skill
router.post('/', authenticateToken, requirePermission('manage_job_profiles'), validateCreateSkill, async (req, res) => {
  try {
    const db = getDatabase();
    const { name, description, category } = req.body;

    const skillId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO skills (id, name, description, category) VALUES (?, ?, ?, ?)',
        [skillId, name, description || null, category],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const skill = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM skills WHERE id = ?', [skillId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      error: 'Failed to create skill',
      code: 'CREATE_SKILL_ERROR'
    });
  }
});

// Update skill
router.put('/:id', authenticateToken, requirePermission('manage_job_profiles'), validateUUID('id'), validateCreateSkill, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { name, description, category } = req.body;

    // Check if skill exists
    const existingSkill = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM skills WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingSkill) {
      return res.status(404).json({
        error: 'Skill not found',
        code: 'SKILL_NOT_FOUND'
      });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE skills SET name = ?, description = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || null, category, id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const skill = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM skills WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      error: 'Failed to update skill',
      code: 'UPDATE_SKILL_ERROR'
    });
  }
});

// Delete skill
router.delete('/:id', authenticateToken, requirePermission('manage_job_profiles'), validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if skill exists
    const existingSkill = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM skills WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingSkill) {
      return res.status(404).json({
        error: 'Skill not found',
        code: 'SKILL_NOT_FOUND'
      });
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM skills WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      error: 'Failed to delete skill',
      code: 'DELETE_SKILL_ERROR'
    });
  }
});

// Get user's skills
router.get('/user/:userId', authenticateToken, validateUUID('userId'), async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;

    // Check if user can access this user's skills
    if (req.user.id !== userId && !['admin', 'hr_manager'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const skills = await new Promise((resolve, reject) => {
      db.all(
        `SELECT es.*, s.name, s.description, s.category
         FROM employee_skills es
         JOIN skills s ON es.skill_id = s.id
         WHERE es.user_id = ?
         ORDER BY s.name`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ skills });
  } catch (error) {
    console.error('Get user skills error:', error);
    res.status(500).json({
      error: 'Failed to get user skills',
      code: 'GET_USER_SKILLS_ERROR'
    });
  }
});

// Add skill to user
router.post('/user/:userId', authenticateToken, validateUUID('userId'), validateEmployeeSkill, async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    const { skillId, currentLevel, targetLevel, priority, evidence, developmentPlan } = req.body;

    // Check if user can modify this user's skills
    if (req.user.id !== userId && !['admin', 'hr_manager'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if skill exists
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

    const employeeSkillId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO employee_skills 
         (id, user_id, skill_id, current_level, target_level, priority, evidence, development_plan, last_assessed) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [employeeSkillId, userId, skillId, currentLevel, targetLevel, priority, evidence || null, developmentPlan || null],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const employeeSkill = await new Promise((resolve, reject) => {
      db.get(
        `SELECT es.*, s.name, s.description, s.category
         FROM employee_skills es
         JOIN skills s ON es.skill_id = s.id
         WHERE es.id = ?`,
        [employeeSkillId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.status(201).json({
      message: 'Skill added to user successfully',
      skill: employeeSkill
    });
  } catch (error) {
    console.error('Add user skill error:', error);
    res.status(500).json({
      error: 'Failed to add skill to user',
      code: 'ADD_USER_SKILL_ERROR'
    });
  }
});

// Update user skill
router.put('/user/:userId/:skillId', authenticateToken, validateUUID('userId'), validateUUID('skillId'), validateEmployeeSkill, async (req, res) => {
  try {
    const db = getDatabase();
    const { userId, skillId } = req.params;
    const { currentLevel, targetLevel, priority, evidence, developmentPlan } = req.body;

    // Check if user can modify this user's skills
    if (req.user.id !== userId && !['admin', 'hr_manager'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if employee skill exists
    const existingSkill = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employee_skills WHERE user_id = ? AND skill_id = ?', [userId, skillId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingSkill) {
      return res.status(404).json({
        error: 'User skill not found',
        code: 'USER_SKILL_NOT_FOUND'
      });
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE employee_skills 
         SET current_level = ?, target_level = ?, priority = ?, evidence = ?, development_plan = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND skill_id = ?`,
        [currentLevel, targetLevel, priority, evidence || null, developmentPlan || null, userId, skillId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const employeeSkill = await new Promise((resolve, reject) => {
      db.get(
        `SELECT es.*, s.name, s.description, s.category
         FROM employee_skills es
         JOIN skills s ON es.skill_id = s.id
         WHERE es.user_id = ? AND es.skill_id = ?`,
        [userId, skillId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      message: 'User skill updated successfully',
      skill: employeeSkill
    });
  } catch (error) {
    console.error('Update user skill error:', error);
    res.status(500).json({
      error: 'Failed to update user skill',
      code: 'UPDATE_USER_SKILL_ERROR'
    });
  }
});

// Remove skill from user
router.delete('/user/:userId/:skillId', authenticateToken, validateUUID('userId'), validateUUID('skillId'), async (req, res) => {
  try {
    const db = getDatabase();
    const { userId, skillId } = req.params;

    // Check if user can modify this user's skills
    if (req.user.id !== userId && !['admin', 'hr_manager'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if employee skill exists
    const existingSkill = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employee_skills WHERE user_id = ? AND skill_id = ?', [userId, skillId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingSkill) {
      return res.status(404).json({
        error: 'User skill not found',
        code: 'USER_SKILL_NOT_FOUND'
      });
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM employee_skills WHERE user_id = ? AND skill_id = ?', [userId, skillId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Skill removed from user successfully'
    });
  } catch (error) {
    console.error('Remove user skill error:', error);
    res.status(500).json({
      error: 'Failed to remove skill from user',
      code: 'REMOVE_USER_SKILL_ERROR'
    });
  }
});

module.exports = router;