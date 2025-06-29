const express = require('express');
const { getDatabase } = require('../database/connection');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');
const ExportUtils = require('../utils/exportUtils');

const router = express.Router();

// Get skills distribution report
router.get('/skills-distribution', authenticateToken, requirePermission('view_organization_dashboard'), async (req, res) => {
  try {
    const db = getDatabase();
    const { format = 'json' } = req.query;

    const skillsData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          es.*,
          s.name as skill_name,
          s.category,
          u.name as employee_name,
          u.email as employee_email,
          d.name as department
        FROM employee_skills es
        JOIN skills s ON es.skill_id = s.id
        JOIN users u ON es.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        ORDER BY u.name, s.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (format === 'csv') {
      const csvExport = await ExportUtils.exportSkillsData(skillsData.map(row => ({
        ...row,
        employee: {
          name: row.employee_name,
          email: row.employee_email,
          department: row.department
        },
        name: row.skill_name
      })));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvExport.filename}"`);
      return res.send(csvExport.content);
    }

    // Return JSON format
    const distribution = skillsData.reduce((acc, skill) => {
      const level = skill.current_level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    res.json({
      distribution,
      totalSkills: skillsData.length,
      skillsData: skillsData
    });
  } catch (error) {
    console.error('Skills distribution report error:', error);
    res.status(500).json({
      error: 'Failed to generate skills distribution report',
      code: 'REPORT_ERROR'
    });
  }
});

// Get skill gaps report
router.get('/skill-gaps', authenticateToken, requirePermission('view_organization_dashboard'), async (req, res) => {
  try {
    const db = getDatabase();
    const { format = 'json' } = req.query;

    const skillGaps = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          es.*,
          s.name as skill_name,
          u.name as employee_name,
          u.email as employee_email,
          d.name as department,
          jp.title as job_profile_title,
          jps.minimum_level as required_level
        FROM employee_skills es
        JOIN skills s ON es.skill_id = s.id
        JOIN users u ON es.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN job_profiles jp ON d.id = jp.department_id
        LEFT JOIN job_profile_skills jps ON jp.id = jps.job_profile_id AND s.id = jps.skill_id
        WHERE es.current_level < COALESCE(jps.minimum_level, es.target_level)
        ORDER BY (COALESCE(jps.minimum_level, es.target_level) - es.current_level) DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (format === 'csv') {
      const csvExport = await ExportUtils.exportSkillGaps(skillGaps.map(gap => ({
        employeeName: gap.employee_name,
        department: gap.department,
        role: gap.job_profile_title || 'Unknown',
        skillName: gap.skill_name,
        currentLevel: gap.current_level,
        requiredLevel: gap.required_level || gap.target_level,
        gap: (gap.required_level || gap.target_level) - gap.current_level,
        priority: gap.priority,
        jobProfileTitle: gap.job_profile_title
      })));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvExport.filename}"`);
      return res.send(csvExport.content);
    }

    res.json({
      skillGaps,
      totalGaps: skillGaps.length,
      highPriorityGaps: skillGaps.filter(gap => 
        ((gap.required_level || gap.target_level) - gap.current_level) >= 2
      ).length
    });
  } catch (error) {
    console.error('Skill gaps report error:', error);
    res.status(500).json({
      error: 'Failed to generate skill gaps report',
      code: 'REPORT_ERROR'
    });
  }
});

// Get performance metrics report
router.get('/performance-metrics', authenticateToken, requirePermission('view_organization_dashboard'), async (req, res) => {
  try {
    const db = getDatabase();
    const { format = 'json' } = req.query;

    // Get basic employee data for performance calculation
    const employees = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          u.*,
          d.name as department_name,
          COUNT(es.id) as skills_count,
          AVG(es.current_level) as avg_skill_level,
          COUNT(a.id) as assessments_count
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN employee_skills es ON u.id = es.user_id
        LEFT JOIN assessments a ON u.id = a.employee_id 
          AND a.assessment_date >= date('now', '-30 days')
        WHERE u.role != 'admin'
        GROUP BY u.id
        ORDER BY u.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Calculate performance metrics for each employee
    const performanceData = employees.map(emp => {
      // Mock performance calculation - in real app, this would be more sophisticated
      const systemUsageScore = Math.min(100, (emp.skills_count * 10) + (emp.assessments_count * 15));
      const skillDevelopmentScore = Math.min(100, (emp.avg_skill_level || 0) * 20);
      const assessmentScore = Math.min(100, emp.assessments_count * 25);
      const learningScore = Math.min(100, (emp.skills_count * 8) + 40);
      const overallScore = Math.round((systemUsageScore + skillDevelopmentScore + assessmentScore + learningScore) / 4);

      let status = 'on-track';
      if (overallScore >= 85) status = 'exceeds-expectations';
      else if (overallScore < 60) status = 'needs-improvement';

      return {
        employeeName: emp.name,
        department: emp.department_name,
        role: emp.role,
        overallPerformanceScore: overallScore,
        systemUsageScore,
        skillDevelopmentScore,
        assessmentParticipationScore: assessmentScore,
        learningEngagementScore: learningScore,
        status,
        lastReviewDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)   // 60 days from now
      };
    });

    if (format === 'csv') {
      const csvExport = await ExportUtils.exportPerformanceMetrics(performanceData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvExport.filename}"`);
      return res.send(csvExport.content);
    }

    res.json({
      performanceData,
      summary: {
        totalEmployees: employees.length,
        avgOverallScore: Math.round(performanceData.reduce((sum, p) => sum + p.overallPerformanceScore, 0) / performanceData.length),
        highPerformers: performanceData.filter(p => p.status === 'exceeds-expectations').length,
        needsImprovement: performanceData.filter(p => p.status === 'needs-improvement').length
      }
    });
  } catch (error) {
    console.error('Performance metrics report error:', error);
    res.status(500).json({
      error: 'Failed to generate performance metrics report',
      code: 'REPORT_ERROR'
    });
  }
});

