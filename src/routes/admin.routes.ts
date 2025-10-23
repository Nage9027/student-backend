import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createTeacher,
  getDashboardStats,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAllFees,
  createFee,
  updateFee,
  deleteFee
} from '../controllers/admin.controller';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Student Management
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Teacher Management
router.get('/teachers', getAllTeachers);
router.get('/teachers/:id', getTeacherById);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Subject Management
router.get('/subjects', getAllSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Fee Management
router.get('/fees', getAllFees);
router.post('/fees', createFee);
router.put('/fees/:id', updateFee);
router.delete('/fees/:id', deleteFee);

export default router;