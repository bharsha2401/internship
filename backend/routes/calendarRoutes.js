import express from 'express';
import { createEvent, getAllEvents } from '../controllers/calendarController.js';

const router = express.Router();

router.post('/create', createEvent);
router.get('/all', getAllEvents);

export default router;
