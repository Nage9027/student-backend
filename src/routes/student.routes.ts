import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getStudentProfile,
  getStudentAttendance,
  getStudentGrades,
  getStudentAssignments,
  submitAssignment,
  getStudentFees
} from '../controllers/student.controller';

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/profile', getStudentProfile);
router.get('/attendance', getStudentAttendance);
router.get('/grades', getStudentGrades);
router.get('/assignments', getStudentAssignments);
router.post('/assignments/:assignmentId/submit', submitAssignment);
router.get('/fees', getStudentFees);

export default router;