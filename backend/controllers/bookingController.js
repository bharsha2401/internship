import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../utils/mailer.js';

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room', 'name')
      .populate('bookedBy', 'email name role');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { room, date, time } = req.body;
    if (!room || !date || !time) {
      return res.status(400).json({ message: 'Room, date, and time are required' });
    }

    // Combine date and time as a local datetime string
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Check for time conflict
    const conflict = await Booking.findOne({
      room,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (conflict) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const newBooking = new Booking({
      room,
      bookedBy: req.user._id,
      startTime,
      endTime
    });
    await newBooking.save();

    // Fetch user and room details
    const user = await User.findById(req.user._id);
    const roomObj = await Room.findById(room);

    const startTimeStr = newBooking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = newBooking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await sendBookingConfirmation(
      user.email,
      roomObj.name,
      date,
      startTimeStr,
      endTimeStr,
      user.name || 'User'  // Add user name here
    );

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('bookedBy')
      .populate('room');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Permission check: Only SuperAdmin, Admin, or the user who booked can cancel
    const userRole = req.user.role;
    const userId = req.user._id.toString();
    const bookedById = booking.bookedBy._id.toString();

    if (
      userRole !== 'SuperAdmin' &&
      userRole !== 'Admin' &&
      userId !== bookedById
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    // Send cancellation email
    try {
      await sendBookingCancellation(
        booking.bookedBy.email,
        booking.room.name,
        booking.startTime.toLocaleDateString(),
        booking.startTime.toLocaleTimeString(),
        booking.bookedBy.name || 'User'  // Add user name here
      );
    } catch (mailErr) {
      console.error('Failed to send cancellation email:', mailErr);
    }

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Cancellation failed', error: err.message });
  }
};