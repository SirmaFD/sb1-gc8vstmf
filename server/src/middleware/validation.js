const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .isIn(['admin', 'hr_manager', 'department_manager', 'team_lead', 'employee', 'assessor'])
    .withMessage('Invalid role'),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid department ID'),
  handleValidationErrors
];

// User validation rules
const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'hr_manager', 'department_manager', 'team_lead', 'employee', 'assessor'])
    .withMessage('Invalid role'),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid department ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Skill validation rules
const validateCreateSkill = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  handleValidationErrors
];

const validateEmployeeSkill = [
  body('skillId')
    .isUUID()
    .withMessage('Valid skill ID is required'),
  body('currentLevel')
    .isInt({ min: 1, max: 5 })
    .withMessage('Current level must be between 1 and 5'),
  body('targetLevel')
    .isInt({ min: 1, max: 5 })
    .withMessage('Target level must be between 1 and 5'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('evidence')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Evidence must not exceed 1000 characters'),
  body('developmentPlan')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Development plan must not exceed 1000 characters'),
  handleValidationErrors
];

// Assessment validation rules
const validateCreateAssessment = [
  body('employeeId')
    .isUUID()
    .withMessage('Valid employee ID is required'),
  body('skillId')
    .isUUID()
    .withMessage('Valid skill ID is required'),
  body('newLevel')
    .isInt({ min: 1, max: 5 })
    .withMessage('New level must be between 1 and 5'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  body('nextReviewDate')
    .optional()
    .isISO8601()
    .withMessage('Next review date must be a valid date'),
  handleValidationErrors
];

// Department validation rules
const validateCreateDepartment = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('managerId')
    .optional()
    .isUUID()
    .withMessage('Invalid manager ID'),
  handleValidationErrors
];

// Job Profile validation rules
const validateCreateJobProfile = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  body('departmentId')
    .isUUID()
    .withMessage('Valid department ID is required'),
  body('level')
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'principal'])
    .withMessage('Invalid job level'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),
  handleValidationErrors
];

// Learning Path validation rules
const validateCreateLearningPath = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Learning path title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('targetSkillId')
    .optional()
    .isUUID()
    .withMessage('Invalid target skill ID'),
  body('currentLevel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Current level must be between 1 and 5'),
  body('targetLevel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Target level must be between 1 and 5'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  handleValidationErrors
];

// Common parameter validations
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateUpdateUser,
  validateCreateSkill,
  validateEmployeeSkill,
  validateCreateAssessment,
  validateCreateDepartment,
  validateCreateJobProfile,
  validateCreateLearningPath,
  validateUUID,
  validatePagination,
  handleValidationErrors
};