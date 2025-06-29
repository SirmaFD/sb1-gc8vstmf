const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateCreateLearningPath, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all learning paths
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, difficulty, targetSkill, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lp.*, 
             s.name as target_skill_name,
             COUNT(DISTINCT lm.id) as module_count,
             COUNT(DISTINCT ulp.user_id) as enrolled_count
      FROM learning_paths lp
      LEFT JOIN skills s ON lp.target_skill_id = s.id
      LEFT JOIN learning_modules lm ON lp.id = lm.learning_path_id
      LEFT JOIN user_learning_progress ulp ON lp.id = ulp.learning_path_id
      WHERE lp.is_active = 1
    `;
    let countQuery = `
      SELECT COUNT(DISTINCT lp.id) as total 
      FROM learning_paths lp
      WHERE lp.is_active = 1
    `;
    const params = [];

    if (difficulty) {
      query += ' AND lp.difficulty = ?';
      countQuery += ' AND lp.difficulty = ?';
      params.push(difficulty);
    }

    if (targetSkill) {
      query += ' AND lp.target_skill_id = ?';
      countQuery += ' AND lp.target_skill_id = ?';
      params.push(targetSkill);
    }

    if (search) {
      query += ' AND (lp.title LIKE ? OR lp.description LIKE ?)';
      countQuery += ' AND (lp.title LIKE ? OR lp.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY lp.id ORDER BY lp.title LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [learningPaths, totalResult] = await Promise.all([
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

    // Calculate completion rates for each path
    for (const path of learningPaths) {
      if (path.enrolled_count > 0) {
        const completedCount = await new Promise((resolve, reject) => {
          db.get(`
            SELECT COUNT(DISTINCT user_id) as completed
            FROM user_learning_progress ulp1
            WHERE ulp1.learning_path_id = ?
            AND NOT EXISTS (
              SELECT 1 FROM learning_modules lm
              LEFT JOIN user_learning_progress ulp2 ON lm.id = ulp2.module_id AND ulp2.user_id = ulp1.user_id
              WHERE lm.learning_path_id = ? AND lm.is_required = 1 
              AND (ulp2.is_completed IS NULL OR ulp2.is_completed = 0)
            )
          `, [path.id, path.id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        path.completion_rate = Math.round((completedCount.completed / path.enrolled_count) * 100);
      } else {
        path.completion_rate = 0;
      }
    }

    res.json({
      learningPaths,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get learning paths error:', error);
    res.status(500).json({
      error: 'Failed to get learning paths',
      code: 'GET_LEARNING_PATHS_ERROR'
    });
  }
});

// Get learning path by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const learningPath = await new Promise((resolve, reject) => {
      db.get(`
        SELECT lp.*, 
               s.name as target_skill_name,
               u.name as created_by_name
        FROM learning_paths lp
        LEFT JOIN skills s ON lp.target_skill_id = s.id
        LEFT JOIN users u ON lp.created_by = u.id
        WHERE lp.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!learningPath) {
      return res.status(404).json({
        error: 'Learning path not found',
        code: 'LEARNING_PATH_NOT_FOUND'
      });
    }

    // Get modules for this learning path
    const modules = await new Promise((resolve, reject) => {
      db.all(`
        SELECT lm.*,
               CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END as user_completed
        FROM learning_modules lm
        LEFT JOIN user_learning_progress ulp ON lm.id = ulp.module_id AND ulp.user_id = ?
        WHERE lm.learning_path_id = ?
        ORDER BY lm.order_index
      `, [req.user.id, id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    learningPath.modules = modules;

    // Check if user is enrolled
    const enrollment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as enrolled
        FROM user_learning_progress
        WHERE user_id = ? AND learning_path_id = ?
      `, [req.user.id, id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    learningPath.user_enrolled = enrollment.enrolled > 0;

    res.json({ learningPath });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({
      error: 'Failed to get learning path',
      code: 'GET_LEARNING_PATH_ERROR'
    });
  }
});

// Create new learning path
router.post('/', authenticateToken, requirePermission('manage_job_profiles'), validateCreateLearningPath, async (req, res) => {
  try {
    const db = getDatabase();
    const { title, description, targetSkillId, currentLevel, targetLevel, estimatedDuration, difficulty, modules } = req.body;

    // Verify target skill exists (if provided)
    if (targetSkillId) {
      const skill = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM skills WHERE id = ?', [targetSkillId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!skill) {
        return res.status(404).json({
          error: 'Target skill not found',
          code: 'SKILL_NOT_FOUND'
        });
      }
    }

    const learningPathId = uuidv4();

    // Create learning path
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO learning_paths 
         (id, title, description, target_skill_id, current_level, target_level, estimated_duration, difficulty, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          learningPathId, 
          title, 
          description || null, 
          targetSkillId || null, 
          currentLevel || null, 
          targetLevel || null, 
          estimatedDuration || null, 
          difficulty || 'intermediate',
          req.user.id
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Add modules
    if (modules && modules.length > 0) {
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO learning_modules 
             (id, learning_path_id, title, type, duration, is_required, order_index, content_url, description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(), 
              learningPathId, 
              module.title, 
              module.type, 
              module.duration || null, 
              module.required ? 1 : 0, 
              i + 1,
              module.contentUrl || null,
              module.description || null
            ],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // Get the created learning path with related data
    const learningPath = await new Promise((resolve, reject) => {
      db.get(`
        SELECT lp.*, 
               s.name as target_skill_name,
               u.name as created_by_name
        FROM learning_paths lp
        LEFT JOIN skills s ON lp.target_skill_id = s.id
        LEFT JOIN users u ON lp.created_by = u.id
        WHERE lp.id = ?
      `, [learningPathId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json({
      message: 'Learning path created successfully',
      learningPath
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({
      error: 'Failed to create learning path',
      code: 'CREATE_LEARNING_PATH_ERROR'
    });
  }
});

// Enroll in learning path
router.post('/:id/enroll', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if learning path exists
    const learningPath = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM learning_paths WHERE id = ? AND is_active = 1', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!learningPath) {
      return res.status(404).json({
        error: 'Learning path not found',
        code: 'LEARNING_PATH_NOT_FOUND'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM user_learning_progress WHERE user_id = ? AND learning_path_id = ? LIMIT 1',
        [req.user.id, id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingEnrollment) {
      return res.status(400).json({
        error: 'Already enrolled in this learning path',
        code: 'ALREADY_ENROLLED'
      });
    }

    // Get all modules for this learning path
    const modules = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id FROM learning_modules WHERE learning_path_id = ? ORDER BY order_index',
        [id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Create progress records for each module
    for (const module of modules) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO user_learning_progress 
           (id, user_id, learning_path_id, module_id, is_completed, progress_percentage) 
           VALUES (?, ?, ?, ?, 0, 0)`,
          [uuidv4(), req.user.id, id, module.id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({
      message: 'Successfully enrolled in learning path'
    });
  } catch (error) {
    console.error('Enroll in learning path error:', error);
    res.status(500).json({
      error: 'Failed to enroll in learning path',
      code: 'ENROLL_ERROR'
    });
  }
});

// Update module progress
router.put('/:pathId/modules/:moduleId/progress', authenticateToken, validateUUID('pathId'), validateUUID('moduleId'), async (req, res) => {
  try {
    const db = getDatabase();
    const { pathId, moduleId } = req.params;
    const { isCompleted, progressPercentage } = req.body;

    // Verify user is enrolled in this learning path
    const enrollment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM user_learning_progress WHERE user_id = ? AND learning_path_id = ? AND module_id = ?',
        [req.user.id, pathId, moduleId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!enrollment) {
      return res.status(404).json({
        error: 'Enrollment not found',
        code: 'ENROLLMENT_NOT_FOUND'
      });
    }

    // Update progress
    const updates = [];
    const values = [];

    if (isCompleted !== undefined) {
      updates.push('is_completed = ?');
      values.push(isCompleted ? 1 : 0);
      
      if (isCompleted) {
        updates.push('completion_date = CURRENT_TIMESTAMP');
        updates.push('progress_percentage = 100');
      }
    }

    if (progressPercentage !== undefined && !isCompleted) {
      updates.push('progress_percentage = ?');
      values.push(Math.max(0, Math.min(100, progressPercentage)));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(enrollment.id);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE user_learning_progress SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Update module progress error:', error);
    res.status(500).json({
      error: 'Failed to update progress',
      code: 'UPDATE_PROGRESS_ERROR'
    });
  }
});

module.exports = router;