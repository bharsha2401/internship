// server/routes/userRoutes.js
import express from 'express';
import { getUsers, updateUserRole, getTodaysBirthdays } from '../controllers/userController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js'; // Make sure this path is correct

const router = express.Router();

// ✅ Only SuperAdmin can view all users
router.get('/', protect, isSuperAdmin, getUsers);

// ✅ Only SuperAdmin can assign roles
router.put('/:id/role', protect, isSuperAdmin, updateUserRole);

// ✅ Anyone can view today's birthdays
router.get('/employees/birthdays', getTodaysBirthdays);

export default router;