// Get department statistics
router.get('/department-stats', authenticateToken, requirePermission('view_organization_dashboard'), async (req, res) => {
  try {
    const db = getDatabase();
    const { format = 'json' } = req.query;

    const departmentStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          d.name,
          d.description,
          COUNT(DISTINCT u.id) as employee_count,
          AVG(es.current_level) as avg_skill_level,
          COUNT(DISTINCT es.skill_id) as skills_tracked,
          COUNT(DISTINCT CASE WHEN a.assessment_date >= date('now', '-30 days') THEN a.id END) as assessments_this_month,
          COUNT(DISTINCT c.id) as certification_count
        FROM departments d
        LEFT JOIN users u ON d.id = u.department_id AND u.is_active = 1
        LEFT JOIN employee_skills es ON u.id = es.user_id
        LEFT JOIN assessments a ON u.id = a.employee_id
        LEFT JOIN certifications c ON u.id = c.user_id
        WHERE d.is_active = 1
        GROUP BY d.id, d.name
        ORDER BY d.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (format === 'csv') {
      const csvExport = await ExportUtils.exportDepartmentStats(departmentStats.map(dept => ({
        ...dept,
        employeeCount: dept.employee_count,
        avgSkillLevel: dept.avg_skill_level,
        skillsTracked: dept.skills_tracked,
        assessmentsThisMonth: dept.assessments_this_month,
        certificationCount: dept.certification_count,
        highPerformers: Math.floor(dept.employee_count * 0.2), // Mock calculation
        needsImprovement: Math.floor(dept.employee_count * 0.1) // Mock calculation
      })));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvExport.filename}"`);
      return res.send(csvExport.content);
    }

    res.json({
      departmentStats,
      totalDepartments: departmentStats.length,
      totalEmployees: departmentStats.reduce((sum, dept) => sum + dept.employee_count, 0)
    });
  } catch (error) {
    console.error('Department stats report error:', error);
    res.status(500).json({
      error: 'Failed to generate department statistics report',
      code: 'REPORT_ERROR'
    });
  }
});

// Get comprehensive organization report
router.get('/organization-summary', authenticateToken, requirePermission('view_organization_dashboard'), async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    // Gather all report data
    const [skillsResponse, gapsResponse, performanceResponse, departmentResponse] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/api/reports/skills-distribution`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/reports/skill-gaps`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/reports/performance-metrics`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/reports/department-stats`, {
        headers: { Authorization: req.headers.authorization }
      }).then(r => r.json())
    ]);

    if (format === 'csv') {
      const reportData = {
        skills: skillsResponse.skillsData,
        skillGaps: gapsResponse.skillGaps,
        performanceMetrics: performanceResponse.performanceData,
        departmentStats: departmentResponse.departmentStats
      };

      const exports = await ExportUtils.exportOrganizationReport(reportData);

      // For comprehensive report, return a ZIP file or multiple CSV files
      // For now, return the skills data as primary export
      const primaryExport = exports.skills || exports.performance;
      if (primaryExport) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="organization-report.csv"`);
        return res.send(primaryExport.content);
      }
    }

    // Executive summary
    const summaryData = {
      totalEmployees: departmentResponse.totalEmployees,
      avgSkillLevel: skillsResponse.skillsData?.length ? 
        skillsResponse.skillsData.reduce((sum, s) => sum + s.current_level, 0) / skillsResponse.skillsData.length : 0,
      totalSkillGaps: gapsResponse.totalGaps,
      assessmentCompletionRate: 85, // Mock calculation
      systemEngagement: 78 // Mock calculation
    };

    res.json({
      summary: summaryData,
      skills: skillsResponse,
      skillGaps: gapsResponse,
      performance: performanceResponse,
      departments: departmentResponse,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Organization summary report error:', error);
    res.status(500).json({
      error: 'Failed to generate organization summary report',
      code: 'REPORT_ERROR'
    });
  }
});

// Export executive summary
router.get('/executive-summary', authenticateToken, requirePermission('view_organization_dashboard'), async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    // Get summary data (this would typically come from a dedicated summary calculation)
    const summaryData = {
      totalEmployees: 94,
      targetEmployees: 100,
      employeeGrowth: '+6% this quarter',
      avgSkillLevel: 3.2,
      skillTrend: '+0.3 this quarter',
      totalSkillGaps: 23,
      gapTrend: '-5 this quarter',
      assessmentCompletionRate: 87,
      assessmentTrend: '+12% this quarter',
      systemEngagement: 82,
      engagementTrend: '+8% this quarter'
    };

    if (format === 'csv') {
      const csvExport = await ExportUtils.exportExecutiveSummary(summaryData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvExport.filename}"`);
      return res.send(csvExport.content);
    }

    res.json({
      summary: summaryData,
      generatedAt: new Date().toISOString(),
      period: 'Q1 2024'
    });
  } catch (error) {
    console.error('Executive summary report error:', error);
    res.status(500).json({
      error: 'Failed to generate executive summary report',
      code: 'REPORT_ERROR'
    });
  }
});

module.exports = router;