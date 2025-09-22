import express from 'express';
import { createBooking, getAllBookings, cancelBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js'; // <-- Add this line

const router = express.Router();

router.get('/', protect, getAllBookings);
router.post('/', protect, createBooking);

// Cancel a booking (add this line)
router.delete('/:id', protect, cancelBooking);

// Optional: Get bookings for a specific user
router.get('/user/:userId', protect, async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId === 'undefined') {
    return res.status(400).json({ message: 'userId parameter is required' });
  }
  try {
    console.log(`[Bookings] Fetching bookings for userId=${userId}`);
    const bookings = await Booking.find({ bookedBy: userId })
      .populate('room', 'name')
      .populate('bookedBy', 'email');
    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    return res.status(500).json({ message: 'Error fetching user bookings', error: err.message });
  }
});

export default router;
