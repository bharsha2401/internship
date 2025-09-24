import express from 'express';
import { createBooking, getAllBookings, cancelBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js'; // <-- Add this line

const router = express.Router();

router.get('/', protect, getAllBookings);
router.post('/', protect, createBooking);

// Cancel a booking (add this line)
router.delete('/:id', protect, cancelBooking);

// Current authenticated user's bookings (no need to pass userId from client)
router.get('/me', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.user._id })
      .populate('room', 'name')
      .populate('bookedBy', 'email');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching current user bookings', error: err.message });
  }
});

// Optional: Get bookings for a specific user
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.params.userId })
      .populate('room', 'name')
      .populate('bookedBy', 'email');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user bookings', error: err.message });
  }
});

export default router;
