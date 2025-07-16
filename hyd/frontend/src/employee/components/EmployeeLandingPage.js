import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoleUpgradeRequest from '../../components/RoleUpgradeRequest';

const EmployeeLandingPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('name') || 'Employee';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch announcements
      const announcementsRes = await axios.get('http://localhost:5000/api/announcements/view');
      setAnnouncements(announcementsRes.data.slice(0, 3)); // Latest 3

      // Fetch polls
      const pollsRes = await axios.get('http://localhost:5000/api/polls/all');
      setPolls(pollsRes.data.slice(0, 3)); // Latest 3

      // Fetch my bookings
      const bookingsRes = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const todaysBookings = bookingsRes.data.filter(booking => {
        const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
        return bookingDate === todayStr;
      });
      
      const upcoming = bookingsRes.data.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate > today;
      }).slice(0, 3);

      setTodayBookings(todaysBookings);
      setUpcomingBookings(upcoming);

      // Fetch calendar events
      const calendarRes = await axios.get('http://localhost:5000/api/calendar/all');
      const todaysEvents = calendarRes.data.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === todayStr;
      });
      setCalendarEvents(todaysEvents);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionIdx) => {
    try {
      await axios.post(
        `http://localhost:5000/api/polls/vote/${pollId}/${optionIdx}`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData(); // Refresh data
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#1976d2'
      }}>
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Welcome Header */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#1976d2',
            margin: '0 0 8px 0',
            fontWeight: '700'
          }}>
            Welcome back, {userName}! 👋
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            margin: 0
          }}>
            Here's what's happening today - {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Today's Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Today's Schedule */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              color: '#1976d2',
              marginBottom: '16px',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📅 Today's Schedule
            </h3>
            
            {/* Today's Bookings */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: '#333', fontSize: '1rem', marginBottom: '8px' }}>My Meetings:</h4>
              {todayBookings.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.9rem' }}>No meetings scheduled</p>
              ) : (
                todayBookings.map(booking => (
                  <div key={booking._id} style={{
                    padding: '8px 12px',
                    border: '1px solid #e3e9ee',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                      {booking.room?.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {new Date(booking.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(booking.endTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Today's Events */}
            <div>
              <h4 style={{ color: '#333', fontSize: '1rem', marginBottom: '8px' }}>Events:</h4>
              {calendarEvents.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.9rem' }}>No events today</p>
              ) : (
                calendarEvents.map(event => (
                  <div key={event._id} style={{
                    padding: '8px 12px',
                    border: '1px solid #e3e9ee',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    background: '#fff3e0'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                      {event.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {event.description}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/employee/calendar')}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '12px',
                fontSize: '0.9rem'
              }}
            >
              View Full Calendar
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              color: '#1976d2',
              marginBottom: '16px',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚡ Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/employee/book-room')}
                style={{
                  background: '#43a047',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🏢 Book a Room
              </button>
              <button
                onClick={() => navigate('/employee/raise-issue')}
                style={{
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🛠️ Raise an Issue
              </button>
              <button
                onClick={() => navigate('/employee/my-bookings')}
                style={{
                  background: '#9c27b0',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📋 My Bookings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Latest Announcements */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              color: '#1976d2',
              marginBottom: '20px',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📢 Latest Announcements
            </h3>
            {announcements.length === 0 ? (
              <p style={{ color: '#888' }}>No announcements available</p>
            ) : (
              announcements.map(announcement => (
                <div key={announcement._id} style={{
                  padding: '16px',
                  border: '1px solid #e3e9ee',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  background: '#f8fafc'
                }}>
                  <h4 style={{
                    color: '#1976d2',
                    marginBottom: '8px',
                    fontSize: '1.1rem'
                  }}>
                    {announcement.title}
                  </h4>
                  <p style={{
                    color: '#333',
                    marginBottom: '8px',
                    lineHeight: '1.5'
                  }}>
                    {announcement.message}
                  </p>
                  <small style={{ color: '#888' }}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
            <button
              onClick={() => navigate('/employee/announcements')}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              View All Announcements
            </button>
          </div>

          {/* Active Polls */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              color: '#1976d2',
              marginBottom: '20px',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🗳️ Active Polls
            </h3>
            {polls.length === 0 ? (
              <p style={{ color: '#888' }}>No active polls</p>
            ) : (
              polls.map(poll => (
                <div key={poll._id} style={{
                  padding: '16px',
                  border: '1px solid #e3e9ee',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  background: '#f8fafc'
                }}>
                  <h4 style={{
                    color: '#1976d2',
                    marginBottom: '12px',
                    fontSize: '1.1rem'
                  }}>
                    {poll.question}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {poll.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVote(poll._id, idx)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #1976d2',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#1976d2',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#f0f8ff'}
                        onMouseOut={(e) => e.target.style.background = '#fff'}
                      >
                        {option.text} ({option.votes.length} votes)
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => navigate('/employee/view-polls')}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              View All Polls
            </button>
          </div>

          {/* Upcoming Meetings */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              color: '#1976d2',
              marginBottom: '20px',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📅 Upcoming Meetings
            </h3>
            {upcomingBookings.length === 0 ? (
              <p style={{ color: '#888' }}>No upcoming meetings</p>
            ) : (
              upcomingBookings.map(booking => (
                <div key={booking._id} style={{
                  padding: '12px',
                  border: '1px solid #e3e9ee',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  background: '#f8fafc'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {booking.room?.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {new Date(booking.startTime).toLocaleDateString()} at{' '}
                    {new Date(booking.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => navigate('/employee/my-bookings')}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              View All Bookings
            </button>
          </div>

          {/* THIS IS THE IMPORTANT PART - ADD THE ROLE UPGRADE REQUEST COMPONENT */}
          <RoleUpgradeRequest />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLandingPage;