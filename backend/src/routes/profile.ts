import express from 'express';
import { getProfile, updateProfile, updateSettings, updateNotificationPreferences } from '../controllers/profileController';
import { User } from '../models/user';
const router = express.Router();

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/settings', updateSettings);
router.put('/notifications', updateNotificationPreferences);

// Add user search route
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query) return res.json([]);
    // Search by username, full_name, or email (case-insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { full_name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('id username full_name email avatar_url');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router; 