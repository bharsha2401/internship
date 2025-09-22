// server/routes/userRoutes.js
import express from 'express';
import { getUsers, updateUserRole, getTodaysBirthdays, getUsersCount, cleanupDuplicateUsers } from '../controllers/userController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js'; // Make sure this path is correct
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// ✅ Only SuperAdmin can view all users
router.get('/', protect, isSuperAdmin, getUsers);

// ✅ Get unique users count for dashboard
router.get('/count', protect, isSuperAdmin, getUsersCount);

// ✅ Clean up duplicate users (SuperAdmin only)
router.delete('/cleanup-duplicates', protect, isSuperAdmin, cleanupDuplicateUsers);

// ✅ Only SuperAdmin can assign roles
router.put('/:id/role', protect, isSuperAdmin, updateUserRole);

// ✅ Anyone can view today's birthdays
router.get('/employees/birthdays', getTodaysBirthdays);

// Maintenance: reset default seeded account passwords if they drift
// POST /api/users/maintenance/reset-default-passwords
router.post('/maintenance/reset-default-passwords', protect, isSuperAdmin, async (req, res) => {
  try {
    const defaults = [
      { email: 'superadmin@incorgroup.com', password: 'superadmin123' },
      { email: 'admin@incorgroup.com', password: 'admin123' },
      { email: 'employee@incorgroup.com', password: 'employee123' }
    ];
    const results = [];
    for (const acc of defaults) {
      const user = await User.findOne({ email: acc.email });
      if (user) {
        const match = await bcrypt.compare(acc.password, user.password || '');
        if (!match) {
          user.password = await bcrypt.hash(acc.password, 10);
          await user.save();
          results.push({ email: acc.email, reset: true });
        } else {
          results.push({ email: acc.email, reset: false });
        }
      } else {
        results.push({ email: acc.email, reset: false, missing: true });
      }
    }
    return res.json({ message: 'Default password check complete', results });
  } catch (err) {
    console.error('[maintenance/reset-default-passwords] error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
