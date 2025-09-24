// client/src/employee/components/MyBookings.js

import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [userId, token]);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get(`/api/bookings/user/${userId}`);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = (start - now) / (1000 * 60 * 60); // in hours
    if (diff <= 1) {
      setMessage('You can only cancel bookings more than 1 hour before start time.');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiClient.delete(`/api/bookings/${bookingId}`);
      setMessage('Booking cancelled.');
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
      padding: '0',
      margin: '0'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '40px auto',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(30,64,175,0.10)',
        padding: '40px 48px',
        minHeight: 'calc(100vh - 120px)',
        boxSizing: 'border-box'
      }}>
        <h2 style={{
          marginBottom: '28px',
          fontSize: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#1976d2',
          fontWeight: 700
        }}>
          <span role="img" aria-label="bookings">📋</span> My Bookings
        </h2>
        {message && (
          <p style={{
            color: message.includes('cancel') ? '#388e3c' : '#d32f2f',
            fontWeight: 500,
            marginBottom: '18px'
          }}>{message}</p>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center' }}>No bookings found.</p>
        ) : (
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(30,64,175,0.08)',
            background: '#f8fafc'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={cellHeader}>Room</th>
                  <th style={cellHeader}>Start</th>
                  <th style={cellHeader}>End</th>
                  <th style={cellHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: '1px solid #e3e7ee' }}>
                    <td style={cell}>{booking.room?.name}</td>
                    <td style={cell}>{new Date(booking.startTime).toLocaleString()}</td>
                    <td style={cell}>{new Date(booking.endTime).toLocaleString()}</td>
                    <td style={cell}>
                      <button
                        onClick={() => handleCancel(booking._id, booking.startTime)}
                        style={{
                          padding: '7px 18px',
                          background: '#d32f2f',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.2s, transform 0.1s'
                        }}
                        onMouseOver={e => (e.target.style.background = '#b71c1c')}
                        onMouseOut={e => (e.target.style.background = '#d32f2f')}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const cellHeader = {
  border: '1px solid #e3e7ee',
  padding: '16px',
  textAlign: 'center',
  fontSize: '1.08rem',
  fontWeight: 700,
  color: '#1a237e',
  background: '#f5f5f5'
};

const cell = {
  border: '1px solid #e3e7ee',
  padding: '14px',
  textAlign: 'center',
  fontSize: '1rem',
  background: '#fff'
};

export default MyBookings;
