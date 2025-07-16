import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // store role on login
  const userId = localStorage.getItem('userId'); // store userId on login

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const canCancel = (booking) => {
    const now = new Date();
    const start = new Date(booking.startTime);
    const diff = (start - now) / (1000 * 60 * 60); // in hours
    return role === 'SuperAdmin' || role === 'Admin' || (booking.bookedBy._id === userId && diff > 1);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>All Room Bookings</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={cell}>Room</th>
            <th style={cell}>Booked By</th>
            <th style={cell}>Start</th>
            <th style={cell}>End</th>
            <th style={cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td style={cell}>{b.room?.name}</td>
              <td style={cell}>
                {b.bookedBy?.name
                  ? `${b.bookedBy.name} (${b.bookedBy.email})`
                  : b.bookedBy?.email}
              </td>
              <td style={cell}>{new Date(b.startTime).toLocaleString()}</td>
              <td style={cell}>{new Date(b.endTime).toLocaleString()}</td>
              <td style={cell}>
                {canCancel(b) && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    style={{ padding: '5px 10px', background: 'crimson', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const cell = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center'
};

export default BookingList;
