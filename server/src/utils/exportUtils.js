const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportUtils {
  /**
   * Export data to CSV format
   */
  static async exportToCSV(data, fields, filename = 'export.csv') {
    try {
      const json2csvParser = new Parser({ 
        fields,
        delimiter: ',',
        quote: '"',
        escapedQuote: '""',
        header: true,
        transforms: [
          // Transform dates to readable format
          (item) => {
            Object.keys(item).forEach(key => {
              if (item[key] instanceof Date) {
                item[key] = item[key].toISOString().split('T')[0];
              }
            });
            return item;
          }
        ]
      });
      
      const csv = json2csvParser.parse(data);
      return {
        content: csv,
        filename,
        mimeType: 'text/csv'
      };
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('Failed to export CSV');
    }
  }

  /**
   * Export skills data with proper formatting
   */
  static async exportSkillsData(skills, includeDetails = true) {
    const fields = [
      { label: 'Employee Name', value: 'employeeName' },
      { label: 'Email', value: 'employeeEmail' },
      { label: 'Department', value: 'department' },
      { label: 'Skill Name', value: 'skillName' },
      { label: 'Category', value: 'category' },
      { label: 'Current Level', value: 'currentLevel' },
      { label: 'Target Level', value: 'targetLevel' },
      { label: 'Priority', value: 'priority' },
      { label: 'Last Assessed', value: 'lastAssessed' },
      ...(includeDetails ? [
        { label: 'Evidence', value: 'evidence' },
        { label: 'Development Plan', value: 'developmentPlan' }
      ] : [])
    ];

    const formattedData = skills.map(skill => ({
      employeeName: skill.employee?.name || 'Unknown',
      employeeEmail: skill.employee?.email || 'Unknown',
      department: skill.employee?.department || 'Unknown',
      skillName: skill.name,
      category: skill.category,
      currentLevel: this.getSkillLevelText(skill.current_level),
      targetLevel: this.getSkillLevelText(skill.target_level),
      priority: skill.priority?.toUpperCase() || 'MEDIUM',
      lastAssessed: skill.last_assessed,
      evidence: skill.evidence || '',
      developmentPlan: skill.development_plan || ''
    }));

    return this.exportToCSV(formattedData, fields, 'skills-export.csv');
  }

  /**
   * Export skill gaps analysis
   */
  static async exportSkillGaps(skillGaps) {
    const fields = [
      { label: 'Employee Name', value: 'employeeName' },
      { label: 'Department', value: 'department' },
      { label: 'Role', value: 'role' },
      { label: 'Skill Name', value: 'skillName' },
      { label: 'Current Level', value: 'currentLevel' },
      { label: 'Required Level', value: 'requiredLevel' },
      { label: 'Gap Size', value: 'gapSize' },
      { label: 'Priority', value: 'priority' },
      { label: 'Job Profile', value: 'jobProfile' }
    ];

    const formattedData = skillGaps.map(gap => ({
      employeeName: gap.employeeName,
      department: gap.department,
      role: gap.role,
      skillName: gap.skillName,
      currentLevel: this.getSkillLevelText(gap.currentLevel),
      requiredLevel: this.getSkillLevelText(gap.requiredLevel),
      gapSize: `${gap.gap} level${gap.gap !== 1 ? 's' : ''}`,
      priority: gap.priority?.toUpperCase() || 'MEDIUM',
      jobProfile: gap.jobProfileTitle || 'N/A'
    }));

    return this.exportToCSV(formattedData, fields, 'skill-gaps-analysis.csv');
  }

  /**
   * Export performance metrics
   */
  static async exportPerformanceMetrics(performanceData) {
    const fields = [
      { label: 'Employee Name', value: 'employeeName' },
      { label: 'Department', value: 'department' },
      { label: 'Role', value: 'role' },
      { label: 'Overall Score', value: 'overallScore' },
      { label: 'System Usage Score', value: 'systemUsageScore' },
      { label: 'Skill Development Score', value: 'skillDevelopmentScore' },
      { label: 'Assessment Participation', value: 'assessmentScore' },
      { label: 'Learning Engagement', value: 'learningScore' },
      { label: 'Status', value: 'status' },
      { label: 'Last Review Date', value: 'lastReviewDate' },
      { label: 'Next Review Date', value: 'nextReviewDate' }
    ];

    const formattedData = performanceData.map(perf => ({
      employeeName: perf.employeeName,
      department: perf.department,
      role: perf.role,
      overallScore: `${perf.overallPerformanceScore}%`,
      systemUsageScore: `${perf.systemUsageScore}%`,
      skillDevelopmentScore: `${perf.skillDevelopmentScore}%`,
      assessmentScore: `${perf.assessmentParticipationScore}%`,
      learningScore: `${perf.learningEngagementScore}%`,
      status: perf.status?.replace('-', ' ').toUpperCase() || 'UNKNOWN',
      lastReviewDate: perf.lastReviewDate,
      nextReviewDate: perf.nextReviewDate
    }));

    return this.exportToCSV(formattedData, fields, 'performance-metrics.csv');
  }

  /**
   * Export assessments data
   */
  static async exportAssessments(assessments) {
    const fields = [
      { label: 'Assessment Date', value: 'assessmentDate' },
      { label: 'Employee Name', value: 'employeeName' },
      { label: 'Assessor Name', value: 'assessorName' },
      { label: 'Skill Name', value: 'skillName' },
      { label: 'Previous Level', value: 'previousLevel' },
      { label: 'New Level', value: 'newLevel' },
      { label: 'Improvement', value: 'improvement' },
      { label: 'Notes', value: 'notes' },
      { label: 'Next Review Date', value: 'nextReviewDate' }
    ];

    const formattedData = assessments.map(assessment => ({
      assessmentDate: assessment.assessment_date,
      employeeName: assessment.employeeName,
      assessorName: assessment.assessorName,
      skillName: assessment.skillName,
      previousLevel: this.getSkillLevelText(assessment.previous_level),
      newLevel: this.getSkillLevelText(assessment.new_level),
      improvement: assessment.new_level > assessment.previous_level ? 'Improved' : 
                  assessment.new_level < assessment.previous_level ? 'Declined' : 'No Change',
      notes: assessment.notes || '',
      nextReviewDate: assessment.next_review_date || ''
    }));

    return this.exportToCSV(formattedData, fields, 'assessments-export.csv');
  }

  /**
   * Export department statistics
   */
  static async exportDepartmentStats(departmentStats) {
    const fields = [
      { label: 'Department', value: 'department' },
      { label: 'Employee Count', value: 'employeeCount' },
      { label: 'Average Skill Level', value: 'avgSkillLevel' },
      { label: 'Skills Tracked', value: 'skillsTracked' },
      { label: 'Assessments This Month', value: 'assessmentsThisMonth' },
      { label: 'High Performers', value: 'highPerformers' },
      { label: 'Needs Improvement', value: 'needsImprovement' },
      { label: 'Certification Count', value: 'certificationCount' }
    ];

    const formattedData = departmentStats.map(dept => ({
      department: dept.name,
      employeeCount: dept.employeeCount,
      avgSkillLevel: dept.avgSkillLevel?.toFixed(2) || '0.00',
      skillsTracked: dept.skillsTracked || 0,
      assessmentsThisMonth: dept.assessmentsThisMonth || 0,
      highPerformers: dept.highPerformers || 0,
      needsImprovement: dept.needsImprovement || 0,
      certificationCount: dept.certificationCount || 0
    }));

    return this.exportToCSV(formattedData, fields, 'department-statistics.csv');
  }

  /**
   * Helper method to convert skill level numbers to text
   */
  static getSkillLevelText(level) {
    const levels = {
      1: 'Beginner',
      2: 'Intermediate', 
      3: 'Advanced',
      4: 'Expert',
      5: 'Master'
    };
    return levels[level] || 'Unknown';
  }

  /**
   * Generate comprehensive organization report
   */
  static async exportOrganizationReport(reportData) {
    const {
      skills,
      skillGaps,
      performanceMetrics,
      assessments,
      departmentStats
    } = reportData;

    // Create multiple sheets worth of data
    const exports = {};

    if (skills?.length) {
      exports.skills = await this.exportSkillsData(skills);
    }

    if (skillGaps?.length) {
      exports.skillGaps = await this.exportSkillGaps(skillGaps);
    }

    if (performanceMetrics?.length) {
      exports.performance = await this.exportPerformanceMetrics(performanceMetrics);
    }

    if (assessments?.length) {
      exports.assessments = await this.exportAssessments(assessments);
    }

    if (departmentStats?.length) {
      exports.departments = await this.exportDepartmentStats(departmentStats);
    }

    return exports;
  }

  /**
   * Create a summary CSV with key organizational metrics
   */
  static async exportExecutiveSummary(summaryData) {
    const fields = [
      { label: 'Metric', value: 'metric' },
      { label: 'Value', value: 'value' },
      { label: 'Target', value: 'target' },
      { label: 'Status', value: 'status' },
      { label: 'Trend', value: 'trend' }
    ];

    const formattedData = [
      {
        metric: 'Total Employees',
        value: summaryData.totalEmployees,
        target: summaryData.targetEmployees || 'N/A',
        status: 'Current',
        trend: summaryData.employeeGrowth || 'Stable'
      },
      {
        metric: 'Average Skill Level',
        value: summaryData.avgSkillLevel?.toFixed(2) || '0.00',
        target: '4.0',
        status: summaryData.avgSkillLevel >= 4 ? 'On Target' : 'Below Target',
        trend: summaryData.skillTrend || 'Stable'
      },
      {
        metric: 'Skills Gaps',
        value: summaryData.totalSkillGaps,
        target: '0',
        status: summaryData.totalSkillGaps === 0 ? 'Excellent' : 'Needs Attention',
        trend: summaryData.gapTrend || 'Stable'
      },
      {
        metric: 'Assessment Completion Rate',
        value: `${summaryData.assessmentCompletionRate}%`,
        target: '90%',
        status: summaryData.assessmentCompletionRate >= 90 ? 'On Target' : 'Below Target',
        trend: summaryData.assessmentTrend || 'Stable'
      },
      {
        metric: 'System Engagement',
        value: `${summaryData.systemEngagement}%`,
        target: '80%',
        status: summaryData.systemEngagement >= 80 ? 'Good' : 'Needs Improvement',
        trend: summaryData.engagementTrend || 'Stable'
      }
    ];

    return this.exportToCSV(formattedData, fields, 'executive-summary.csv');
  }
}

module.exports = ExportUtils;