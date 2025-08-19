import express from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getEmployeeAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';

const router = express.Router();

// Admin
router.post('/create', createAnnouncement);
router.put('/update/:id', updateAnnouncement);
router.delete('/delete/:id', deleteAnnouncement);

// Admin + Super Admin
router.get('/all', getAllAnnouncements);

// Employee
router.get('/view', getEmployeeAnnouncements);

export default router;
