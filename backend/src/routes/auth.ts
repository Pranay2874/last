import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

export default router;