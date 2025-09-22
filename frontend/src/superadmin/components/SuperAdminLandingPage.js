import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const SuperadminLandingPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRoleRequests, setPendingRoleRequests] = useState(0);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  let currentUserId = localStorage.getItem('userId');

  if (!currentUserId || currentUserId === 'undefined' || currentUserId === 'null') {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        currentUserId = decoded.userId || decoded._id || decoded.id || decoded.sub || null;
        if (currentUserId) {
          localStorage.setItem('userId', currentUserId);
          console.log('[SuperAdminLandingPage] Derived userId from token:', currentUserId);
        } else {
          console.warn('[SuperAdminLandingPage] Token decoded but no id field present.');
        }
      } catch (e) {
        console.warn('[SuperAdminLandingPage] Failed to decode token for userId:', e.message);
      }
    }
  }

  const userName = localStorage.getItem('name') || 'Super Admin';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('🚀 Fetching dashboard data from:', apiUrl);

      const axiosInstance = axios.create({
        baseURL: apiUrl,
        timeout: 10000,
        headers: { Authorization: `Bearer ${token}` }
      });

      const requests = [
        axiosInstance.get('/api/announcements/all'),
        axiosInstance.get('/api/polls/all'),
        currentUserId ? axiosInstance.get(`/api/bookings/user/${currentUserId}`) : Promise.resolve({ data: [] }),
        axiosInstance.get('/api/issues/all'),
        axiosInstance.get('/api/users/count'),
        axiosInstance.get('/api/calendar/all'),
        axiosInstance.get('/api/bookings'),
        axiosInstance.get('/api/role-requests/pending-count')
      ];

      if (!currentUserId) {
        console.warn('[SuperAdminLandingPage] Skipping user bookings fetch: no valid userId.');
      }

      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled(requests);
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Process results with error handling
      const [
        announcementsRes,
        pollsRes, 
        bookingsRes,
        issuesRes,
        usersCountRes, // Changed from usersRes to usersCountRes
        calendarRes,
        allBookingsRes,
        roleRequestsRes
      ] = results;

      // Set announcements
      if (announcementsRes.status === 'fulfilled') {
        setAnnouncements(announcementsRes.value.data.slice(0, 3));
      } else {
        console.error('Failed to fetch announcements:', announcementsRes.reason);
        setAnnouncements([]);
      }

      // Set polls
      if (pollsRes.status === 'fulfilled') {
        setPolls(pollsRes.value.data.slice(0, 2));
      } else {
        console.error('Failed to fetch polls:', pollsRes.reason);
        setPolls([]);
      }

      // Set user bookings
      if (bookingsRes.status === 'fulfilled') {
        const todaysBookings = bookingsRes.value.data.filter(booking => {
          const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
          return bookingDate === todayStr;
        });
        setTodayBookings(todaysBookings);
      } else {
        console.error('Failed to fetch user bookings:', bookingsRes.reason);
        setTodayBookings([]);
      }

      // Set issues
      if (issuesRes.status === 'fulfilled') {
        setRecentIssues(Array.isArray(issuesRes.value.data) ? issuesRes.value.data.slice(0, 3) : []);
      } else {
        console.error('Failed to fetch issues:', issuesRes.reason);
        setRecentIssues([]);
      }

      // Set calendar events
      if (calendarRes.status === 'fulfilled') {
        const todaysEvents = calendarRes.value.data.filter(event => {
          const eventDate = new Date(event.date).toISOString().split('T')[0];
          return eventDate === todayStr;
        });
        setCalendarEvents(todaysEvents);
      } else {
        console.error('Failed to fetch calendar events:', calendarRes.reason);
        setCalendarEvents([]);
      }

      // Set pending role requests
      if (roleRequestsRes.status === 'fulfilled') {
        setPendingRoleRequests(roleRequestsRes.value.data.count || 0);
      } else {
        console.error('Failed to fetch role requests:', roleRequestsRes.reason);
        setPendingRoleRequests(0);
      }

      // Calculate stats
      let totalUsers = 0;
      let totalBookings = 0;
      let todayBookings = 0;
      let totalIssues = 0;
      let totalPolls = 0;
      let totalAnnouncements = 0;

      if (usersCountRes.status === 'fulfilled') {
        console.log('Users count API response:', usersCountRes.value.data);
        console.log('Unique users count:', usersCountRes.value.data.count);
        totalUsers = usersCountRes.value.data.count || 0;
      } else {
        console.error('Failed to fetch users count:', usersCountRes.reason);
      }

      if (allBookingsRes.status === 'fulfilled') {
        totalBookings = allBookingsRes.value.data.length || 0;
        const allTodaysBookings = allBookingsRes.value.data.filter(booking => {
          const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
          return bookingDate === todayStr;
        });
        todayBookings = allTodaysBookings.length || 0;
      }

      if (issuesRes.status === 'fulfilled') {
        totalIssues = Array.isArray(issuesRes.value.data) ? issuesRes.value.data.length : 0;
      }

      if (pollsRes.status === 'fulfilled') {
        totalPolls = pollsRes.value.data.length || 0;
      }

      if (announcementsRes.status === 'fulfilled') {
        totalAnnouncements = announcementsRes.value.data.length || 0;
      }

      setStats({
        totalUsers,
        totalBookings,
        todayBookings,
        totalIssues,
        totalPolls,
        totalAnnouncements
      });

      console.log('✅ Dashboard data loaded successfully:', {
        totalUsers,
        totalBookings,
        todayBookings,
        totalIssues,
        totalPolls,
        totalAnnouncements
      });
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('API URL being used:', process.env.REACT_APP_API_URL || 'http://localhost:5000');
      setError('Failed to load dashboard data. Please check if the server is running.');
      
      // Set empty states
      setRecentIssues([]);
      setAnnouncements([]);
      setPolls([]);
      setTodayBookings([]);
      setCalendarEvents([]);
      setPendingRoleRequests(0);
      setStats({
        totalUsers: 0,
        totalBookings: 0,
        todayBookings: 0,
        totalIssues: 0,
        totalPolls: 0,
        totalAnnouncements: 0
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
        color: '#1976d2',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>⏳ Loading super admin dashboard...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Connecting to: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>❌ {error}</div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAllData();
          }}
          style={{
            padding: '12px 24px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Retry
        </button>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Make sure the backend server is running on: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
        </div>
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
        maxWidth: '1400px',
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
            Super Admin Control Center 🚀
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            margin: '0 0 8px 0'
          }}>
            Welcome back, {userName}! - {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <div style={{
            fontSize: '0.9rem',
            color: '#888',
            background: '#f5f5f5',
            padding: '8px 12px',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            🌐 API Server: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
          </div>
        </div>

        {/* Stats Overview - CLICKABLE CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div 
            onClick={() => navigate('/super-admin/manage-roles')}
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
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
              {stats.totalUsers || 0}
            </div>
            <div style={{ color: '#666' }}>Total Users</div>
          </div>
          
          <div 
            onClick={() => navigate('/super-admin/all-bookings')}
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
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#43a047' }}>
              {stats.todayBookings || 0}
            </div>
            <div style={{ color: '#666' }}>Today's System Meetings</div>
          </div>
          
          <div 
            onClick={() => navigate('/super-admin/all-issues')}
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
            onClick={() => navigate('/super-admin/all-announcements')}
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
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📢</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>
              {stats.totalAnnouncements || 0}
            </div>
            <div style={{ color: '#666' }}>Announcements</div>
          </div>

          <div 
            onClick={() => navigate('/super-admin/create-poll')}
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
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00bcd4' }}>
              {stats.totalPolls || 0}
            </div>
            <div style={{ color: '#666' }}>Active Polls</div>
          </div>

          <div 
            onClick={() => navigate('/super-admin/calendar')}
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
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#795548' }}>
              {calendarEvents.length || 0}
            </div>
            <div style={{ color: '#666' }}>Today's Events</div>
          </div>

          <div 
            onClick={() => navigate('/super-admin/role-requests')}
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
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>
              {pendingRoleRequests || 0}
            </div>
            <div style={{ color: '#666' }}>Pending Role Requests</div>
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
              onClick={() => navigate('/super-admin/manage-roles')}
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
              👥 Manage Users
            </button>
            <button
              onClick={() => navigate('/super-admin/all-announcements')}
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
              📢 Post Announcement
            </button>
            <button
              onClick={() => navigate('/super-admin/manage-rooms')}
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
              🏢 Manage Rooms
            </button>
            <button
              onClick={() => navigate('/super-admin/create-poll')}
              style={{
                background: '#00bcd4',
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
              onClick={() => navigate('/super-admin/all-issues')}
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
              🛠️ View All Issues
            </button>
            <button
              onClick={() => navigate('/super-admin/role-requests')}
              style={{
                background: '#e91e63',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              📋 Review Role Requests
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
              <>
                {todayBookings.slice(0, 5).map(booking => (
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
                  onClick={() => navigate('/super-admin/all-bookings')}
                  style={{
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View All System Bookings
                </button>
              </>
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
              <>
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
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                      By: {issue.raisedBy?.name}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/super-admin/all-issues')}
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
              </>
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
              <>
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
                  onClick={() => navigate('/super-admin/all-announcements')}
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
              </>
            )}
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
              <>
                {polls.map(poll => (
                  <div key={poll._id} style={{
                    padding: '12px',
                    border: '1px solid #e3e9ee',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {poll.question}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {poll.options.reduce((total, opt) => total + opt.votes.length, 0)} total votes
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/super-admin/create-poll')}
                  style={{
                    background: '#00bcd4',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Polls
                </button>
              </>
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
              <>
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
                  onClick={() => navigate('/super-admin/calendar')}
                  style={{
                    background: '#795548',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Calendar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminLandingPage;