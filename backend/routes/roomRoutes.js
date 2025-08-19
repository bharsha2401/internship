// server/routes/roomRoutes.js
import express from 'express';
import { getAllRooms, addRoom, deleteRoom } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllRooms);
router.post('/', protect, addRoom);
router.delete('/:id', protect, deleteRoom);

export default router;
