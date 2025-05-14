import express from 'express';
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend
} from '../controllers/friend.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', protect, sendFriendRequest);
router.post('/respond', protect, respondToFriendRequest);
router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);
router.delete('/:friendId', protect, removeFriend);

export default router;