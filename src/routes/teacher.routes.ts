import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  markAttendance,
  getStudentsBySubject,
  updateGrades,
  createAssignment,
  getTeacherSubjects,
  getTeacherAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
  getTeacherGrades,
  getAttendanceBySubject
} from '../controllers/teacher.controller';

const router = express.Router();

router.use(authenticate);
router.use(authorize('teacher'));

// Subjects
router.get('/subjects', getTeacherSubjects);
router.get('/subjects/:subjectId/students', getStudentsBySubject);

// Attendance
router.post('/attendance', markAttendance);
router.get('/attendance/:subjectId', getAttendanceBySubject);

// Grades
router.get('/grades', getTeacherGrades);
router.post('/grades', updateGrades);

// Assignments
router.get('/assignments', getTeacherAssignments);
router.post('/assignments', createAssignment);
router.get('/assignments/:id/submissions', getAssignmentSubmissions);
router.put('/assignments/:id/submissions/:submissionId/grade', gradeSubmission);

export default router;