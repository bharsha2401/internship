// Helper to check if a slot is booked for the selected room/date/duration
const isSlotBooked = (slot) => {
  if (!selectedRoom || !selectedDate || !duration) return false;
  const selected = new Date(selectedDate);
  const [h, m] = slot.split(':').map(Number);
  const slotStart = new Date(selectedDate);
  slotStart.setHours(h, m, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + Number(duration) * 60000);

  // Get bookings for this room and date
  const roomBookings = bookings.filter(
    (b) =>
      b.room?._id === selectedRoom &&
      new Date(b.startTime).toDateString() === selected.toDateString()
  );

  for (let b of roomBookings) {
    const bookingStart = new Date(b.startTime);
    const bookingEnd = new Date(b.endTime);
    if (slotStart < bookingEnd && slotEnd > bookingStart) {
      return true;
    }
  }
  return false;
};
import React, { useState, useEffect, useCallback } from 'react';;
import apiClient from '../apiClient';
import { toast } from 'react-toastify';

const DURATION_OPTIONS = [
  { label: '30 Minutes', value: 30 },
  { label: '1 Hour', value: 60 },
  { label: '2 Hours', value: 120 }
];

const BASE_TIMESLOTS = [
  '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const BookRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  // Helper: convert "13:30" to "01:30 PM"
  const to12Hour = (time) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = ((h + 11) % 12 + 1);
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper: get end time string in 12-hour format
  function getEndTime(startTime, duration) {
    if (!startTime || !duration) return '';
    const [h, m] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + Number(duration) * 60000);
    let hours = endDate.getHours();
    const minutes = endDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = ((hours + 11) % 12 + 1);
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  const fetchRooms = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/rooms');
      setRooms(res.data);
      if (res.data.length > 0) setSelectedRoom(res.data[0]._id);
    } catch (err) {
      setRooms([]);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, [fetchRooms, fetchBookings]);

  // Only allow booking for future time slots and filter out slots that are already booked for the selected duration
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !duration) return [];
    const today = new Date();
    const selected = new Date(selectedDate);

    // Get bookings for this room and date
    const roomBookings = bookings.filter(
      (b) =>
        b.room?._id === selectedRoom &&
        new Date(b.startTime).toDateString() === selected.toDateString()
    );

    // Helper to check if a slot is available for the selected duration
    const isSlotAvailable = (slot) => {
      const [h, m] = slot.split(':').map(Number);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(h, m, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + Number(duration) * 60000);

      // Don't allow slots that end after 19:00
      if (slotEnd.getHours() > 19 || (slotEnd.getHours() === 19 && slotEnd.getMinutes() > 0)) return false;

      // Don't allow past slots for today
      if (
        today.toDateString() === selected.toDateString() &&
        slotStart <= today
      ) {
        return false;
      }

      // Check for conflicts
      for (let b of roomBookings) {
        const bookingStart = new Date(b.startTime);
        const bookingEnd = new Date(b.endTime);
        if (
          (slotStart < bookingEnd && slotEnd > bookingStart)
        ) {
          return false;
        }
      }
      return true;
    };

    return BASE_TIMESLOTS.filter(isSlotAvailable);
  };

  // Helper to check if a slot is booked for the selected room/date/duration
  const isSlotBooked = (slot) => {
    if (!selectedRoom || !selectedDate || !duration) return false;
    const selected = new Date(selectedDate);
    const [h, m] = slot.split(':').map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + Number(duration) * 60000);

    // Get bookings for this room and date
    const roomBookings = bookings.filter(
      (b) =>
        b.room?._id === selectedRoom &&
        new Date(b.startTime).toDateString() === selected.toDateString()
    );

    for (let b of roomBookings) {
      const bookingStart = new Date(b.startTime);
      const bookingEnd = new Date(b.endTime);
      if (slotStart < bookingEnd && slotEnd > bookingStart) {
        return true;
      }
    }
    return false;
  };

  const handleBook = async () => {
    if (!selectedRoom || !selectedDate || !selectedTime || !duration) {
      toast.error('Please select all fields.', { position: 'top-right' });
      return;
    }

    // Check if selectedTime is still available
    if (!getAvailableTimeSlots().includes(selectedTime)) {
      toast.error('Time slot already booked', { position: 'top-right' });
      fetchBookings();
      return;
    }

    // Construct startTime and endTime as ISO strings
    const [h, m] = selectedTime.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(h, m, 0, 0);
    const endDate = new Date(bookingDate.getTime() + Number(duration) * 60000);

    try {
      await apiClient.post('/api/bookings', {
        room: selectedRoom,
        startTime: bookingDate.toISOString(),
        endTime: endDate.toISOString()
      });
      toast.success('Room booked successfully!', { position: 'top-right' });
      setSelectedTime('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed', { position: 'top-right' });
      fetchBookings();
      return;
    }
  };

  // Helper to format date as YYYY-MM-DD
  const formatDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const canCancel = (booking) => {
    if (role === 'SuperAdmin') return true;
    if (role === 'Admin') {
      const bookedByRole = booking.bookedBy?.role;
      const bookedById = booking.bookedBy?._id || booking.bookedBy;
      if (bookedByRole === 'SuperAdmin') return false;
      if (bookedById === userId) return true;
      if (bookedByRole === 'Employee') return true;
      return false;
    }
    if (role === 'Employee' && (booking.bookedBy?._id === userId || booking.bookedBy === userId)) return true;
    return false;
  };

  function formatTimeRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { hour: '2-digit', minute: '2-digit' };
    return `${startDate.toLocaleTimeString([], options)} - ${endDate.toLocaleTimeString([], options)}`;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>📅 Book Room</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Room:</label>
          <select
            value={selectedRoom}
            onChange={(e) => { setSelectedRoom(e.target.value); setDuration(''); setSelectedTime(''); }}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setDuration(''); setSelectedTime(''); }}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            min={formatDate(new Date())}
          />
        </div>

        {/* Duration dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Duration:</label>
          <select
            value={duration}
            onChange={e => { setDuration(e.target.value); setSelectedTime(''); }}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            disabled={!selectedDate}
          >
            <option value="">Select Duration</option>
            {DURATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {duration && selectedTime && (
          <div style={{ margin: '10px 0', fontWeight: 'bold', color: '#1976d2' }}>
            From: {to12Hour(selectedTime)} &nbsp; To: {getEndTime(selectedTime, duration)}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Time Slot:</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Select</option>
            {BASE_TIMESLOTS.map((slot, idx) => {
              const booked = isSlotBooked(slot);
              return (
                <option
                  key={idx}
                  value={slot}
                  disabled={booked}
                  style={{
                    color: booked ? '#d32f2f' : '#222',
                    background: booked ? '#fdeaea' : '#fff',
                    fontStyle: booked ? 'italic' : 'normal',
                    opacity: booked ? 0.7 : 1
                  }}
                >
                  {to12Hour(slot)}{booked ? ' (Unavailable)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Show a separate list of booked slots below the dropdown */}
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ marginBottom: '8px', color: '#d32f2f' }}>Booked Time Slots:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {BASE_TIMESLOTS.filter(isSlotBooked).length === 0 ? (
              <span style={{ color: '#888' }}>No slots booked for this room/date/duration.</span>
            ) : (
              BASE_TIMESLOTS.filter(isSlotBooked).map((slot, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#fdeaea',
                    color: '#d32f2f',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    border: '1px solid #d32f2f',
                    marginBottom: '4px'
                  }}
                >
                  {to12Hour(slot)} (Unavailable)
                </span>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleBook}
          style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Book
        </button>
      </div>

      {message && (
        <div style={{ marginBottom: '20px', padding: '10px', borderRadius: '6px', backgroundColor: '#e1f5fe', color: '#01579b', border: '1px solid #b3e5fc', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        Current Bookings
      </h3>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {bookings
          .filter(
            (booking) =>
              (!selectedRoom || booking.room?._id === selectedRoom) &&
              (!selectedDate ||
                formatDate(new Date(booking.startTime)) === selectedDate)
          )
          .map((booking, index) => (
            <li key={index} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                <strong>{booking.room?.name || 'Room'}</strong> -{' '}
                {new Date(booking.startTime).toLocaleDateString()},{' '}
                {formatTimeRange(booking.startTime, booking.endTime)} -{' '}
                <em>{booking.bookedBy?.email || 'Unknown'}</em>
              </span>
              {canCancel(booking) && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                    try {
                      await apiClient.delete(`/api/bookings/${booking._id}`);
                      toast.success('Booking cancelled.');
                      fetchBookings();
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to cancel booking');
                    }
                  }}
                  style={{
                    marginLeft: '10px',
                    padding: '6px 14px',
                    background: 'crimson',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default BookRoom;