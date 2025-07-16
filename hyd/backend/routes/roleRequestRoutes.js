import express from 'express';
import {
  createRoleRequest,
  getUserRoleRequests,
  getAllRoleRequests,
  reviewRoleRequest,
  getPendingRequestsCount
} from '../controllers/roleRequestController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js'; // Changed from auth.js to authMiddleware.js

const router = express.Router();

// Employee/Admin routes
router.post('/create', protect, createRoleRequest);
router.get('/my-requests', protect, getUserRoleRequests);

// SuperAdmin routes
router.get('/all', protect, isSuperAdmin, getAllRoleRequests);
router.put('/review/:id', protect, isSuperAdmin, reviewRoleRequest);
router.get('/pending-count', protect, isSuperAdmin, getPendingRequestsCount);

export default router;