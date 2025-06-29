const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateCreateJobProfile, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get all job profiles
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, department, level, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT jp.*, d.name as department_name
      FROM job_profiles jp
      LEFT JOIN departments d ON jp.department_id = d.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM job_profiles jp
      LEFT JOIN departments d ON jp.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      query += ' AND jp.department_id = ?';
      countQuery += ' AND jp.department_id = ?';
      params.push(department);
    }

    if (level) {
      query += ' AND jp.level = ?';
      countQuery += ' AND jp.level = ?';
      params.push(level);
    }

    if (search) {
      query += ' AND (jp.title LIKE ? OR jp.description LIKE ?)';
      countQuery += ' AND (jp.title LIKE ? OR jp.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY jp.title LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [jobProfiles, totalResult] = await Promise.all([
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

    // Get skills for each job profile
    for (const profile of jobProfiles) {
      const skills = await new Promise((resolve, reject) => {
        db.all(`
          SELECT jps.*, s.name as skill_name, s.category as skill_category
          FROM job_profile_skills jps
          JOIN skills s ON jps.skill_id = s.id
          WHERE jps.job_profile_id = ?
          ORDER BY jps.weight DESC, s.name
        `, [profile.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      profile.requiredSkills = skills.filter(s => s.is_required);
      profile.preferredSkills = skills.filter(s => !s.is_required);
      
      // Parse responsibilities JSON
      if (profile.responsibilities) {
        try {
          profile.responsibilities = JSON.parse(profile.responsibilities);
        } catch (e) {
          profile.responsibilities = [];
        }
      }
    }

    res.json({
      jobProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get job profiles error:', error);
    res.status(500).json({
      error: 'Failed to get job profiles',
      code: 'GET_JOB_PROFILES_ERROR'
    });
  }
});

// Get job profile by ID
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const jobProfile = await new Promise((resolve, reject) => {
      db.get(`
        SELECT jp.*, d.name as department_name
        FROM job_profiles jp
        LEFT JOIN departments d ON jp.department_id = d.id
        WHERE jp.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!jobProfile) {
      return res.status(404).json({
        error: 'Job profile not found',
        code: 'JOB_PROFILE_NOT_FOUND'
      });
    }

    // Get skills for this job profile
    const skills = await new Promise((resolve, reject) => {
      db.all(`
        SELECT jps.*, s.name as skill_name, s.category as skill_category, s.description as skill_description
        FROM job_profile_skills jps
        JOIN skills s ON jps.skill_id = s.id
        WHERE jps.job_profile_id = ?
        ORDER BY jps.weight DESC, s.name
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    jobProfile.requiredSkills = skills.filter(s => s.is_required);
    jobProfile.preferredSkills = skills.filter(s => !s.is_required);
    
    // Parse responsibilities JSON
    if (jobProfile.responsibilities) {
      try {
        jobProfile.responsibilities = JSON.parse(jobProfile.responsibilities);
      } catch (e) {
        jobProfile.responsibilities = [];
      }
    }

    res.json({ jobProfile });
  } catch (error) {
    console.error('Get job profile error:', error);
    res.status(500).json({
      error: 'Failed to get job profile',
      code: 'GET_JOB_PROFILE_ERROR'
    });
  }
});

// Create new job profile
router.post('/', authenticateToken, requirePermission('manage_job_profiles'), validateCreateJobProfile, async (req, res) => {
  try {
    const db = getDatabase();
    const { title, departmentId, level, description, responsibilities, requiredSkills, preferredSkills } = req.body;

    // Verify department exists
    const department = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM departments WHERE id = ?', [departmentId], (err, row) => {
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

    const jobProfileId = uuidv4();

    // Create job profile
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO job_profiles (id, title, department_id, level, description, responsibilities) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          jobProfileId, 
          title, 
          departmentId, 
          level, 
          description || null, 
          responsibilities ? JSON.stringify(responsibilities) : null
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Add required skills
    if (requiredSkills && requiredSkills.length > 0) {
      for (const skill of requiredSkills) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO job_profile_skills (id, job_profile_id, skill_id, minimum_level, weight, is_required) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), jobProfileId, skill.skillId, skill.minimumLevel, skill.weight, 1],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // Add preferred skills
    if (preferredSkills && preferredSkills.length > 0) {
      for (const skill of preferredSkills) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO job_profile_skills (id, job_profile_id, skill_id, minimum_level, weight, is_required) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), jobProfileId, skill.skillId, skill.minimumLevel, skill.weight, 0],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // Get the created job profile with related data
    const jobProfile = await new Promise((resolve, reject) => {
      db.get(`
        SELECT jp.*, d.name as department_name
        FROM job_profiles jp
        LEFT JOIN departments d ON jp.department_id = d.id
        WHERE jp.id = ?
      `, [jobProfileId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json({
      message: 'Job profile created successfully',
      jobProfile
    });
  } catch (error) {
    console.error('Create job profile error:', error);
    res.status(500).json({
      error: 'Failed to create job profile',
      code: 'CREATE_JOB_PROFILE_ERROR'
    });
  }
});

// Update job profile
router.put('/:id', authenticateToken, requirePermission('manage_job_profiles'), validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { title, departmentId, level, description, responsibilities } = req.body;

    // Check if job profile exists
    const existingProfile = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM job_profiles WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingProfile) {
      return res.status(404).json({
        error: 'Job profile not found',
        code: 'JOB_PROFILE_NOT_FOUND'
      });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }

    if (departmentId !== undefined) {
      updates.push('department_id = ?');
      values.push(departmentId);
    }

    if (level !== undefined) {
      updates.push('level = ?');
      values.push(level);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (responsibilities !== undefined) {
      updates.push('responsibilities = ?');
      values.push(responsibilities ? JSON.stringify(responsibilities) : null);
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
        `UPDATE job_profiles SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated job profile
    const updatedProfile = await new Promise((resolve, reject) => {
      db.get(`
        SELECT jp.*, d.name as department_name
        FROM job_profiles jp
        LEFT JOIN departments d ON jp.department_id = d.id
        WHERE jp.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'Job profile updated successfully',
      jobProfile: updatedProfile
    });
  } catch (error) {
    console.error('Update job profile error:', error);
    res.status(500).json({
      error: 'Failed to update job profile',
      code: 'UPDATE_JOB_PROFILE_ERROR'
    });
  }
});

// Delete job profile
router.delete('/:id', authenticateToken, requirePermission('manage_job_profiles'), validateUUID('id'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if job profile exists
    const existingProfile = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM job_profiles WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingProfile) {
      return res.status(404).json({
        error: 'Job profile not found',
        code: 'JOB_PROFILE_NOT_FOUND'
      });
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM job_profiles WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Job profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete job profile error:', error);
    res.status(500).json({
      error: 'Failed to delete job profile',
      code: 'DELETE_JOB_PROFILE_ERROR'
    });
  }
});

module.exports = router;