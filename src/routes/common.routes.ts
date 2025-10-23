import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { updateProfile, getDepartments, uploadAvatar } from '../controllers/common.controller';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.use(authenticate);

router.put('/profile', updateProfile);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);
router.get('/departments', getDepartments);

export default router;