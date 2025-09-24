import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      setBookings([]);
    }
  };

  // Only allow admin to cancel their own bookings and employee bookings, not superadmin bookings
  const canCancel = (booking) => {
    if (role !== 'Admin') return false;
    const bookedByRole = booking.bookedBy?.role;
    const bookedById = booking.bookedBy?._id || booking.bookedBy;
    if (bookedByRole === 'SuperAdmin') return false;
    if (bookedById === userId) return true; // Admin's own booking
    if (bookedByRole === 'Employee') return true;
    return false;
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiClient.delete(`/api/bookings/${bookingId}`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const cell = {
    border: '1px solid #e3e7ee',
    padding: '14px',
    textAlign: 'center',
    fontSize: '1rem'
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1200px',
      margin: '40px auto',
      background: '#f7f8fa',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        marginBottom: '25px',
        fontSize: '2.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#1976d2',
        fontWeight: 700
      }}>
        <span role="img" aria-label="bookings">🗒️</span> All Bookings
      </h2>
      <div style={{
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '0',
        marginTop: '30px',
        minHeight: 'unset',
        boxSizing: 'border-box',
        border: '1px solid #e3e7ee',
        overflowX: 'auto'
      }}>
        <style>
          {`
            div[style*="overflow-x: auto"]::-webkit-scrollbar {
              height: 14px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
              background: #bfc9d1;
              border-radius: 8px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-track {
              background: #f7f8fa;
            }
          `}
        </style>
        {bookings.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>No bookings found.</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            border: '1px solid #e3e7ee'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={cell}>Room</th>
                <th style={cell}>Booked By</th>
                <th style={cell}>Start</th>
                <th style={cell}>End</th>
                <th style={cell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td style={cell}>{booking.room?.name || 'Room'}</td>
                  <td style={cell}>
                    {booking.bookedBy?.name
                      ? `${booking.bookedBy.name} (${booking.bookedBy.email})`
                      : booking.bookedBy?.email || 'Unknown'}
                  </td>
                  <td style={cell}>{formatDateTime(booking.startTime)}</td>
                  <td style={cell}>{formatDateTime(booking.endTime)}</td>
                  <td style={cell}>
                    {canCancel(booking) && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        style={{
                          padding: '7px 18px',
                          background: '#d32f2f',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewBookings;
