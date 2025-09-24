// client/src/shared/BookRoom.js

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../apiClient';

const BookRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  const timeslots = [
    '09:30', '10:30', '11:30', '12:30', '13:30', '14:30',
    '15:30', '16:30', '17:30', '18:30'
  ];

  const to12Hour = (time) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = ((h + 11) % 12 + 1);
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

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

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeslots;
    const today = new Date();
    const selected = new Date(selectedDate);
    if (
      today.getFullYear() === selected.getFullYear() &&
      today.getMonth() === selected.getMonth() &&
      today.getDate() === selected.getDate()
    ) {
      const nowMinutes = today.getHours() * 60 + today.getMinutes();
      return timeslots.filter((slot) => {
        const [h, m] = slot.split(':').map(Number);
        const slotMinutes = h * 60 + m;
        return slotMinutes > nowMinutes;
      });
    }
    return timeslots;
  };

  const handleBook = async () => {
    if (!selectedRoom || !selectedDate || !selectedTime) {
      setMessage('Please select all fields.');
      return;
    }

    const today = new Date();
    const [h, m] = selectedTime.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(h, m, 0, 0);

    if (
      today.getFullYear() === bookingDate.getFullYear() &&
      today.getMonth() === bookingDate.getMonth() &&
      today.getDate() === bookingDate.getDate()
    ) {
      if (bookingDate <= today) {
        setMessage('Cannot book a slot that has already passed.');
        return;
      }
    }

    try {
      await apiClient.post('/api/bookings', {
        room: selectedRoom,
        date: selectedDate,
        time: selectedTime
      });
      setMessage('Room booked successfully!');
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

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

  return (
    <div
      style={{
        padding: '30px',
        maxWidth: '600px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>📅 Book Room</h2>
      {message && (
        <p style={{ textAlign: 'center', color: '#d9534f', fontWeight: 'bold' }}>{message}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleBook();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Room:</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            min={formatDate(new Date())}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Time Slot:</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Select</option>
            {getAvailableTimeSlots().map((slot, idx) => (
              <option key={idx} value={slot}>
                {to12Hour(slot)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Book
        </button>
      </form>

      <h3
        style={{
          borderBottom: '1px solid #ccc',
          paddingBottom: '10px',
          marginBottom: '20px',
        }}
      >
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
            <li
              key={index}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                <strong>{booking.room?.name || 'Room'}</strong> -{' '}
                {new Date(booking.startTime).toLocaleString()} -{' '}
                <em>{booking.bookedBy?.email || 'Unknown'}</em>
              </span>
              {canCancel(booking) && (
                <button
                  onClick={async () => {
                    if (
                      !window.confirm('Are you sure you want to cancel this booking?')
                    )
                      return;
                    try {
                      await apiClient.delete(`/api/bookings/${booking._id}`);
                      setMessage('Booking cancelled.');
                      fetchBookings();
                    } catch (err) {
                      setMessage(
                        err.response?.data?.message || 'Failed to cancel booking'
                      );
                    }
                  }}
                  style={{
                    marginLeft: '10px',
                    padding: '6px 14px',
                    background: 'crimson',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
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
