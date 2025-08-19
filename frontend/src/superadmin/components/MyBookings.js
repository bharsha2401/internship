import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchBookings();
  }, [userId, token]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Booking cancelled successfully.');
      fetchBookings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#1976d2'
      }}>
        Loading your bookings...
      </div>
    );
  }

  // FIXED: Separate bookings into upcoming and past with correct logic
  const now = new Date();
  const upcomingBookings = bookings.filter(booking => {
    const bookingEndTime = new Date(booking.endTime);
    return bookingEndTime > now; // Booking is upcoming if end time is in the future
  });
  
  const pastBookings = bookings.filter(booking => {
    const bookingEndTime = new Date(booking.endTime);
    return bookingEndTime <= now; // Booking is past if end time has passed
  });

  const renderBookingsTable = (bookingsData, showActions = false) => (
    <div style={{
      overflowX: 'auto',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(30,64,175,0.08)',
      background: '#f8fafc',
      marginBottom: '20px'
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
            <th style={cellHeader}>Start Time</th>
            <th style={cellHeader}>End Time</th>
            <th style={cellHeader}>Status</th>
            {showActions && <th style={cellHeader}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {bookingsData.map((booking) => {
            const now = new Date();
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            
            // Determine status based on current time
            let status = 'Completed';
            let statusColor = '#856404';
            let statusBg = '#fff3cd';
            
            if (startTime > now) {
              status = 'Upcoming';
              statusColor = '#2e7d32';
              statusBg = '#e8f5e8';
            } else if (startTime <= now && endTime > now) {
              status = 'Ongoing';
              statusColor = '#1976d2';
              statusBg = '#e3f2fd';
            }
            
            return (
              <tr key={booking._id} style={{ borderBottom: '1px solid #e3e7ee' }}>
                <td style={cell}>
                  <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {booking.room?.name}
                  </div>
                </td>
                <td style={cell}>{formatDateTime(booking.startTime)}</td>
                <td style={cell}>{formatDateTime(booking.endTime)}</td>
                <td style={cell}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    backgroundColor: statusBg,
                    color: statusColor
                  }}>
                    {status}
                  </span>
                </td>
                {showActions && (
                  <td style={cell}>
                    {(status === 'Upcoming' || status === 'Ongoing') && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        style={{
                          padding: '8px 16px',
                          background: '#d32f2f',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s, transform 0.1s'
                        }}
                        onMouseOver={e => {
                          e.target.style.background = '#b71c1c';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={e => {
                          e.target.style.background = '#d32f2f';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
      padding: '0',
      margin: '0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1000px',
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
            color: message.includes('success') ? '#388e3c' : '#d32f2f',
            fontWeight: 500,
            marginBottom: '18px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: message.includes('success') ? '#e8f5e8' : '#fdeaea'
          }}>{message}</p>
        )}
        
        {bookings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
            <h3 style={{ color: '#888', fontSize: '1.2rem' }}>No bookings found</h3>
            <p style={{ color: '#999' }}>You haven't made any room bookings yet.</p>
          </div>
        ) : (
          <>
            {/* Upcoming Meetings Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                color: '#2e7d32',
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔮 Upcoming Meetings ({upcomingBookings.length})
              </h3>
              
              {upcomingBookings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏰</div>
                  <p>No upcoming meetings scheduled</p>
                </div>
              ) : (
                renderBookingsTable(upcomingBookings, true) // Show action buttons for upcoming
              )}
            </div>

            {/* Past Meetings Section */}
            <div>
              <h3 style={{
                color: '#856404',
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📚 Past Meetings ({pastBookings.length})
              </h3>
              
              {pastBookings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📖</div>
                  <p>No past meetings found</p>
                </div>
              ) : (
                renderBookingsTable(pastBookings, false) // No action buttons for past meetings
              )}
            </div>
          </>
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