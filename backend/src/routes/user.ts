import express from 'express';
import { updateProfile, getUserStats } from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);

export default router;