import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiClient from '../../apiClient';
import apiClient from '../../apiClient';
import { useNavigate } from 'react-router-dom';
import RoleUpgradeRequest from '../../components/RoleUpgradeRequest';

const AdminLandingPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const userName = localStorage.getItem('name') || 'Admin';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch announcements
      const announcementsRes = await axios.get('http://localhost:5000/api/announcements/all');
      setAnnouncements(announcementsRes.data.slice(0, 3));

      // Fetch polls
  const pollsRes = await apiClient.get('/api/polls/all');
      setPolls(pollsRes.data.slice(0, 2));

      // Fetch current admin's bookings only - FIXED
      const bookingsRes = await axios.get(`http://localhost:5000/api/bookings/user/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Filter only today's bookings (already filtered by current user)
      const todaysBookings = bookingsRes.data.filter(booking => {
        const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
        return bookingDate === todayStr;
      });
      
      setTodayBookings(todaysBookings);

      // Fetch recent issues
      const issuesRes = await apiClient.get('/api/issues/all');
      setRecentIssues(Array.isArray(issuesRes.data) ? issuesRes.data.slice(0, 3) : []);

      // Fetch calendar events
      const calendarRes = await axios.get('http://localhost:5000/api/calendar/all');
      const todaysEvents = calendarRes.data.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === todayStr;
      });
      setCalendarEvents(todaysEvents);

      // Calculate stats
      setStats({
        totalBookings: bookingsRes.data.length || 0, // Admin's total bookings
        todayBookings: todaysBookings.length || 0, // Admin's today bookings
        totalIssues: Array.isArray(issuesRes.data) ? issuesRes.data.length : 0,
        totalPolls: pollsRes.data.length || 0
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setRecentIssues([]);
      setAnnouncements([]);
      setPolls([]);
      setTodayBookings([]);
      setCalendarEvents([]);
      setStats({
        totalBookings: 0,
        todayBookings: 0,
        totalIssues: 0,
        totalPolls: 0
      });
    } finally {
      setLoading(false);
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
        Loading admin dashboard...
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
            Admin Dashboard 👨‍💼
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            margin: 0
          }}>
            Welcome back, {userName}! - {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Overview - CLICKABLE CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div 
            onClick={() => navigate('/admin/view-bookings')}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
              {stats.todayBookings || 0}
            </div>
            <div style={{ color: '#666' }}>My Today's Meetings</div>
          </div>
          
          <div 
            onClick={() => navigate('/admin/view-issues')}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛠️</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
              {stats.totalIssues || 0}
            </div>
            <div style={{ color: '#666' }}>Total Issues</div>
          </div>
          
          <div 
            onClick={() => navigate('/admin/add-pool')}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗳️</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#43a047' }}>
              {stats.totalPolls || 0}
            </div>
            <div style={{ color: '#666' }}>Active Polls</div>
          </div>

          <div 
            onClick={() => navigate('/admin/calendar')}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>
              {calendarEvents.length || 0}
            </div>
            <div style={{ color: '#666' }}>Today's Events</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{
            color: '#1976d2',
            marginBottom: '16px',
            fontSize: '1.3rem'
          }}>
            ⚡ Quick Actions
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px' 
          }}>
            <button
              onClick={() => navigate('/admin/announcements')}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              📢 Post Announcement
            </button>
            <button
              onClick={() => navigate('/admin/book-room')}
              style={{
                background: '#43a047',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🏢 Book Room
            </button>
            <button
              onClick={() => navigate('/admin/add-pool')}
              style={{
                background: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🗳️ Create Poll
            </button>
            <button
              onClick={() => navigate('/admin/view-issues')}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🛠️ View Issues
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* My Today's Meetings */}
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
              📅 My Today's Meetings
            </h3>
            {todayBookings.length === 0 ? (
              <p style={{ color: '#888' }}>No meetings scheduled for today</p>
            ) : (
              <div>
                {todayBookings.map(booking => (
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
                      {new Date(booking.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(booking.endTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/admin/view-bookings')}
                  style={{
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View All My Bookings
                </button>
              </div>
            )}
          </div>

          {/* Recent Issues */}
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
              🛠️ Recent Issues
            </h3>
            {recentIssues.length === 0 ? (
              <p style={{ color: '#888' }}>No recent issues</p>
            ) : (
              <div>
                {recentIssues.map(issue => (
                  <div key={issue._id} style={{
                    padding: '12px',
                    border: '1px solid #e3e9ee',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {issue.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Priority: {issue.priority} | Status: {issue.status}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/admin/view-issues')}
                  style={{
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View All Issues
                </button>
              </div>
            )}
          </div>

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
              <p style={{ color: '#888' }}>No announcements</p>
            ) : (
              <div>
                {announcements.map(announcement => (
                  <div key={announcement._id} style={{
                    padding: '12px',
                    border: '1px solid #e3e9ee',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {announcement.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {announcement.message.substring(0, 100)}...
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/admin/announcements')}
                  style={{
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Announcements
                </button>
              </div>
            )}
          </div>

          {/* Today's Events */}
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
              🎯 Today's Events
            </h3>
            {calendarEvents.length === 0 ? (
              <p style={{ color: '#888' }}>No events scheduled for today</p>
            ) : (
              <div>
                {calendarEvents.map(event => (
                  <div key={event._id} style={{
                    padding: '12px',
                    border: '1px solid #e3e9ee',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: '#fff3e0'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {event.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {event.description}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/admin/calendar')}
                  style={{
                    background: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Calendar
                </button>
              </div>
            )}
          </div>

          {/* Role Upgrade Request - ADD THIS BEFORE THE CLOSING DIVS */}
          <RoleUpgradeRequest />
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;