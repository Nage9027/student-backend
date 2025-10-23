import express from 'express';
import { login, registerStudent } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/register/student', registerStudent);

export default router;