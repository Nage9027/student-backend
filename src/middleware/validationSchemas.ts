import { body, param, query } from 'express-validator';

// Auth validation
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const studentRegistrationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('profile.firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('profile.lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('profile.phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('profile.address')
    .notEmpty()
    .trim()
    .withMessage('Address is required'),
  body('profile.dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('profile.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('academicInfo.currentSemester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Current semester must be between 1 and 8'),
  body('academicInfo.department')
    .notEmpty()
    .trim()
    .withMessage('Department is required'),
  body('academicInfo.program')
    .notEmpty()
    .trim()
    .withMessage('Program is required'),
  body('academicInfo.batch')
    .notEmpty()
    .trim()
    .withMessage('Batch is required'),
  body('parentInfo.fatherName')
    .notEmpty()
    .trim()
    .withMessage('Father\'s name is required'),
  body('parentInfo.motherName')
    .notEmpty()
    .trim()
    .withMessage('Mother\'s name is required'),
  body('parentInfo.parentPhone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid parent phone number'),
  body('parentInfo.parentEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid parent email')
];

// Student validation
export const studentUpdateValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('profile.firstName')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('First name cannot be empty'),
  body('profile.lastName')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('Last name cannot be empty'),
  body('profile.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('academicInfo.currentSemester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Current semester must be between 1 and 8')
];

// Teacher validation
export const teacherCreateValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('profile.firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('profile.lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('profile.phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('profile.address')
    .notEmpty()
    .trim()
    .withMessage('Address is required'),
  body('profile.dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('profile.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('department')
    .notEmpty()
    .trim()
    .withMessage('Department is required'),
  body('designation')
    .notEmpty()
    .trim()
    .withMessage('Designation is required'),
  body('qualifications')
    .isArray({ min: 1 })
    .withMessage('At least one qualification is required'),
  body('salary')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number')
];

// Subject validation
export const subjectCreateValidation = [
  body('code')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Subject code must be between 2 and 10 characters'),
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Subject name is required'),
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  body('department')
    .notEmpty()
    .trim()
    .withMessage('Department is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('teacher')
    .isMongoId()
    .withMessage('Invalid teacher ID')
];

// Assignment validation
export const assignmentCreateValidation = [
  body('title')
    .notEmpty()
    .trim()
    .withMessage('Assignment title is required'),
  body('description')
    .notEmpty()
    .trim()
    .withMessage('Assignment description is required'),
  body('subjectId')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('maximumMarks')
    .isInt({ min: 1 })
    .withMessage('Maximum marks must be a positive number')
];

// Attendance validation
export const attendanceValidation = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('subjectId')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('status')
    .isIn(['present', 'absent', 'leave'])
    .withMessage('Status must be present, absent, or leave')
];

// Grade validation
export const gradeValidation = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('subjectId')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  body('marksObtained')
    .isInt({ min: 0 })
    .withMessage('Marks obtained must be a non-negative number'),
  body('maximumMarks')
    .isInt({ min: 1 })
    .withMessage('Maximum marks must be a positive number'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters')
];

// Fee validation
export const feeCreateValidation = [
  body('student')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('academicYear')
    .notEmpty()
    .trim()
    .withMessage('Academic year is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('totalAmount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date')
];

// Query validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];

// ID validation
export const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];
